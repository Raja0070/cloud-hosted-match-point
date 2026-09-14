import React from 'react';
import { Trophy, Activity, Dumbbell, Clock, Users, ArrowUpRight, Flame } from 'lucide-react';

interface CampusHubViewProps {
  onGoToBooking: () => void;
}

export default function CampusHubView({ onGoToBooking }: CampusHubViewProps) {
  const pickupMatches = [
    {
      title: '5v5 Full-Court Basketball Run',
      facility: 'Student Recreation Center - Court 1',
      time: 'Today • 17:00 – 19:00',
      spots: '3 spots open',
      level: 'All Levels Welcome',
      organizer: 'Campus Intramural Club'
    },
    {
      title: 'Intermediate Doubles Tennis Match',
      facility: 'West Campus Tennis - Court 3',
      time: 'Today • 18:00 – 19:30',
      spots: '1 player needed',
      level: 'NTRP 3.5+',
      organizer: 'Varsity Club Rec'
    },
    {
      title: 'Casual Badminton Singles / Doubles',
      facility: 'North Pavilion Badminton Hall',
      time: 'Tomorrow • 15:00 – 17:00',
      spots: 'Open Rotations',
      level: 'Beginner & Intermediate',
      organizer: 'Grad Sports Association'
    }
  ];

  const peakHours = [
    { hour: '07:00', load: 'Quiet (15%)', color: 'bg-emerald-400' },
    { hour: '10:00', load: 'Moderate (45%)', color: 'bg-emerald-500' },
    { hour: '13:00', load: 'Brisk (60%)', color: 'bg-amber-400' },
    { hour: '17:00', load: 'Peak Rush (90%)', color: 'bg-rose-400' },
    { hour: '19:00', load: 'Peak Rush (95%)', color: 'bg-rose-500' },
    { hour: '21:00', load: 'Tapering (40%)', color: 'bg-emerald-500' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-800 text-xs font-semibold mb-3 tracking-wide">
          <Activity className="w-3.5 h-3.5 text-emerald-600" />
          Student Athletics Community
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Campus Recreation Hub
        </h2>
        <p className="mt-2 text-slate-500 text-sm sm:text-base">
          Connect with fellow student athletes, join open pickup sessions, and check court peak traffic.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Today's Pickup Matches & Intramurals */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-card border border-slate-100 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Open Student Pickup Games
                  </h3>
                  <p className="text-xs text-slate-400">Join a game or organize your squad</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onGoToBooking}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 underline flex items-center gap-1"
              >
                Book Court
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3.5">
              {pickupMatches.map((match, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 hover:border-emerald-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 text-sm">
                        {match.title}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                        {match.spots}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{match.facility}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {match.time}
                      </span>
                      <span>•</span>
                      <span>{match.level}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={onGoToBooking}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold whitespace-nowrap transition-all active:scale-95 shadow-sm"
                  >
                    Join Session
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Sports Equipment Desk */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-card border border-slate-100 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Dumbbell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Free Equipment Checkout Desk
                </h3>
                <p className="text-xs text-slate-400">Located at Athletic Center Level 1</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="block text-lg font-bold text-slate-800">18+</span>
                <span className="text-[11px] text-slate-400">Basketballs</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="block text-lg font-bold text-slate-800">24</span>
                <span className="text-[11px] text-slate-400">Tennis Rackets</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="block text-lg font-bold text-slate-800">30</span>
                <span className="text-[11px] text-slate-400">Badminton Sets</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="block text-lg font-bold text-slate-800">12</span>
                <span className="text-[11px] text-slate-400">Squash Kits</span>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              Present your student barcode at the front equipment cage to borrow gear for up to 2 hours at no cost.
            </p>
          </div>
        </div>

        {/* Right Column: Hourly Traffic Heatmap & Rules */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-card border border-slate-100 space-y-5">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Court Traffic & Peak Hours
                </h3>
                <p className="text-xs text-slate-400">Plan ahead for quieter court slots</p>
              </div>
            </div>

            <div className="space-y-3">
              {peakHours.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 w-14">{item.hour}</span>
                  <div className="flex-1 mx-3 bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.color}`}
                      style={{
                        width: item.load.includes('95%')
                          ? '95%'
                          : item.load.includes('90%')
                          ? '90%'
                          : item.load.includes('60%')
                          ? '60%'
                          : item.load.includes('45%')
                          ? '45%'
                          : item.load.includes('40%')
                          ? '40%'
                          : '15%'
                      }}
                    />
                  </div>
                  <span className="text-slate-500 font-medium text-right w-24">
                    {item.load}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-xs text-emerald-900 space-y-1">
              <p className="font-bold">Pro Tip for Students:</p>
              <p className="text-emerald-800/90 leading-relaxed">
                Courts between 07:00 – 11:00 AM have the highest open availability. Weekend evening slots fill fast 48 hours in advance!
              </p>
            </div>
          </div>

          {/* Intramural League Trophy Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-card space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Trophy className="w-4 h-4" />
              Fall Intramural Tournament
            </div>
            <h4 className="text-base font-bold">Campus 3v3 Basketball Showdown</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Registration opens next Monday for undergraduate and graduate team brackets. Trophies & campus bookstore gift cards for winners!
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={onGoToBooking}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold text-xs rounded-xl transition-all"
              >
                Reserve Practice Court
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
