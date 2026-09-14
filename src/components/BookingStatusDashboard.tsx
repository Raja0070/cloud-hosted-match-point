import React, { useEffect, useState, useRef } from 'react';
import { BookingRecord, BookingStatusType } from '../types';
import { checkBookingStatus } from '../services/bookingStatus';
import { STATUS_POLLING_INTERVAL_MS, STATUS_WEBHOOK_URL } from '../config';
import { Clock, Plus, Loader2, RefreshCw, Calendar, Sparkles } from 'lucide-react';

interface BookingStatusDashboardProps {
  booking: BookingRecord;
  onStatusUpdate: (newStatus: BookingStatusType) => void;
  onBookAnother: () => void;
  statusWebhookUrl?: string;
  onUpdateStatusWebhookUrl?: (url: string) => void;
  showSubmittedHeading?: boolean;
}

export default function BookingStatusDashboard({
  booking,
  onStatusUpdate,
  onBookAnother,
  statusWebhookUrl = STATUS_WEBHOOK_URL,
  onUpdateStatusWebhookUrl,
  showSubmittedHeading = true,
}: BookingStatusDashboardProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [checkError, setCheckError] = useState<string | null>(null);
  const [lastCheckTime, setLastCheckTime] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [localStatusUrl, setLocalStatusUrl] = useState(statusWebhookUrl);

  const statusRef = useRef(booking.status);
  statusRef.current = booking.status;

  // Format date nicely
  const formatDate = (rawDate: string) => {
    try {
      const parts = rawDate.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
      }
      return rawDate;
    } catch {
      return rawDate;
    }
  };

  // Status check executor
  const performCheck = async (showSubtleIndicator = true) => {
    // If already finalized, do not poll
    if (statusRef.current === 'accepted' || statusRef.current === 'rejected') {
      return;
    }

    if (showSubtleIndicator) {
      setIsChecking(true);
    }

    try {
      const dynamicBookingId =
        (typeof window !== 'undefined' ? localStorage.getItem('matchpointBookingId') : null) ||
        booking.bookingId;

      const result = await checkBookingStatus(dynamicBookingId, localStatusUrl);
      setLastCheckTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

      if (result.success && result.status) {
        setCheckError(null);
        if (result.status !== statusRef.current) {
          onStatusUpdate(result.status);
        }
      } else {
        // If status API is temporarily unavailable:
        // Do not change current booking status.
        // Show subtle message: "Unable to check booking status. We'll try again."
        setCheckError("Unable to check booking status. We'll try again.");
      }
    } catch {
      setCheckError("Unable to check booking status. We'll try again.");
    } finally {
      setIsChecking(false);
    }
  };

  // 10-second polling effect while status is pending
  useEffect(() => {
    // If already finalized, no polling
    if (booking.status !== 'pending') {
      return;
    }

    // Run initial check after small delay
    const initialTimer = setTimeout(() => {
      performCheck(true);
    }, 1500);

    // Set 10-second recurring interval
    const interval = setInterval(() => {
      if (statusRef.current === 'pending') {
        performCheck(true);
      }
    }, STATUS_POLLING_INTERVAL_MS);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [booking.bookingId, booking.status, localStatusUrl]);

  // Status visual badge styling
  const renderStatusBadge = () => {
    if (booking.status === 'accepted') {
      return (
        <div id="status-badge-accepted" className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold text-xs sm:text-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
          <span>Booking Accepted</span>
        </div>
      );
    }

    if (booking.status === 'rejected') {
      return (
        <div id="status-badge-rejected" className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-800 font-semibold text-xs sm:text-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
          <span>Booking Rejected</span>
        </div>
      );
    }

    // Default: pending
    return (
      <div id="status-badge-pending" className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-semibold text-xs sm:text-sm">
        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shadow-sm shadow-amber-500/40" />
        <span>Yet to be reviewed</span>
      </div>
    );
  };

  return (
    <div id="booking-status-dashboard" className="py-4 text-center space-y-6 animate-in fade-in max-w-xl mx-auto">
      {/* Header section */}
      {showSubmittedHeading ? (
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-1 border border-emerald-100">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Booking Request Submitted</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Booking Request Submitted
          </h3>
          <p className="text-slate-600 text-sm max-w-md mx-auto">
            Your booking is yet to be reviewed.
          </p>
        </div>
      ) : (
        <div className="space-y-1 text-left">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Booking
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm">
            Live court reservation status synchronized with n8n approval workflow.
          </p>
        </div>
      )}

      {/* Main Booking Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm text-left space-y-5">
        
        {/* Top bar: Booking ID & Quick Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block mb-0.5">
              Booking ID
            </span>
            <span
              id="booking-id-display"
              className="text-lg sm:text-xl font-mono font-extrabold text-slate-900 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200 select-all"
            >
              {booking.bookingId}
            </span>
          </div>

          <div className="sm:text-right">
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block mb-1">
              Current Status
            </span>
            {renderStatusBadge()}
          </div>
        </div>

        {/* Prominent Booking Status Display with exact emojis & messages */}
        <div
          id="prominent-status-box"
          className={`p-4 sm:p-5 rounded-2xl border text-left transition-all duration-300 ${
            booking.status === 'accepted'
              ? 'bg-emerald-50/80 border-emerald-200'
              : booking.status === 'rejected'
              ? 'bg-rose-50/80 border-rose-200'
              : 'bg-amber-50/80 border-amber-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg" role="img" aria-label="status-indicator">
              {booking.status === 'accepted' ? '🟢' : booking.status === 'rejected' ? '🔴' : '🟡'}
            </span>
            <span
              id="prominent-status-headline"
              className={`font-bold text-base sm:text-lg ${
                booking.status === 'accepted'
                  ? 'text-emerald-900'
                  : booking.status === 'rejected'
                  ? 'text-rose-900'
                  : 'text-amber-900'
              }`}
            >
              {booking.status === 'accepted'
                ? 'Booking Accepted'
                : booking.status === 'rejected'
                ? 'Booking Rejected'
                : 'Yet to be reviewed'}
            </span>
          </div>
          <p
            id="prominent-status-message"
            className={`mt-1.5 text-xs sm:text-sm font-medium leading-relaxed ${
              booking.status === 'accepted'
                ? 'text-emerald-800'
                : booking.status === 'rejected'
                ? 'text-rose-800'
                : 'text-amber-800'
            }`}
          >
            {booking.status === 'accepted'
              ? 'Your court booking has been confirmed.'
              : booking.status === 'rejected'
              ? 'Unfortunately, your court booking request was rejected.'
              : 'Your booking request has been submitted and is waiting for approval.'}
          </p>
        </div>

        {/* Detailed Grid: Student Name, Student ID, Date, Match, Start Time, End Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
            <span className="text-slate-400 text-[11px] block font-medium">Student Name</span>
            <span id="booking-student-name" className="font-semibold text-slate-800 text-sm mt-0.5 block">
              {booking.studentName}
            </span>
          </div>

          <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
            <span className="text-slate-400 text-[11px] block font-medium">Student ID</span>
            <span id="booking-student-id" className="font-semibold text-slate-800 text-sm font-mono mt-0.5 block uppercase">
              {booking.studentId}
            </span>
          </div>

          <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
            <span className="text-slate-400 text-[11px] block font-medium">Date</span>
            <span id="booking-date" className="font-semibold text-slate-800 text-sm mt-0.5 block">
              {formatDate(booking.date)}
            </span>
          </div>

          <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
            <span className="text-slate-400 text-[11px] block font-medium">Match / Activity</span>
            <span id="booking-match-activity" className="font-semibold text-slate-800 text-sm mt-0.5 block">
              {booking.matchActivity || 'General Practice'}
            </span>
          </div>

          <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
            <span className="text-slate-400 text-[11px] block font-medium">Start Time</span>
            <span id="booking-start-time" className="font-semibold text-slate-800 text-sm mt-0.5 block flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {booking.startTime}
            </span>
          </div>

          <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
            <span className="text-slate-400 text-[11px] block font-medium">End Time</span>
            <span id="booking-end-time" className="font-semibold text-slate-800 text-sm mt-0.5 block flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {booking.endTime}
            </span>
          </div>
        </div>

        {/* Subtle Live Checking / Error Notification (Fixed Height Container to prevent layout jump) */}
        <div className="min-h-[32px] flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            {isChecking ? (
              <span id="status-checking-text" className="flex items-center gap-1.5 text-emerald-700 font-medium">
                <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
                Checking booking status...
              </span>
            ) : checkError ? (
              <span id="status-error-text" className="text-slate-500 font-medium">
                {checkError}
              </span>
            ) : booking.status === 'pending' ? (
              <span className="text-slate-500 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Live checking every 10s
                {lastCheckTime && <span className="text-slate-400">({lastCheckTime})</span>}
              </span>
            ) : (
              <span className="text-slate-600 font-medium">
                Status finalized &bull; Polling completed
              </span>
            )}
          </div>

          {booking.status === 'pending' && (
            <button
              type="button"
              id="manual-status-refresh-btn"
              onClick={() => performCheck(true)}
              disabled={isChecking}
              className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 text-[11px] font-medium transition-colors disabled:opacity-50"
              title="Refresh status now"
            >
              <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin' : ''}`} />
              <span>Check Now</span>
            </button>
          )}
        </div>

        {/* Status Webhook Configuration Toggle */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <span className="text-slate-400 font-medium">Status API Connection</span>
          <button
            type="button"
            id="toggle-status-config-btn"
            onClick={() => setShowConfig(!showConfig)}
            className="text-emerald-700 hover:text-emerald-800 font-medium underline"
          >
            {showConfig ? 'Hide Status URL' : 'Configure Status URL'}
          </button>
        </div>

        {showConfig && (
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs animate-in fade-in">
            <label htmlFor="status-webhook-input" className="block text-[11px] font-semibold text-slate-700">
              n8n Status Webhook URL (GET):
            </label>
            <div className="flex gap-2">
              <input
                id="status-webhook-input"
                type="text"
                value={localStatusUrl}
                onChange={(e) => {
                  setLocalStatusUrl(e.target.value);
                  if (onUpdateStatusWebhookUrl) {
                    onUpdateStatusWebhookUrl(e.target.value);
                  }
                }}
                placeholder="PASTE_N8N_STATUS_WEBHOOK_URL_HERE"
                className="flex-1 px-3 py-2 text-[11px] font-mono rounded-xl bg-white border border-slate-200 focus:border-emerald-500 outline-none"
              />
              <button
                type="button"
                onClick={() => performCheck(true)}
                className="px-3 py-2 rounded-xl bg-slate-900 text-white font-medium text-xs hover:bg-slate-800"
              >
                Test
              </button>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              When configured, MATCHPOINT AI makes a <code>GET</code> request with <code>?bookingId={booking.bookingId}</code> to check if the admin approved or rejected the booking.
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons: Book Another Court */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          id="btn-book-another-court"
          onClick={onBookAnother}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-all duration-200 shadow-sm active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Book Another Court</span>
        </button>

        {/* Quick helper to simulate approval for demonstration/testing */}
        {booking.status === 'pending' && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-2 sm:pt-0">
            <span className="text-[11px]">Testing demo:</span>
            <button
              type="button"
              id="demo-simulate-accept-btn"
              onClick={() => onStatusUpdate('accepted')}
              className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-[11px] font-medium"
            >
              Simulate Accept
            </button>
            <button
              type="button"
              id="demo-simulate-reject-btn"
              onClick={() => onStatusUpdate('rejected')}
              className="px-2 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-[11px] font-medium"
            >
              Simulate Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
