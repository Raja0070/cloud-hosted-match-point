import React, { useState } from 'react';
import { ActiveTab } from '../types';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  hasActiveBooking?: boolean;
  bookingStatus?: 'pending' | 'accepted' | 'rejected';
}

export default function Navbar({
  activeTab,
  onSelectTab,
  hasActiveBooking = false,
  bookingStatus,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (tab: ActiveTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Left: Brand Logo & Tagline */}
        <button
          id="nav-logo-btn"
          onClick={() => handleNavClick('booking')}
          className="flex items-center gap-3 group text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg p-1 transition-transform"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white shadow-sm shadow-emerald-500/30 group-hover:scale-105 transition-transform duration-200">
            {/* Sport Court Icon matching screenshot */}
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="18" x="3" y="3" rx="4" />
              <path d="M3 12h18" />
              <path d="M12 3v18" />
              <circle cx="12" cy="12" r="2.5" fill="white" stroke="none" />
            </svg>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 leading-tight">
                MATCHPOINT
              </span>
              <span className="text-xs px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold border border-emerald-200/60 tracking-wide">
                AI
              </span>
            </div>
            <span className="text-[11px] font-medium text-slate-400 tracking-wider uppercase">
              Match. Book. Play.
            </span>
          </div>
        </button>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <button
            id="nav-my-booking-btn"
            onClick={() => handleNavClick('my-booking')}
            className={`py-1 relative inline-flex items-center gap-1.5 transition-colors ${
              activeTab === 'my-booking'
                ? 'text-emerald-600 font-semibold'
                : 'hover:text-emerald-600 text-slate-600'
            }`}
          >
            <span>My Booking</span>
            {hasActiveBooking && (
              <span
                className={`w-2 h-2 rounded-full ${
                  bookingStatus === 'accepted'
                    ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50'
                    : bookingStatus === 'rejected'
                    ? 'bg-rose-500 shadow-sm shadow-rose-500/50'
                    : 'bg-amber-500 animate-pulse shadow-sm shadow-amber-500/50'
                }`}
                title={`Booking status: ${bookingStatus || 'pending'}`}
              />
            )}
            {activeTab === 'my-booking' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />
            )}
          </button>

          <button
            id="nav-courts-btn"
            onClick={() => handleNavClick('courts')}
            className={`py-1 relative transition-colors ${
              activeTab === 'courts'
                ? 'text-emerald-600 font-semibold'
                : 'hover:text-emerald-600 text-slate-600'
            }`}
          >
            Courts
            {activeTab === 'courts' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />
            )}
          </button>

          <button
            id="nav-campus-hub-btn"
            onClick={() => handleNavClick('hub')}
            className={`py-1 relative transition-colors ${
              activeTab === 'hub'
                ? 'text-emerald-600 font-semibold'
                : 'hover:text-emerald-600 text-slate-600'
            }`}
          >
            Campus Hub
            {activeTab === 'hub' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />
            )}
          </button>

          <button
            id="nav-about-btn"
            onClick={() => handleNavClick('about')}
            className={`py-1 relative transition-colors ${
              activeTab === 'about'
                ? 'text-emerald-600 font-semibold'
                : 'hover:text-emerald-600 text-slate-600'
            }`}
          >
            About
            {activeTab === 'about' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />
            )}
          </button>
        </nav>

        {/* Right: Fast Book CTA & Mobile Hamburger */}
        <div className="flex items-center gap-3">
          <button
            id="nav-book-court-cta"
            onClick={() => handleNavClick('booking')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 active:scale-95 shadow-sm ${
              activeTab === 'booking'
                ? 'bg-emerald-600 text-white shadow-emerald-500/25'
                : 'text-emerald-800 bg-emerald-50 border border-emerald-200/80 hover:bg-emerald-500 hover:text-white hover:border-emerald-500'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Book a Court</span>
          </button>

          {/* Mobile menu trigger */}
          <button
            id="mobile-menu-toggle"
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-5 space-y-2 shadow-lg animate-in slide-in-from-top-2">
          <button
            id="mobile-nav-booking-btn"
            onClick={() => handleNavClick('booking')}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium ${
              activeTab === 'booking'
                ? 'bg-emerald-50 text-emerald-700 font-semibold'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            Book a Court
          </button>
          <button
            id="mobile-nav-my-booking-btn"
            onClick={() => handleNavClick('my-booking')}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium flex items-center justify-between ${
              activeTab === 'my-booking'
                ? 'bg-emerald-50 text-emerald-700 font-semibold'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span>My Booking</span>
            {hasActiveBooking && (
              <span
                className={`w-2 h-2 rounded-full ${
                  bookingStatus === 'accepted'
                    ? 'bg-emerald-500'
                    : bookingStatus === 'rejected'
                    ? 'bg-rose-500'
                    : 'bg-amber-500 animate-pulse'
                }`}
              />
            )}
          </button>
          <button
            id="mobile-nav-courts-btn"
            onClick={() => handleNavClick('courts')}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium ${
              activeTab === 'courts'
                ? 'bg-emerald-50 text-emerald-700 font-semibold'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            Courts & Facilities
          </button>
          <button
            onClick={() => handleNavClick('hub')}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium ${
              activeTab === 'hub'
                ? 'bg-emerald-50 text-emerald-700 font-semibold'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            Campus Hub
          </button>
          <button
            onClick={() => handleNavClick('about')}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium ${
              activeTab === 'about'
                ? 'bg-emerald-50 text-emerald-700 font-semibold'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            About & Guidelines
          </button>
        </div>
      )}
    </header>
  );
}
