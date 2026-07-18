/** Canonical webhook event names emitted by the platform. */
export const WebhookEvent = {
  BookingCreated: 'booking.created',
  BookingCancelled: 'booking.cancelled',
  BookingRescheduled: 'booking.rescheduled',
} as const;

export type WebhookEvent = (typeof WebhookEvent)[keyof typeof WebhookEvent];

export interface WebhookJobData {
  deliveryId: string;
  webhookId: string;
  url: string;
  secret: string;
  event: string;
  payload: unknown;
}
