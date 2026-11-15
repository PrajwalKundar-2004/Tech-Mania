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

          {/* Mobile Hamburger Button with Smooth Icon Rotation */}
          <div className="flex items-center sm:hidden space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-[#0A1930]/90 border border-[#00A6FF]/40 hover:border-[#00E5FF] transition-all shadow-md active:scale-95 cursor-pointer"
              aria-label="Toggle menu"
            >
              <div className={`transition-transform duration-300 transform ${mobileMenuOpen ? 'rotate-90 text-[#00E5FF]' : 'rotate-0 text-white'}`}>
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown with Silky Smooth Staggering & Fading */}
      {mobileMenuOpen && (
        <div className="sm:hidden glass-panel mt-2.5 mx-3.5 p-4 rounded-2xl border border-[#00E5FF]/40 shadow-[0_12px_40px_rgba(0,0,0,0.85)] space-y-3 animate-mobile-menu backdrop-blur-2xl bg-[#061426]/95 overflow-hidden">
          <div className="flex flex-col space-y-1 font-medium text-sm">
            <button
              onClick={() => scrollTo('hero')}
              className="animate-nav-item-1 text-left py-2.5 px-3.5 rounded-xl text-white hover:bg-[#0A1930]/90 hover:text-[#00E5FF] active:scale-[0.98] transition-all duration-200 flex items-center justify-between group cursor-pointer"
            >
              <span>Home</span>
              <span className="text-[#00E5FF] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200">→</span>
            </button>
            <button
              onClick={() => scrollTo('events')}
              className="animate-nav-item-2 text-left py-2.5 px-3.5 rounded-xl text-white hover:bg-[#0A1930]/90 hover:text-[#00E5FF] active:scale-[0.98] transition-all duration-200 flex items-center justify-between group cursor-pointer"
            >
              <span>Explore Events</span>
              <span className="text-[10px] bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/30 px-2.5 py-0.5 rounded-full font-bold font-mono">4 Events</span>
            </button>
            <button
              onClick={() => scrollTo('about')}
              className="animate-nav-item-3 text-left py-2.5 px-3.5 rounded-xl text-white hover:bg-[#0A1930]/90 hover:text-[#00E5FF] active:scale-[0.98] transition-all duration-200 flex items-center justify-between group cursor-pointer"
            >
              <span>About TechMania</span>
              <span className="text-[#00E5FF] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200">→</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenBrochure();
              }}
              className="animate-nav-item-4 text-left py-2.5 px-3.5 rounded-xl text-[#00E5FF] hover:bg-[#0A1930]/90 active:scale-[0.98] transition-all duration-200 flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#00E5FF]" />
                <span>Official Brochure</span>
              </div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-[#00E5FF]/80">View</span>
            </button>
          </div>

          <div className="animate-nav-item-5 pt-2.5 border-t border-[#00A6FF]/20 flex flex-col space-y-2">
            <button
              onClick={() => scrollTo('events')}
              className="btn-cyber-primary w-full py-2.5 rounded-xl text-center text-xs uppercase tracking-wider font-bold shadow-lg shadow-[#00A6FF]/30 flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>Register Now</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
