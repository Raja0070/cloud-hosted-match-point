import React, { useState } from 'react';
import Navbar from './components/Navbar';
import BookingForm from './components/BookingForm';
import BookingSummary from './components/BookingSummary';
import BookingStatusDashboard from './components/BookingStatusDashboard';
import CourtsView from './components/CourtsView';
import CampusHubView from './components/CampusHubView';
import AboutView from './components/AboutView';
import CustomCursor from './components/CustomCursor';
import { BookingFormData, ConfirmedBooking, Facility, ActiveTab, BookingRecord, BookingStatusType } from './types';
import { CAMPUS_FACILITIES } from './data/facilities';
import { generateUniqueBookingId } from './utils/bookingId';
import { STATUS_WEBHOOK_URL } from './config';
import { Zap, Calendar, Plus } from 'lucide-react';

const DEFAULT_WEBHOOK_URL = 'https://sudarshansoni.app.n8n.cloud/webhook-test/ab91394f-7565-412d-b82d-9100e545e83a';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('booking');
  const [selectedFacility, setSelectedFacility] = useState<Facility>(CAMPUS_FACILITIES[0]);
  const [webhookUrl, setWebhookUrl] = useState<string>(DEFAULT_WEBHOOK_URL);
  const [useProductionUrl, setUseProductionUrl] = useState<boolean>(false);

  // Default to today's date formatted YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState<BookingFormData>({
    date: todayStr,
    studentName: '',
    studentId: '',
    startTime: '',
    endTime: '',
    matchActivity: '',
    facilityId: CAMPUS_FACILITIES[0].id,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<ConfirmedBooking | null>(null);

  // Active student booking loaded from localStorage
  const [currentBooking, setCurrentBooking] = useState<BookingRecord | null>(() => {
    try {
      const bookingId = localStorage.getItem('matchpointBookingId') || localStorage.getItem('matchpoint_booking_id');
      if (!bookingId) {
        return null;
      }
      const saved = localStorage.getItem('matchpoint_active_booking');
      return saved ? (JSON.parse(saved) as BookingRecord) : null;
    } catch {
      return null;
    }
  });

  // Status webhook URL (GET) - uses production n8n webhook
  const [statusWebhookUrl, setStatusWebhookUrl] = useState<string>(() => {
    try {
      const stored = localStorage.getItem('matchpoint_status_webhook_url');
      if (stored && stored !== 'PASTE_N8N_STATUS_WEBHOOK_URL_HERE') {
        return stored;
      }
      return STATUS_WEBHOOK_URL;
    } catch {
      return STATUS_WEBHOOK_URL;
    }
  });

  const handleFieldChange = (field: keyof BookingFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSelectFacility = (facility: Facility) => {
    setSelectedFacility(facility);
    setFormData((prev) => ({
      ...prev,
      facilityId: facility.id,
    }));
  };

  const handleCourtSelectFromDirectory = (facility: Facility) => {
    setSelectedFacility(facility);
    setFormData((prev) => ({
      ...prev,
      facilityId: facility.id,
    }));
    setActiveTab('booking');
    setConfirmedBooking(null);
  };

  const getEffectiveWebhookUrl = () => {
    if (useProductionUrl) {
      return webhookUrl.replace('/webhook-test/', '/webhook/');
    }
    return webhookUrl;
  };

  const handleBookingStatusUpdate = (newStatus: BookingStatusType) => {
    setCurrentBooking((prev) => {
      if (!prev) return null;
      const updated: BookingRecord = {
        ...prev,
        status: newStatus,
        lastCheckedAt: new Date().toISOString(),
      };
      try {
        localStorage.setItem('matchpointBookingId', updated.bookingId);
        localStorage.setItem('matchpoint_active_booking', JSON.stringify(updated));
      } catch {
        // ignore localStorage errors
      }
      return updated;
    });
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    // Generate guaranteed unique booking ID (format: MP-YYYYMMDD-001)
    const uniqueBookingId = generateUniqueBookingId(formData.date);

    // Strict JSON payload matching user's requested specification:
    // bookingId, time, date, match, startTime, endTime, studentName, studentId, status
    const payload: Record<string, unknown> = {
      bookingId: uniqueBookingId,
      time: `${formData.startTime} - ${formData.endTime}`,
      date: formData.date,
      match: formData.matchActivity.trim() || 'General Practice',
      startTime: formData.startTime,
      endTime: formData.endTime,
      studentName: formData.studentName.trim(),
      studentId: formData.studentId.trim(),
      status: 'pending',
    };

    const targetUrl = getEffectiveWebhookUrl();
    let webhookDispatched = false;
    let webhookStatusMessage = 'Dispatched to n8n';
    let webhookDetails: { code?: number | string; message?: string; hint?: string; raw?: string } | undefined;
    let n8nReturnedBookingId = uniqueBookingId;
    let n8nReturnedStatus: BookingStatusType = 'pending';

    try {
      // Step 1: Dispatch through server-side proxy
      let proxyResponse: Response | null = null;
      try {
        proxyResponse = await fetch('/api/webhook/dispatch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            webhookUrl: targetUrl,
            payload,
          }),
        });
      } catch (proxyErr) {
        console.warn('Server proxy unavailable, falling back to direct browser fetch:', proxyErr);
      }

      if (proxyResponse) {
        const result = await proxyResponse.json().catch(() => ({}));
        if (result.success || proxyResponse.ok) {
          webhookDispatched = true;
          webhookStatusMessage = `Success (HTTP ${result.status || 200})`;
          webhookDetails = {
            code: result.status || 200,
            message: 'Webhook received successfully by n8n workflow.',
            raw: typeof result.data === 'string' ? result.data : JSON.stringify(result.data),
          };

          // Parse response from n8n if provided: { success: true, bookingId: "...", status: "pending" }
          if (result.data && typeof result.data === 'object') {
            const respObj = Array.isArray(result.data) ? result.data[0] : result.data;
            if (respObj && respObj.bookingId) n8nReturnedBookingId = String(respObj.bookingId);
            if (respObj && respObj.status) {
              const s = String(respObj.status).toLowerCase();
              if (s.includes('accept')) n8nReturnedStatus = 'accepted';
              else if (s.includes('reject')) n8nReturnedStatus = 'rejected';
            }
          }
        } else {
          const n8nData = result.data || {};
          const is404 = result.status === 404;
          webhookDispatched = false;
          webhookStatusMessage = is404
            ? 'n8n Workflow Not Listening (Test Mode)'
            : `Failed (HTTP ${result.status})`;

          webhookDetails = {
            code: n8nData.code || result.status || 404,
            message: n8nData.message || (is404 ? 'The webhook is not currently listening in n8n.' : 'Unknown error'),
            hint: n8nData.hint || (is404 ? "In n8n, click 'Execute workflow' or 'Test step' on your Webhook node before clicking Submit." : undefined),
            raw: typeof result.data === 'string' ? result.data : JSON.stringify(result.data),
          };
        }
      } else {
        // Fallback: Direct fetch from browser
        const directResp = await fetch(targetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (directResp.ok) {
          webhookDispatched = true;
          webhookStatusMessage = `Success (HTTP ${directResp.status})`;
          const directData = await directResp.json().catch(() => null);
          if (directData && typeof directData === 'object') {
            const respObj = Array.isArray(directData) ? directData[0] : directData;
            if (respObj && respObj.bookingId) n8nReturnedBookingId = String(respObj.bookingId);
            if (respObj && respObj.status) {
              const s = String(respObj.status).toLowerCase();
              if (s.includes('accept')) n8nReturnedStatus = 'accepted';
              else if (s.includes('reject')) n8nReturnedStatus = 'rejected';
            }
          }
        } else {
          const text = await directResp.text().catch(() => '');
          let parsed: Record<string, unknown> = {};
          try {
            parsed = JSON.parse(text);
          } catch {
            // ignore
          }
          webhookDispatched = false;
          webhookStatusMessage = `Error (HTTP ${directResp.status})`;
          webhookDetails = {
            code: (parsed.code as string | number) || directResp.status,
            message: (parsed.message as string) || 'Server returned error',
            hint: parsed.hint as string,
            raw: text,
          };
        }
      }
    } catch (err: unknown) {
      console.error('Webhook execution catch:', err);
      try {
        await fetch(targetUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify(payload),
        });
        webhookDispatched = true;
        webhookStatusMessage = 'Dispatched (no-cors mode)';
      } catch {
        webhookDispatched = false;
        webhookStatusMessage = 'Dispatch Failed';
        webhookDetails = {
          message: err instanceof Error ? err.message : String(err),
        };
      }
    }

    // Save active booking record for the Dashboard and Status Polling System
    const newRecord: BookingRecord = {
      bookingId: n8nReturnedBookingId,
      studentName: formData.studentName.trim(),
      studentId: formData.studentId.trim(),
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      matchActivity: formData.matchActivity.trim() || 'General Practice',
      facilityName: selectedFacility.name,
      status: n8nReturnedStatus,
      submittedAt: new Date().toISOString(),
      targetWebhookUrl: targetUrl,
      statusWebhookUrl,
      payload,
    };

    try {
      localStorage.setItem('matchpointBookingId', newRecord.bookingId);
      localStorage.setItem('matchpoint_booking_id', newRecord.bookingId);
      localStorage.setItem('matchpoint_active_booking', JSON.stringify(newRecord));
    } catch {
      // ignore
    }

    setCurrentBooking(newRecord);

    // Record confirmation state
    const newConfirmation: ConfirmedBooking = {
      referenceCode: n8nReturnedBookingId,
      studentName: formData.studentName.trim(),
      studentId: formData.studentId.trim(),
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      matchActivity: formData.matchActivity.trim() || 'General Practice',
      facilityName: selectedFacility.name,
      timestamp: new Date().toISOString(),
      status: n8nReturnedStatus,
      webhookSent: webhookDispatched,
      webhookStatus: webhookStatusMessage,
      webhookResponse: webhookDetails,
      targetWebhookUrl: targetUrl,
      payload,
    };

    setConfirmedBooking(newConfirmation);
    setIsSubmitting(false);
  };

  const handleBookAnother = () => {
    setConfirmedBooking(null);
    setFormData({
      date: todayStr,
      studentName: '',
      studentId: '',
      startTime: '',
      endTime: '',
      matchActivity: '',
      facilityId: selectedFacility.id,
    });
    setErrorMessage(null);
    setActiveTab('booking');
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-800 bg-[#F9FAFB] relative selection:bg-emerald-500/20 selection:text-emerald-900">
      
      {/* Desktop Custom Cursor */}
      <CustomCursor />

      {/* Decorative ambient background glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-80 h-80 bg-emerald-50/60 rounded-full blur-3xl" />
      </div>

      {/* Sticky Top Navigation with Active Booking Indicator */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
        }}
        hasActiveBooking={!!currentBooking}
        bookingStatus={currentBooking?.status}
      />

      {/* Main Container */}
      <main className="flex-grow z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 w-full">
        
        {/* VIEW 1: Main Court Booking Screen */}
        {activeTab === 'booking' && (
          <div className="space-y-10 sm:space-y-14">
            
            {/* Hero / Booking Heading */}
            <div className="text-center max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-800 text-xs font-semibold mb-4 tracking-wide shadow-xs">
                <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                Instant College Court Reservation
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {confirmedBooking && currentBooking ? 'Booking Status' : 'Book Your Court'}
              </h1>
              
              <p className="mt-3 text-slate-500 text-sm sm:text-base leading-relaxed">
                {confirmedBooking && currentBooking
                  ? 'Your reservation is synchronized with n8n and campus sports administration.'
                  : 'Choose a date and time, enter your details, and confirm your booking.'}
              </p>
            </div>

            {/* Layout Grid: Form or Status Dashboard (Left) & Live Summary (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-6xl mx-auto">
              
              {/* LEFT COLUMN: Booking Form or Status Dashboard Screen */}
              <section className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-9 shadow-card border border-slate-100/90 relative overflow-hidden transition-all duration-300">
                {confirmedBooking && currentBooking ? (
                  <BookingStatusDashboard
                    booking={currentBooking}
                    onStatusUpdate={handleBookingStatusUpdate}
                    onBookAnother={handleBookAnother}
                    statusWebhookUrl={statusWebhookUrl}
                    onUpdateStatusWebhookUrl={(url) => {
                      setStatusWebhookUrl(url);
                      try {
                        localStorage.setItem('matchpoint_status_webhook_url', url);
                      } catch {
                        // ignore
                      }
                    }}
                    showSubmittedHeading={true}
                  />
                ) : (
                  <BookingForm
                    formData={formData}
                    onChange={handleFieldChange}
                    onSubmit={handleSubmitBooking}
                    isSubmitting={isSubmitting}
                    selectedFacility={selectedFacility}
                    onSelectFacility={handleSelectFacility}
                    errorMessage={errorMessage}
                    webhookUrl={webhookUrl}
                    onWebhookUrlChange={setWebhookUrl}
                    useProductionUrl={useProductionUrl}
                    onToggleProductionUrl={setUseProductionUrl}
                  />
                )}
              </section>

              {/* RIGHT COLUMN: Live Sync Summary Sidebar */}
              <BookingSummary
                formData={formData}
                selectedFacility={selectedFacility}
              />

            </div>

          </div>
        )}

        {/* VIEW 2: My Booking / Booking Status Dashboard */}
        {activeTab === 'my-booking' && (
          <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in">
            {currentBooking ? (
              <BookingStatusDashboard
                booking={currentBooking}
                onStatusUpdate={handleBookingStatusUpdate}
                onBookAnother={handleBookAnother}
                statusWebhookUrl={statusWebhookUrl}
                onUpdateStatusWebhookUrl={(url) => {
                  setStatusWebhookUrl(url);
                  try {
                    localStorage.setItem('matchpoint_status_webhook_url', url);
                  } catch {
                    // ignore
                  }
                }}
                showSubmittedHeading={false}
              />
            ) : (
              <div id="no-booking-state" className="bg-white rounded-3xl p-10 border border-slate-200 text-center space-y-5 shadow-sm">
                <div className="w-16 h-16 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center mx-auto">
                  <Calendar className="w-8 h-8 text-slate-400" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-xl font-bold text-slate-900">No active booking</h3>
                  <p className="text-slate-500 text-sm max-w-sm mx-auto">
                    You haven't reserved a court yet. Book your court now to get real-time status updates from the campus sports coordinator.
                  </p>
                </div>
                <button
                  type="button"
                  id="btn-empty-book-court"
                  onClick={() => setActiveTab('booking')}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all duration-200 shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Book a Court</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: Courts Directory */}
        {activeTab === 'courts' && (
          <CourtsView onSelectCourtForBooking={handleCourtSelectFromDirectory} />
        )}

        {/* VIEW 4: Campus Hub */}
        {activeTab === 'hub' && (
          <CampusHubView onGoToBooking={() => setActiveTab('booking')} />
        )}

        {/* VIEW 5: About & Guidelines */}
        {activeTab === 'about' && (
          <AboutView onStartBooking={() => setActiveTab('booking')} />
        )}

      </main>

      {/* Clean Minimal Footer */}
      <footer className="mt-auto border-t border-slate-100 py-8 text-center text-xs text-slate-400 bg-white/60 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900 tracking-tight">MATCHPOINT AI</span>
            <span>— College Sports Recreation</span>
          </div>
          <p>© 2025 MatchPoint AI. Match. Book. Play.</p>
        </div>
      </footer>

    </div>
  );
}
