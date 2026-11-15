import React, { useState, useEffect } from 'react';
import { Menu, X, Sparkles } from 'lucide-react';

export default function Navbar({ onOpenBrochure }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'glass-nav py-3'
          : 'bg-transparent py-5'
      }`}
    >
      {/* Subtle dissolved bottom accent glow */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-[1px] transition-opacity duration-300 pointer-events-none ${
          scrolled
            ? 'bg-gradient-to-r from-transparent via-[#006BFF]/30 to-transparent opacity-100'
            : 'opacity-0'
        }`}
      />
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10">
        <div className="flex items-center justify-between">
          {/* Brand Logo & College Identity */}
          <div
            onClick={() => scrollTo('hero')}
            className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer group"
          >
            {/* Official TechMania Logo */}
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden flex items-center justify-center bg-black/70 border border-[#00E5FF]/40 shadow-lg shadow-[#00A6FF]/30 group-hover:shadow-[#00E5FF]/60 group-hover:border-[#00E5FF] transition-all flex-shrink-0 p-0.5">
              <img
                src="/techmania-logo.jpg"
                alt="TechMania 2.0 Logo"
                className="w-full h-full object-contain group-hover:scale-105 transition-transform"
              />
            </div>

            <div>
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <span className="font-extrabold tracking-wider text-base sm:text-xl md:text-2xl text-white group-hover:text-[#00E5FF] transition-colors whitespace-nowrap">
                  TECHMANIA <span className="text-[#00E5FF]">2.0</span>
                </span>
                <span className="hidden md:inline-block px-2 py-0.5 text-[10px] uppercase font-bold tracking-widest bg-[#006BFF]/20 text-[#00E5FF] border border-[#00E5FF]/40 rounded-full">
                  MCA VCET
                </span>
              </div>
              <p className="text-[10px] text-[#94A3B8] font-mono tracking-tight hidden lg:block">
                VCET Puttur • Dept. of MCA
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center space-x-8">
            <button
              onClick={() => scrollTo('hero')}
              className="text-sm font-medium text-[#F8FAFC]/80 hover:text-[#00E5FF] transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => scrollTo('events')}
              className="text-sm font-medium text-[#F8FAFC]/80 hover:text-[#00E5FF] transition-colors flex items-center gap-1.5"
            >
              <span>Events</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse"></span>
            </button>
            <button
              onClick={() => scrollTo('about')}
              className="text-sm font-medium text-[#F8FAFC]/80 hover:text-[#00E5FF] transition-colors"
            >
              About
            </button>
            <button
              onClick={onOpenBrochure}
              className="text-sm font-medium text-[#00A6FF] hover:text-[#00E5FF] transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Brochure</span>
            </button>
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden sm:flex items-center space-x-3">
            <button
              onClick={() => scrollTo('events')}
              className="btn-cyber-primary px-5 py-2.5 text-xs uppercase tracking-wider rounded-xl font-bold shadow-md shadow-[#00A6FF]/30"
            >
              Register Now
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center sm:hidden space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-white hover:text-[#00E5FF] rounded-lg bg-[#0A1930]/80 border border-[#00A6FF]/30"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden glass-panel mt-3 mx-4 p-5 rounded-2xl border border-[#00E5FF]/30 shadow-2xl space-y-4 animate-in fade-in slide-in-from-top-4">
          <div className="flex flex-col space-y-3 font-medium text-sm">
            <button
              onClick={() => scrollTo('hero')}
              className="text-left py-2 px-3 rounded-lg text-white hover:bg-[#061426] hover:text-[#00E5FF]"
            >
              Home
            </button>
            <button
              onClick={() => scrollTo('events')}
              className="text-left py-2 px-3 rounded-lg text-white hover:bg-[#061426] hover:text-[#00E5FF] flex items-center justify-between"
            >
              <span>Explore Events</span>
              <span className="text-[10px] bg-[#00E5FF]/20 text-[#00E5FF] px-2 py-0.5 rounded-full font-bold">4 Events</span>
            </button>
            <button
              onClick={() => scrollTo('about')}
              className="text-left py-2 px-3 rounded-lg text-white hover:bg-[#061426] hover:text-[#00E5FF]"
            >
              About Techmania
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenBrochure();
              }}
              className="text-left py-2 px-3 rounded-lg text-[#00E5FF] hover:bg-[#061426] flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Official Brochure</span>
            </button>
          </div>

          <div className="pt-3 border-t border-[#00A6FF]/20 flex flex-col space-y-2">
            <button
              onClick={() => scrollTo('events')}
              className="btn-cyber-primary w-full py-2.5 rounded-xl text-center text-xs uppercase tracking-wider font-bold"
            >
              Register for an Event
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
