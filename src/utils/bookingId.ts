/**
 * Generates a guaranteed unique booking ID in the format:
 * MP-YYYYMMDD-001, MP-YYYYMMDD-002, etc.
 * Uses persistent browser local sequence tracking + monotonic fallback.
 */
const inMemoryCounters: Record<string, number> = {};

export function generateUniqueBookingId(dateStr?: string): string {
  // Use booking date or current date formatted as YYYYMMDD
  const rawDate = dateStr || new Date().toISOString().split('T')[0];
  const dateKey = rawDate.replace(/[^0-9]/g, '').slice(0, 8); // e.g. "20260913"

  const storageKey = `ais_booking_seq_${dateKey}`;
  let seq = 1;

  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      seq = parseInt(stored, 10) + 1;
    }
    localStorage.setItem(storageKey, seq.toString());
  } catch {
    // If localStorage is unavailable, use in-memory monotonic counter
    seq = (inMemoryCounters[dateKey] = (inMemoryCounters[dateKey] || 0) + 1);
  }

  const paddedSeq = String(seq).padStart(3, '0');
  return `MP-${dateKey}-${paddedSeq}`;
}
