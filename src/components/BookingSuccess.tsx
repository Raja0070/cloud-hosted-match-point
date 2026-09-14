import React from 'react';
import { ConfirmedBooking } from '../types';
import { Check, Plus, Calendar, Download, ShieldCheck } from 'lucide-react';

interface BookingSuccessProps {
  booking: ConfirmedBooking;
  onBookAnother: () => void;
}

export default function BookingSuccess({ booking, onBookAnother }: BookingSuccessProps) {
  const formatDateDisplay = (rawDate: string) => {
    try {
      const parts = rawDate.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
      return rawDate;
    } catch {
      return rawDate;
    }
  };

  const handleDownloadPass = () => {
    const passText = `===========================================
CAMPUS RECREATION COURT PASS - MATCHPOINT AI
===========================================
REFERENCE: ${booking.referenceCode}
FACILITY:  ${booking.facilityName}
DATE:      ${formatDateDisplay(booking.date)}
TIME SLOT: ${booking.startTime} - ${booking.endTime}
STUDENT:   ${booking.studentName}
STUDENT ID:${booking.studentId}
ACTIVITY:  ${booking.matchActivity}
ISSUED AT: ${new Date().toLocaleString()}
STATUS:    CONFIRMED ACTIVE
===========================================
Bring your student ID card to the check-in desk.
===========================================`;

    const blob = new Blob([passText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CourtPass-${booking.referenceCode}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div id="booking-success-view" className="py-6 text-center space-y-6 animate-in fade-in">
      {/* Checkmark Icon Circle */}
      <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-100/60 shadow-sm">
        <Check className="w-8 h-8 stroke-[2.5]" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-2xl font-extrabold text-slate-900">
          Booking Request Sent
        </h3>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          Your court request has been submitted successfully and synchronized with Campus Sports Network.
        </p>
      </div>

      {/* Submitted Details Recap Card */}
      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/70 text-left max-w-md mx-auto space-y-3">
        <div className="flex justify-between items-center pb-2 border-b border-slate-200/60 text-xs text-slate-500">
          <span className="font-medium">Reference Code</span>
          <span id="success-ref" className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
            {booking.referenceCode}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-slate-400 block">Student</span>
            <span id="success-name" className="font-semibold text-slate-800">
              {booking.studentName}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block">Student ID</span>
            <span id="success-id" className="font-semibold text-slate-800 uppercase">
              {booking.studentId}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block">Date</span>
            <span id="success-date" className="font-semibold text-slate-800">
              {formatDateDisplay(booking.date)}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block">Time Slot</span>
            <span id="success-time" className="font-semibold text-slate-800">
              {booking.startTime} – {booking.endTime}
            </span>
          </div>

          <div className="col-span-2">
            <span className="text-slate-400 block">Facility</span>
            <span className="font-semibold text-slate-800">
              {booking.facilityName}
            </span>
          </div>

          <div className="col-span-2">
            <span className="text-slate-400 block">Match / Activity</span>
            <span id="success-match" className="font-semibold text-slate-800">
              {booking.matchActivity || 'General Practice'}
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-emerald-700">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Verified Active Student Pass
          </span>
          <button
            type="button"
            onClick={handleDownloadPass}
            className="text-emerald-700 hover:text-emerald-800 font-semibold underline flex items-center gap-1"
          >
            <Download className="w-3 h-3" />
            Save Pass
          </button>
        </div>

        {/* n8n Webhook Transmission Box */}
        <div className="mt-3 p-3.5 bg-white rounded-xl border border-emerald-100 text-left space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
              <span className={`w-2.5 h-2.5 rounded-full ${booking.webhookSent ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
              <span>n8n Webhook Status</span>
            </div>
            <span
              className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-semibold border ${
                booking.webhookSent
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              {booking.webhookStatus || (booking.webhookSent ? 'Delivered' : 'Action Required in n8n')}
            </span>
          </div>

          <div className="text-[11px] text-slate-500 font-mono bg-slate-50 p-2 rounded-lg border border-slate-100 break-all select-all">
            <span className="text-slate-400 select-none block text-[9px] uppercase font-sans font-bold tracking-wider mb-0.5">Target Endpoint</span>
            {booking.targetWebhookUrl || 'https://sudarshansoni.app.n8n.cloud/webhook-test/ab91394f-7565-412d-b82d-9100e545e83a'}
          </div>

          {/* If n8n responded with 404 in test mode */}
          {booking.webhookResponse?.code === 404 && (
            <div className="p-2.5 bg-amber-50/90 border border-amber-200 rounded-lg text-xs text-amber-900 space-y-1">
              <p className="font-semibold flex items-center gap-1.5 text-amber-800">
                <span>⚠️ Why n8n returned 404:</span>
              </p>
              <p className="text-[11px] text-amber-800/90 leading-relaxed">
                In n8n, <strong>Test Webhooks</strong> (<code className="bg-amber-100 px-1 py-0.2 rounded font-mono text-[10px]">/webhook-test/...</code>) only listen for <strong>one single request</strong> after you click <strong>"Execute workflow"</strong> (or "Test step") in n8n.
              </p>
              <div className="pt-1 text-[11px] font-medium text-amber-900">
                👉 <strong>To fix right now:</strong> Open your n8n workflow canvas &rarr; click <strong>"Execute workflow"</strong> &rarr; then click "Confirm Booking" again or switch to <strong>Production URL</strong> once your workflow is toggled active.
              </div>
            </div>
          )}

          {booking.payload && (
            <details className="text-[11px] text-slate-600 pt-1 border-t border-slate-100">
              <summary className="cursor-pointer font-semibold text-emerald-700 hover:text-emerald-800 select-none py-0.5">
                View bundled JSON payload sent to n8n
              </summary>
              <pre className="mt-2 p-2.5 bg-slate-900 text-emerald-300 rounded-lg text-[10px] font-mono overflow-x-auto max-h-44 text-left leading-relaxed">
                {JSON.stringify(booking.payload, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          id="btn-book-another"
          onClick={onBookAnother}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm transition-all duration-200 shadow-sm active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Book Another Court</span>
        </button>

        <button
          type="button"
          onClick={handleDownloadPass}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 font-medium text-sm transition-all duration-200 shadow-sm active:scale-95"
        >
          <Calendar className="w-4 h-4 text-emerald-600" />
          <span>Download Digital Pass</span>
        </button>
      </div>
    </div>
  );
}
