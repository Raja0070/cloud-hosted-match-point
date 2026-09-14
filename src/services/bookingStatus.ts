import { STATUS_WEBHOOK_URL } from '../config';

export interface BookingStatusResult {
  success: boolean;
  bookingId?: string;
  status?: 'pending' | 'accepted' | 'rejected';
  message?: string;
  unconfigured?: boolean;
  raw?: unknown;
}

/**
 * Periodically checks the booking status from n8n using a GET request.
 * Matches: checkBookingStatus(bookingId)
 */
export async function checkBookingStatus(
  bookingId?: string,
  customStatusUrl?: string
): Promise<BookingStatusResult> {
  const dynamicBookingId =
    bookingId ||
    (typeof window !== 'undefined' ? localStorage.getItem('matchpointBookingId') || localStorage.getItem('matchpoint_booking_id') : '') ||
    '';

  const targetUrl = customStatusUrl || STATUS_WEBHOOK_URL;

  // If the status webhook URL is not configured yet
  if (!targetUrl || targetUrl === 'PASTE_N8N_STATUS_WEBHOOK_URL_HERE') {
    return {
      success: false,
      unconfigured: true,
      message: "Unable to check booking status. We'll try again.",
    };
  }

  try {
    // 1. Try via the local server proxy first (avoids browser CORS issues)
    const proxyUrl = `/api/webhook/status?url=${encodeURIComponent(targetUrl)}&bookingId=${encodeURIComponent(dynamicBookingId)}`;
    const response = await fetch(proxyUrl, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (response.ok) {
      const data = await response.json();
      const n8nPayload = data.data || data;

      return parseStatusPayload(n8nPayload, dynamicBookingId);
    }

    // If server proxy returned an error (e.g. 404 or 502)
    return {
      success: false,
      message: "Unable to check booking status. We'll try again.",
    };
  } catch {
    // 2. Direct browser fallback if proxy failed
    try {
      const separator = targetUrl.includes('?') ? '&' : '?';
      const directUrl = `${targetUrl}${separator}bookingId=${encodeURIComponent(dynamicBookingId)}`;

      const directRes = await fetch(directUrl, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });

      if (directRes.ok) {
        const directData = await directRes.json().catch(() => null);
        if (directData) {
          return parseStatusPayload(directData, dynamicBookingId);
        }
      }
    } catch {
      // Ignore direct fallback error and show non-intrusive retry message
    }

    return {
      success: false,
      message: "Unable to check booking status. We'll try again.",
    };
  }
}

function parseStatusPayload(payload: unknown, requestedBookingId: string): BookingStatusResult {
  let item: Record<string, unknown> = {};

  if (typeof payload === 'string') {
    try {
      const parsed = JSON.parse(payload);
      item = Array.isArray(parsed) ? (parsed[0] || {}) : (parsed && typeof parsed === 'object' ? parsed : {});
    } catch {
      // payload is raw string
    }
  } else if (Array.isArray(payload)) {
    item = payload[0] || {};
  } else if (payload && typeof payload === 'object') {
    item = payload as Record<string, unknown>;
  }

  const returnedId = (item.bookingId || item.id || requestedBookingId) as string;
  const rawStatus = String(item.status || item.bookingStatus || '').trim().toLowerCase();

  let normalizedStatus: 'pending' | 'accepted' | 'rejected' | undefined;
  if (rawStatus === 'accepted' || rawStatus.includes('accept') || rawStatus === 'approved') {
    normalizedStatus = 'accepted';
  } else if (rawStatus === 'rejected' || rawStatus.includes('reject') || rawStatus === 'declined' || rawStatus === 'cancelled') {
    normalizedStatus = 'rejected';
  } else if (rawStatus === 'pending' || rawStatus.includes('pend') || rawStatus.includes('review')) {
    normalizedStatus = 'pending';
  }

  if (normalizedStatus) {
    return {
      success: true,
      bookingId: returnedId,
      status: normalizedStatus,
      raw: payload,
    };
  }

  return {
    success: false,
    message: "Unable to check booking status. We'll try again.",
    raw: payload,
  };
}
