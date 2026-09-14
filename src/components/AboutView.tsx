import React from 'react';
import { ShieldCheck, Clock, Award, Phone, Mail, HelpCircle, CheckCircle2 } from 'lucide-react';

interface AboutViewProps {
  onStartBooking: () => void;
}

export default function AboutView({ onStartBooking }: AboutViewProps) {
  const policies = [
    {
      title: 'Free Active Student Access',
      desc: 'All full-time and part-time enrolled university students enjoy 100% complimentary court reservation privileges with a valid Student ID.'
    },
    {
      title: '2-Hour Cancellation Window',
      desc: 'To keep facilities accessible for everyone, please release reserved slots at least two hours prior to start time if your plans change.'
    },
    {
      title: 'Court Footwear Guidelines',
      desc: 'Clean, non-marking athletic court shoes are required on all hardwood and indoor synthetic courts. Street shoes and dark-soled cleats are strictly prohibited.'
    },
    {
      title: 'Equipment & Ball Rentals',
      desc: 'Tennis balls, pickleball paddles, shuttlecocks, and basketballs are available at the front equipment kiosk at no cost with your reservation ticket.'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in max-w-4xl mx-auto">
      {/* Hero */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-800 text-xs font-semibold mb-3 tracking-wide">
          <Award className="w-3.5 h-3.5 text-emerald-600" />
          University Athletics & Recreation
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          About MatchPoint AI
        </h2>
        <p className="mt-2 text-slate-500 text-sm sm:text-base leading-relaxed">
          MatchPoint AI is the official sports recreation management portal powering campus gymnasiums, tennis courts, and fitness pavilions.
        </p>
      </div>

      {/* Main Philosophy Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-slate-100 space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 flex-shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Instant Reservations, Zero Hassle
            </h3>
            <p className="mt-1 text-slate-600 text-sm leading-relaxed">
              Designed specifically for college students, MatchPoint AI eliminates paper sign-up sheets and long lines at the athletic desk. Reserve your preferred slot from your phone or laptop, verify with your student ID, and step right onto the court.
            </p>
          </div>
        </div>

        {/* Policies Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          {policies.map((p, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {p.title}
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Facility Operations & Help Contact */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        
        {/* Hours */}
        <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-100 space-y-3">
          <div className="flex items-center gap-2.5 text-slate-900 font-bold text-sm">
            <Clock className="w-4 h-4 text-emerald-600" />
            Operating Hours
          </div>
          <div className="text-xs text-slate-600 space-y-2">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400">Monday – Friday</span>
              <span className="font-semibold text-slate-800">06:30 – 23:00</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400">Saturday</span>
              <span className="font-semibold text-slate-800">07:00 – 22:00</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Sunday</span>
              <span className="font-semibold text-slate-800">08:00 – 21:00</span>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-100 space-y-3">
          <div className="flex items-center gap-2.5 text-slate-900 font-bold text-sm">
            <HelpCircle className="w-4 h-4 text-emerald-600" />
            Recreation Desk Support
          </div>
          <div className="text-xs text-slate-600 space-y-2.5">
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>Campus Rec Front Desk: (555) 019-4820</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>recreation-courts@university.edu</span>
            </div>
            <p className="text-[11px] text-slate-400 pt-1">
              Building 4, Room 102 • Student Athletic Complex
            </p>
          </div>
        </div>

      </div>

      {/* CTA */}
      <div className="text-center pt-4">
        <button
          type="button"
          onClick={onStartBooking}
          className="px-8 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm shadow-md shadow-emerald-500/25 transition-all active:scale-95"
        >
          Book Your Court Now →
        </button>
      </div>
    </div>
  );
}
