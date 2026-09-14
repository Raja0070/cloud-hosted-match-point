import React, { useState } from 'react';
import { CAMPUS_FACILITIES } from '../data/facilities';
import { Facility } from '../types';
import { MapPin, Users, CheckCircle2, Clock, Sparkles } from 'lucide-react';

interface CourtsViewProps {
  onSelectCourtForBooking: (facility: Facility) => void;
}

export default function CourtsView({ onSelectCourtForBooking }: CourtsViewProps) {
  const [selectedSport, setSelectedSport] = useState<string>('all');

  const sports = [
    { id: 'all', label: 'All Courts' },
    { id: 'basketball', label: 'Basketball' },
    { id: 'tennis', label: 'Tennis' },
    { id: 'badminton', label: 'Badminton' },
    { id: 'squash', label: 'Squash' },
  ];

  const filtered = selectedSport === 'all'
    ? CAMPUS_FACILITIES
    : CAMPUS_FACILITIES.filter((f) => f.sport === selectedSport);

  return (
    <div className="space-y-8 animate-in fade-in max-w-6xl mx-auto">
      {/* Heading */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-800 text-xs font-semibold mb-3 tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          Campus Sports Facilities
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Explore Campus Courts
        </h2>
        <p className="mt-2 text-slate-500 text-sm sm:text-base">
          Browse all recreation courts, check real-time open slots, and reserve your playtime.
        </p>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
          {sports.map((sport) => (
            <button
              key={sport.id}
              type="button"
              onClick={() => setSelectedSport(sport.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                selectedSport === sport.id
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {sport.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of facilities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((facility) => (
          <div
            key={facility.id}
            className="bg-white rounded-3xl p-6 shadow-card border border-slate-100 flex flex-col justify-between hover:border-emerald-200 transition-all group"
          >
            <div>
              {/* Top Meta */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-emerald-100/80 text-emerald-700 flex items-center justify-center font-bold text-xs">
                    {facility.number}
                  </span>
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
                      {facility.type}
                    </span>
                    <span className="text-xs font-medium text-emerald-700 capitalize">
                      {facility.sport}
                    </span>
                  </div>
                </div>

                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-medium flex items-center gap-1.5 border border-emerald-200/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {facility.currentOccupancy || 'Open for Booking'}
                </span>
              </div>

              {/* Title & Details */}
              <div className="mt-4">
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {facility.name}
                </h3>

                <div className="mt-3 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span>{facility.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span>Daily: 07:00 – 22:00 (Student Access)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span>Capacity: {facility.capacity} • {facility.surface}</span>
                  </div>
                </div>

                {/* Features chips */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {facility.features.map((feat, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] px-2.5 py-1 bg-slate-50 text-slate-600 rounded-lg border border-slate-200/60 font-medium"
                    >
                      {feat}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Action */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Free for Active Students
              </span>

              <button
                type="button"
                onClick={() => onSelectCourtForBooking(facility)}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white text-xs font-semibold transition-all shadow-sm shadow-emerald-500/20 active:scale-95 flex items-center gap-1.5"
              >
                <span>Reserve Court</span>
                <span>→</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
