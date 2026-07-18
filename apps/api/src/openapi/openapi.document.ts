import { OpenAPIRegistry, OpenApiGeneratorV3, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import {
  cancelBookingSchema,
  createBookingSchema,
  createMeetingTypeSchema,
  createOrganizationSchema,
  createScheduleSchema,
  rescheduleBookingSchema,
} from '@invincible/utils';
import { z } from 'zod';

// Patch the shared Zod prototype with `.openapi()` so registered schemas
// (including those from @invincible/utils) can be introspected.
extendZodWithOpenApi(z);

/** Reusable response schemas (documentation only). */
const errorSchema = z.object({
  code: z.string(),
  message: z.string(),
  statusCode: z.number(),
  details: z.record(z.unknown()).optional(),
  requestId: z.string().optional(),
});

const tokenPairSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  tokenType: z.literal('Bearer'),
  expiresIn: z.string(),
});

const availableSlotSchema = z.object({
  start: z.string(),
  end: z.string(),
  seatsRemaining: z.number(),
});

const bookingSchema = z.object({
  id: z.string(),
  reference: z.string(),
  status: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  timeZone: z.string(),
});

function json(schema: z.ZodTypeAny) {
  return { content: { 'application/json': { schema } } };
}

/** Assemble the OpenAPI 3 document from the platform's Zod contracts. */
export function buildOpenApiDocument(serverUrl: string) {
  const registry = new OpenAPIRegistry();

  registry.registerComponent('securitySchemes', 'bearerAuth', {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
  });
  registry.registerComponent('securitySchemes', 'apiKey', {
    type: 'apiKey',
    in: 'header',
    name: 'x-api-key',
  });
  registry.registerComponent('securitySchemes', 'cookieAuth', {
    type: 'apiKey',
    in: 'cookie',
    name: 'better-auth.session_token',
  });

  const Error = registry.register('Error', errorSchema);

  // --- Auth ---
  registry.registerPath({
    method: 'post',
    path: '/api/v1/auth/token',
    tags: ['Auth'],
    summary: 'Exchange an authenticated session for a JWT token pair',
    security: [{ cookieAuth: [] }],
    responses: {
      201: { description: 'Token pair', ...json(tokenPairSchema) },
      401: { description: 'Unauthorized', ...json(Error) },
    },
  });
  registry.registerPath({
    method: 'post',
    path: '/api/v1/auth/refresh',
    tags: ['Auth'],
    summary: 'Rotate a refresh token',
    request: { body: json(z.object({ refreshToken: z.string() })) },
    responses: { 201: { description: 'New token pair', ...json(tokenPairSchema) } },
  });

  // --- Organizations ---
  registry.registerPath({
    method: 'post',
    path: '/api/v1/organizations',
    tags: ['Organizations'],
    summary: 'Create an organization',
    security: [{ bearerAuth: [] }, { cookieAuth: [] }],
    request: { body: json(createOrganizationSchema) },
    responses: { 201: { description: 'Created' }, 422: { description: 'Validation', ...json(Error) } },
  });

  // --- Schedules ---
  registry.registerPath({
    method: 'post',
    path: '/api/v1/schedules',
    tags: ['Schedules'],
    summary: 'Create an availability schedule',
    security: [{ bearerAuth: [] }],
    request: { body: json(createScheduleSchema) },
    responses: { 201: { description: 'Created' } },
  });

  // --- Meeting types ---
  registry.registerPath({
    method: 'post',
    path: '/api/v1/meeting-types',
    tags: ['Meeting Types'],
    summary: 'Create a meeting type',
    security: [{ bearerAuth: [] }],
    request: { body: json(createMeetingTypeSchema) },
    responses: { 201: { description: 'Created' }, 422: { description: 'Validation', ...json(Error) } },
  });

  // --- Public availability + bookings ---
  registry.registerPath({
    method: 'get',
    path: '/api/v1/public/meeting-types/{meetingTypeId}/availability',
    tags: ['Public'],
    summary: 'List bookable slots',
    request: {
      params: z.object({ meetingTypeId: z.string() }),
      query: z.object({
        from: z.string(),
        to: z.string(),
        timeZone: z.string(),
      }),
    },
    responses: { 200: { description: 'Slots', ...json(z.array(availableSlotSchema)) } },
  });
  registry.registerPath({
    method: 'post',
    path: '/api/v1/public/bookings',
    tags: ['Public'],
    summary: 'Create a booking',
    request: { body: json(createBookingSchema) },
    responses: {
      201: { description: 'Booking created', ...json(bookingSchema) },
      409: { description: 'Slot unavailable', ...json(Error) },
    },
  });
  registry.registerPath({
    method: 'post',
    path: '/api/v1/public/bookings/{reference}/reschedule',
    tags: ['Public'],
    summary: 'Reschedule a booking',
    request: { params: z.object({ reference: z.string() }), body: json(rescheduleBookingSchema) },
    responses: { 201: { description: 'Rescheduled', ...json(bookingSchema) } },
  });
  registry.registerPath({
    method: 'post',
    path: '/api/v1/public/bookings/{reference}/cancel',
    tags: ['Public'],
    summary: 'Cancel a booking',
    request: { params: z.object({ reference: z.string() }), body: json(cancelBookingSchema) },
    responses: { 200: { description: 'Cancelled', ...json(bookingSchema) } },
  });

  const generator = new OpenApiGeneratorV3(registry.definitions);
  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      title: 'INVINCIBLE PROS Scheduling API',
      version: '1.0.0',
      description: 'REST API for the INVINCIBLE PROS scheduling platform.',
    },
    servers: [{ url: serverUrl }],
  });
}
