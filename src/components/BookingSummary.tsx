import React from 'react';
import { BookingFormData, Facility } from '../types';
import { ClipboardList, Info } from 'lucide-react';
import { TIME_SLOTS } from '../data/facilities';

interface BookingSummaryProps {
  formData: BookingFormData;
  selectedFacility: Facility;
}

export default function BookingSummary({ formData, selectedFacility }: BookingSummaryProps) {
  const formatDateDisplay = (rawDate: string) => {
    if (!rawDate) return 'Not selected';
    try {
      const parts = rawDate.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const d = new Date(year, month, day);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
      return rawDate;
    } catch {
      return rawDate;
    }
  };

  const getSlotLabel = (val: string) => {
    if (!val) return 'Not selected';
    const match = TIME_SLOTS.find((s) => s.value === val);
    return match ? match.label : val;
  };

  return (
    <aside className="lg:col-span-5 w-full">
      <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-card border border-slate-100/90 sticky top-28 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
              <ClipboardList className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-slate-900 text-base sm:text-lg">
              Booking Summary
            </h2>
          </div>
          <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/50 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Sync
          </span>
        </div>

        {/* Summary Key-Value List */}
        <dl className="space-y-4 text-xs sm:text-sm">
          {/* Facility */}
          <div className="flex items-center justify-between py-2 border-b border-slate-50">
            <dt className="text-slate-400 font-medium">Facility</dt>
            <dd id="sum-facility" className="font-semibold text-slate-800 text-right truncate max-w-[180px]">
              {selectedFacility.name}
            </dd>
          </div>

          {/* Date */}
          <div className="flex items-center justify-between py-2 border-b border-slate-50">
            <dt className="text-slate-400 font-medium">Date</dt>
            <dd id="sum-date" className="font-semibold text-slate-800 text-right">
              {formatDateDisplay(formData.date)}
            </dd>
          </div>

          {/* Student Name */}
          <div className="flex items-center justify-between py-2 border-b border-slate-50">
            <dt className="text-slate-400 font-medium">Student Name</dt>
            <dd
              id="sum-name"
              className="font-semibold text-slate-800 text-right truncate max-w-[180px]"
            >
              {formData.studentName.trim() || 'Not selected'}
            </dd>
          </div>

          {/* Student ID */}
          <div className="flex items-center justify-between py-2 border-b border-slate-50">
            <dt className="text-slate-400 font-medium">Student ID</dt>
            <dd id="sum-id" className="font-semibold text-slate-800 text-right uppercase">
              {formData.studentId.trim().toUpperCase() || 'NOT SELECTED'}
            </dd>
          </div>

          {/* Start Time */}
          <div className="flex items-center justify-between py-2 border-b border-slate-50">
            <dt className="text-slate-400 font-medium">Start Time</dt>
            <dd id="sum-start" className="font-semibold text-slate-800 text-right">
              {getSlotLabel(formData.startTime)}
            </dd>
          </div>

          {/* End Time */}
          <div className="flex items-center justify-between py-2 border-b border-slate-50">
            <dt className="text-slate-400 font-medium">End Time</dt>
            <dd id="sum-end" className="font-semibold text-slate-800 text-right">
              {getSlotLabel(formData.endTime)}
            </dd>
          </div>

          {/* Match / Activity */}
          <div className="flex items-center justify-between py-2">
            <dt className="text-slate-400 font-medium">Match / Activity</dt>
            <dd
              id="sum-match"
              className="font-semibold text-slate-800 text-right truncate max-w-[180px]"
            >
              {formData.matchActivity.trim() || 'Not selected'}
            </dd>
          </div>
        </dl>

        {/* Student Policy Box */}
        <div className="rounded-2xl bg-slate-50/90 border border-slate-100 p-4 text-xs space-y-2 text-slate-500">
          <div className="flex items-center gap-2 font-medium text-slate-700">
            <Info className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Student Booking Policy</span>
          </div>
          <p className="leading-relaxed text-[11px] text-slate-400">
            Free access for active students. Valid ID required at facility check-in. Cancel at least 2 hours before start.
          </p>
        </div>

        {/* n8n Automation Bridge Indicator */}
        <div className="rounded-xl bg-emerald-50/70 border border-emerald-100/80 p-3 text-xs flex items-center justify-between text-emerald-900">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-[11px]">n8n Webhook Sync</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-700 bg-white/80 px-2 py-0.5 rounded border border-emerald-200/50">
            Armed & Ready
          </span>
        </div>

      </div>
    </aside>
  );
}
