import 'reflect-metadata';

import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { type NestExpressApplication } from '@nestjs/platform-express';
import express from 'express';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import swaggerUi from 'swagger-ui-express';

import { AppModule } from './app.module';
import { AuthService } from './auth/auth.service';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { AppConfigService } from './config/app-config.service';
import { buildOpenApiDocument } from './openapi/openapi.document';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
    bufferLogs: true,
  });

  // Structured logging via pino.
  app.useLogger(app.get(Logger));

  const config = app.get(AppConfigService);
  const auth = app.get(AuthService);
  const logger = app.get(Logger);

  app.use(helmet());

  const corsOrigins = config.get('CORS_ORIGINS');
  app.enableCors({
    origin: corsOrigins ? corsOrigins.split(',').map((o) => o.trim()) : [config.get('WEB_URL')],
    credentials: true,
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-api-key',
      'x-organization-id',
      'x-request-id',
      'idempotency-key',
    ],
    exposedHeaders: ['x-request-id', 'X-RateLimit-Limit', 'X-RateLimit-Remaining', 'Retry-After'],
  });

  const expressApp = app.getHttpAdapter().getInstance();
  // Better Auth needs the raw body; mount before the JSON parser.
  expressApp.all('/api/auth/*', auth.nodeHandler);
  expressApp.use(express.json({ limit: '1mb' }));
  expressApp.use(express.urlencoded({ extended: true }));

  // OpenAPI spec + Swagger UI.
  const openApiDocument = buildOpenApiDocument(config.get('API_URL'));
  expressApp.get('/api/openapi.json', (_req, res) => res.json(openApiDocument));
  expressApp.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument, { customSiteTitle: 'INVINCIBLE PROS API' }));

  app.setGlobalPrefix('api', { exclude: ['api/auth/(.*)'] });
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.enableShutdownHooks();

  const port = config.get('API_PORT');
  await app.listen(port);
  logger.log(
    `API on ${config.get('API_URL')} · REST /api/v1 · GraphQL /api/graphql · Docs /api/docs`,
    'Bootstrap',
  );
}

void bootstrap();
