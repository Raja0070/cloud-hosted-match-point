import React, { useState } from 'react';
import { BookingFormData, Facility } from '../types';
import { CAMPUS_FACILITIES, TIME_SLOTS } from '../data/facilities';
import { generateUniqueBookingId } from '../utils/bookingId';
import { ChevronDown, AlertCircle, ArrowRight, Loader2, Building2, Send, CheckCircle2 } from 'lucide-react';

interface BookingFormProps {
  formData: BookingFormData;
  onChange: (field: keyof BookingFormData, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  selectedFacility: Facility;
  onSelectFacility: (facility: Facility) => void;
  errorMessage: string | null;
  webhookUrl: string;
  onWebhookUrlChange: (url: string) => void;
  useProductionUrl: boolean;
  onToggleProductionUrl: (prod: boolean) => void;
}

export default function BookingForm({
  formData,
  onChange,
  onSubmit,
  isSubmitting,
  selectedFacility,
  onSelectFacility,
  errorMessage,
  webhookUrl,
  onWebhookUrlChange,
  useProductionUrl,
  onToggleProductionUrl,
}: BookingFormProps) {
  const [showFacilityPicker, setShowFacilityPicker] = useState(false);
  const [showWebhookConfig, setShowWebhookConfig] = useState(false);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [showTestPayloadDetails, setShowTestPayloadDetails] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    status?: number;
    message: string;
    hint?: string;
  } | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const effectiveTargetUrl = useProductionUrl
    ? webhookUrl.replace('/webhook-test/', '/webhook/')
    : webhookUrl;

  const sampleTestPayload = {
    "bookingId": "MP-20260913-001",
    "time": "10:00 - 13:00",
    "date": "2026-09-13",
    "match": "bb",
    "startTime": "10:00",
    "endTime": "13:00",
    "studentName": "sudarshan",
    "studentId": "123456",
    "status": "pending",
  };

  const handleTestWebhook = async () => {
    setIsTestingWebhook(true);
    setTestResult(null);

    // Generate a fresh unique booking ID for this test dispatch
    const uniqueTestId = generateUniqueBookingId();
    const payloadToSend = {
      ...sampleTestPayload,
      bookingId: uniqueTestId,
    };

    try {
      const proxyResponse = await fetch('/api/webhook/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhookUrl: effectiveTargetUrl,
          payload: payloadToSend,
        }),
      });

      const resJson = await proxyResponse.json().catch(() => ({}));
      if (resJson.success || proxyResponse.ok) {
        setTestResult({
          success: true,
          status: resJson.status || 200,
          message: `Received by n8n workflow (HTTP ${resJson.status || 200})!`,
        });
      } else {
        const n8nData = resJson.data || {};
        const is404 = resJson.status === 404;
        setTestResult({
          success: false,
          status: resJson.status || 404,
          message: n8nData.message || (is404 ? 'n8n workflow is not currently listening.' : 'Failed to deliver to n8n.'),
          hint: n8nData.hint || (is404 ? "In n8n, click 'Execute workflow' on your canvas first, then click this button again." : undefined),
        });
      }
    } catch (err: unknown) {
      // Fallback direct browser dispatch
      try {
        const directResp = await fetch(effectiveTargetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payloadToSend),
        });
        if (directResp.ok) {
          setTestResult({
            success: true,
            status: directResp.status,
            message: `Delivered to n8n (HTTP ${directResp.status})!`,
          });
        } else {
          setTestResult({
            success: false,
            status: directResp.status,
            message: `n8n returned HTTP ${directResp.status}.`,
          });
        }
      } catch (fallbackErr) {
        setTestResult({
          success: false,
          message: err instanceof Error ? err.message : 'Network transmission failed',
        });
      }
    } finally {
      setIsTestingWebhook(false);
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.date) {
      newErrors.date = 'Please select a valid booking date.';
    }
    if (!formData.studentName.trim()) {
      newErrors.studentName = 'Please enter your full name.';
    }
    if (!formData.studentId.trim()) {
      newErrors.studentId = 'Please enter your college student ID.';
    }
    if (!formData.startTime) {
      newErrors.startTime = 'Please select a start time.';
    }
    if (!formData.endTime) {
      newErrors.endTime = 'Please select an end time.';
    } else if (formData.startTime && formData.endTime <= formData.startTime) {
      newErrors.endTime = 'End time must be after start time.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(e);
    }
  };

  // Min date today
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div id="booking-form-view" className="w-full">
      
      {/* Facility Header Card Banner */}
      <div className="pb-6 mb-6 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-emerald-100/80 text-emerald-700 flex items-center justify-center font-bold text-xs">
              {selectedFacility.number}
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                CAMPUS FACILITY
              </p>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-semibold text-slate-900">
                  {selectedFacility.name}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowFacilityPicker(!showFacilityPicker)}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-medium underline flex items-center gap-0.5 ml-1"
                  title="Change Facility"
                >
                  Change
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
          
          <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium flex items-center gap-1.5 flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Availability</span>
          </span>
        </div>

        {/* Dropdown to switch campus facility */}
        {showFacilityPicker && (
          <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 animate-in fade-in">
            <p className="text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              Select Campus Facility
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CAMPUS_FACILITIES.map((fac) => (
                <button
                  key={fac.id}
                  type="button"
                  onClick={() => {
                    onSelectFacility(fac);
                    onChange('facilityId', fac.id);
                    setShowFacilityPicker(false);
                  }}
                  className={`p-2.5 text-left rounded-xl text-xs border transition-all ${
                    selectedFacility.id === fac.id
                      ? 'border-emerald-500 bg-emerald-50/70 text-emerald-900 font-semibold'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-500">{fac.number}</span>
                    <span className="truncate">{fac.name}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{fac.surface}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <form id="court-booking-form" onSubmit={handleSubmit} noValidate className="space-y-6">
        
        {/* STEP 1: SELECT DATE */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="booking-date"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700"
            >
              STEP 1 — SELECT DATE <span className="text-emerald-600">*</span>
            </label>
            <span className="text-[11px] text-slate-400">Available next 14 days</span>
          </div>

          <div className="relative">
            <input
              type="date"
              id="booking-date"
              name="booking-date"
              min={todayStr}
              value={formData.date}
              onChange={(e) => {
                onChange('date', e.target.value);
                if (errors.date) setErrors((prev) => ({ ...prev, date: '' }));
              }}
              required
              className="w-full px-4 py-3.5 rounded-2xl bg-slate-50/80 border border-slate-200 text-slate-800 text-sm font-medium focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all cursor-pointer outline-none"
            />
          </div>
          {errors.date && (
            <p className="text-xs text-rose-600 font-medium pt-1 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
              {errors.date}
            </p>
          )}
        </div>

        {/* STEP 2: STUDENT DETAILS */}
        <div className="pt-2 border-t border-slate-100 space-y-4">
          <div className="flex items-center gap-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              STEP 2 — STUDENT DETAILS <span className="text-emerald-600">*</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label htmlFor="student-name" className="block text-xs font-semibold text-slate-600">
                Full Name
              </label>
              <input
                type="text"
                id="student-name"
                name="student-name"
                placeholder="Enter your full name"
                value={formData.studentName}
                onChange={(e) => {
                  onChange('studentName', e.target.value);
                  if (errors.studentName) setErrors((prev) => ({ ...prev, studentName: '' }));
                }}
                required
                className="w-full px-4 py-3.5 rounded-2xl bg-slate-50/80 border border-slate-200 text-slate-800 placeholder:text-slate-400 text-sm font-medium focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
              />
              {errors.studentName && (
                <p className="text-xs text-rose-600 font-medium pt-0.5">{errors.studentName}</p>
              )}
            </div>

            {/* Student ID */}
            <div className="space-y-1.5">
              <label htmlFor="student-id" className="block text-xs font-semibold text-slate-600">
                Student ID
              </label>
              <input
                type="text"
                id="student-id"
                name="student-id"
                placeholder="Enter your student ID"
                value={formData.studentId}
                onChange={(e) => {
                  onChange('studentId', e.target.value);
                  if (errors.studentId) setErrors((prev) => ({ ...prev, studentId: '' }));
                }}
                required
                className="w-full px-4 py-3.5 rounded-2xl bg-slate-50/80 border border-slate-200 text-slate-800 placeholder:text-slate-400 text-sm font-medium focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
              />
              {errors.studentId && (
                <p className="text-xs text-rose-600 font-medium pt-0.5">{errors.studentId}</p>
              )}
            </div>
          </div>
        </div>

        {/* STEP 3: BOOKING TIME */}
        <div className="pt-2 border-t border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              STEP 3 — BOOKING TIME <span className="text-emerald-600">*</span>
            </label>
            <span className="text-[11px] text-slate-400">Courts open 07:00 – 22:00</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Start Time */}
            <div className="space-y-1.5">
              <label htmlFor="start-time" className="block text-xs font-semibold text-slate-600">
                Start Time
              </label>
              <div className="relative">
                <select
                  id="start-time"
                  name="start-time"
                  value={formData.startTime}
                  onChange={(e) => {
                    onChange('startTime', e.target.value);
                    if (errors.startTime) setErrors((prev) => ({ ...prev, startTime: '' }));
                  }}
                  required
                  className="w-full px-4 py-3.5 rounded-2xl bg-slate-50/80 border border-slate-200 text-slate-800 text-sm font-medium focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all appearance-none pr-10 outline-none cursor-pointer"
                >
                  <option value="" disabled>
                    Select start time
                  </option>
                  {TIME_SLOTS.slice(0, -1).map((slot) => (
                    <option key={`start-${slot.value}`} value={slot.value}>
                      {slot.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
              {errors.startTime && (
                <p className="text-xs text-rose-600 font-medium pt-0.5">{errors.startTime}</p>
              )}
            </div>

            {/* End Time */}
            <div className="space-y-1.5">
              <label htmlFor="end-time" className="block text-xs font-semibold text-slate-600">
                End Time
              </label>
              <div className="relative">
                <select
                  id="end-time"
                  name="end-time"
                  value={formData.endTime}
                  onChange={(e) => {
                    onChange('endTime', e.target.value);
                    if (errors.endTime) setErrors((prev) => ({ ...prev, endTime: '' }));
                  }}
                  required
                  className="w-full px-4 py-3.5 rounded-2xl bg-slate-50/80 border border-slate-200 text-slate-800 text-sm font-medium focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all appearance-none pr-10 outline-none cursor-pointer"
                >
                  <option value="" disabled>
                    Select end time
                  </option>
                  {TIME_SLOTS.slice(1).map((slot) => (
                    <option key={`end-${slot.value}`} value={slot.value}>
                      {slot.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
              {errors.endTime && (
                <p className="text-xs text-rose-600 font-medium pt-0.5">{errors.endTime}</p>
              )}
            </div>
          </div>
        </div>

        {/* STEP 4: MATCH INFORMATION */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="match-activity"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700"
            >
              STEP 4 — MATCH INFORMATION <span className="text-slate-400 font-normal lowercase">(optional)</span>
            </label>
          </div>
          <input
            type="text"
            id="match-activity"
            name="match-activity"
            placeholder="e.g. Basketball match"
            value={formData.matchActivity}
            onChange={(e) => onChange('matchActivity', e.target.value)}
            className="w-full px-4 py-3.5 rounded-2xl bg-slate-50/80 border border-slate-200 text-slate-800 placeholder:text-slate-400 text-sm font-medium focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
          />
        </div>

        {/* n8n Webhook Workflow Notice & Config */}
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-3.5 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-800 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>n8n Workflow Connected</span>
            </div>
            <button
              type="button"
              onClick={() => setShowWebhookConfig(!showWebhookConfig)}
              className="text-emerald-700 hover:text-emerald-800 font-medium underline text-[11px]"
            >
              {showWebhookConfig ? 'Hide Settings' : 'Webhook Settings & Tips'}
            </button>
          </div>

          <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-emerald-100 text-[11px]">
            <span className="text-slate-600 font-medium">Mode:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onToggleProductionUrl(false)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  !useProductionUrl
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Test Mode (/webhook-test/)
              </button>
              <button
                type="button"
                onClick={() => onToggleProductionUrl(true)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  useProductionUrl
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Production Mode (/webhook/)
              </button>
            </div>
          </div>

          {/* Quick Notice for Test Mode */}
          {!useProductionUrl ? (
            <p className="text-[11px] text-emerald-800/90 leading-relaxed">
              💡 <strong>For Test Mode in n8n:</strong> Click <strong>"Execute workflow"</strong> on your n8n canvas first so it listens, then click <strong>"Confirm Booking"</strong> below.
            </p>
          ) : (
            <p className="text-[11px] text-emerald-800/90 leading-relaxed">
              🚀 <strong>Production Mode:</strong> Ensure your workflow is <strong>Toggled Active (top-right of n8n)</strong> so it continuously triggers on every booking.
            </p>
          )}

          {/* Test Webhook Button & Live Feedback */}
          <div className="pt-2.5 border-t border-emerald-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-700">Quick Connectivity Test:</span>
              <button
                type="button"
                id="toggle-test-payload-json"
                onClick={() => setShowTestPayloadDetails(!showTestPayloadDetails)}
                className="text-[10px] text-emerald-700 hover:text-emerald-800 font-mono underline"
              >
                {showTestPayloadDetails ? 'Hide test JSON' : 'View test JSON'}
              </button>
            </div>

            {showTestPayloadDetails && (
              <pre id="test-json-preview" className="p-2.5 bg-slate-900 text-emerald-300 rounded-xl text-[10px] font-mono overflow-x-auto leading-relaxed">
                {JSON.stringify(sampleTestPayload, null, 2)}
              </pre>
            )}

            <button
              type="button"
              id="test-webhook-trigger-btn"
              onClick={handleTestWebhook}
              disabled={isTestingWebhook}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white border border-emerald-300 hover:border-emerald-400 hover:bg-emerald-50 text-emerald-800 font-semibold text-xs shadow-2xs transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isTestingWebhook ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                  <span>Sending Test JSON to n8n...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Test URL (Send test JSON to n8n)</span>
                </>
              )}
            </button>

            {testResult && (
              <div
                id="test-webhook-result"
                className={`p-2.5 rounded-xl border text-[11px] leading-relaxed transition-all ${
                  testResult.success
                    ? 'bg-emerald-100/80 border-emerald-300 text-emerald-900'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold">
                  {testResult.success ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                      <span>{testResult.message}</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
                      <span>HTTP {testResult.status || 'Error'}: {testResult.message}</span>
                    </>
                  )}
                </div>
                {testResult.hint && (
                  <p className="mt-1 text-[10.5px] text-amber-800 pl-5 font-medium">
                    👉 {testResult.hint}
                  </p>
                )}
              </div>
            )}
          </div>

          {showWebhookConfig && (
            <div className="pt-2 mt-2 border-t border-emerald-100 space-y-2 animate-in fade-in">
              <label htmlFor="custom-webhook-url" className="block text-[11px] font-semibold text-slate-700">
                Webhook Target URL:
              </label>
              <input
                id="custom-webhook-url"
                type="text"
                value={webhookUrl}
                onChange={(e) => onWebhookUrlChange(e.target.value)}
                placeholder="https://.../webhook-test/..."
                className="w-full px-3 py-2 text-[11px] font-mono rounded-xl bg-white border border-slate-200 focus:border-emerald-500 outline-none"
              />
            </div>
          )}
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div
            id="error-banner"
            className="rounded-2xl bg-rose-50 border border-rose-200/80 p-4 text-rose-800 text-xs sm:text-sm"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-rose-900" id="error-banner-title">
                  Something went wrong
                </p>
                <p className="mt-0.5 text-rose-700" id="error-banner-desc">
                  {errorMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            id="submit-button"
            disabled={isSubmitting}
            className="w-full relative group overflow-hidden bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-semibold text-base py-4 px-6 rounded-2xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 active:scale-[0.99] disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span id="btn-loading" className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Confirming...</span>
              </span>
            ) : (
              <span id="btn-text" className="flex items-center justify-center gap-2">
                <span>Confirm Booking</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </button>
          <p className="text-center text-[12px] text-slate-400 mt-2.5">
            Instant reservation confirmation via Campus Sports Network
          </p>
        </div>

      </form>
    </div>
  );
}
