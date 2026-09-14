export interface BookingFormData {
  date: string;
  studentName: string;
  studentId: string;
  startTime: string;
  endTime: string;
  matchActivity: string;
  facilityId: string;
}

export interface Facility {
  id: string;
  number: string;
  name: string;
  type: string;
  sport: 'basketball' | 'tennis' | 'badminton' | 'pickleball' | 'squash' | 'volleyball';
  location: string;
  surface: string;
  capacity: string;
  status: 'available' | 'in-use' | 'maintenance';
  currentOccupancy?: string;
  features: string[];
}

export type BookingStatusType = 'pending' | 'accepted' | 'rejected';

export interface BookingRecord {
  bookingId: string;
  studentName: string;
  studentId: string;
  date: string;
  startTime: string;
  endTime: string;
  matchActivity: string;
  facilityName: string;
  status: BookingStatusType;
  submittedAt: string;
  lastCheckedAt?: string;
  targetWebhookUrl?: string;
  statusWebhookUrl?: string;
  payload?: Record<string, unknown>;
}

export interface ConfirmedBooking {
  referenceCode: string;
  studentName: string;
  studentId: string;
  date: string;
  startTime: string;
  endTime: string;
  matchActivity: string;
  facilityName: string;
  timestamp: string;
  status?: BookingStatusType;
  webhookSent: boolean;
  webhookStatus?: string;
  webhookResponse?: {
    code?: number | string;
    message?: string;
    hint?: string;
    raw?: string;
  };
  targetWebhookUrl?: string;
  payload?: Record<string, unknown>;
}

export type ActiveTab = 'booking' | 'my-booking' | 'courts' | 'hub' | 'about';
