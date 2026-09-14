/**
 * MATCHPOINT AI - Webhook Configuration
 * Keep API URLs in clearly marked constants so they can easily be changed later.
 */

// Webhook URL for submitting court bookings (POST)
export const BOOKING_WEBHOOK_URL =
  'https://sudarshansoni.app.n8n.cloud/webhook-test/ab91394f-7565-412d-b82d-9100e545e83a';

// Clearly marked configuration constant for the status webhook (GET)
export const STATUS_WEBHOOK_URL =
  'https://sudarshansoni.app.n8n.cloud/webhook/matchpoint-booking-status';

// Polling interval for pending bookings (10 seconds)
export const STATUS_POLLING_INTERVAL_MS = 10000;
