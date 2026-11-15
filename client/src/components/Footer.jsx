import React from 'react';
import { Heart, Sparkles, MapPin, Calendar, Clock, ArrowUp } from 'lucide-react';

export default function Footer({ onOpenBrochure }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-[#020817] border-t border-[#00A6FF]/20 pt-16 pb-8 overflow-hidden">
      {/* Decorative top ambient bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00E5FF] to-transparent"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-[#00A6FF]/20">
          
          {/* Col 1: Brand & College Details */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-black/70 border border-[#00E5FF]/40 shadow-lg shadow-[#00A6FF]/30 p-0.5 flex-shrink-0">
                <img
                  src="/techmania-logo.jpg"
                  alt="TechMania 2.0 Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-extrabold tracking-wider text-xl text-white">
                TECHMANIA <span className="text-[#00E5FF]">2.0</span>
              </span>
            </div>

            <p className="text-xs text-[#94A3B8] leading-relaxed max-w-md">
              Organized by the <strong>Department of MCA</strong> and <strong>ANKURAM ASSOCIATION</strong> at <strong>Vivekananda College of Engineering and Technology, Puttur</strong>. Dedicated to cultivating future leaders in coding, web architecture,  and software innovation.
            </p>

            <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-[#00E5FF]">
              <span>CODE</span>
              <span>•</span>
              <span>INNOVATE</span>
              <span>•</span>
              <span>COMPETE</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Event Navigation
            </h4>
            <ul className="space-y-2 text-xs text-[#94A3B8]">
              <li>
                <a href="#hero" className="hover:text-[#00E5FF] transition-colors">
                  Home Overview
                </a>
              </li>
              <li>
                <a href="#events" className="hover:text-[#00E5FF] transition-colors">
                  All 4 Competitions
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-[#00E5FF] transition-colors">
                  About VCET MCA
                </a>
              </li>
              <li>
                <button onClick={onOpenBrochure} className="hover:text-[#00E5FF] transition-colors">
                  Official Brochure
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Event Venue & Contacts */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Venue & Inquiries
            </h4>
            <div className="space-y-2 text-xs text-[#94A3B8] font-mono">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>APJ Hall, VCET Campus, Nehru Nagar, Puttur – 574203</span>
              </p>
              <p className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#00E5FF] flex-shrink-0" />
                <span>November 16, 2026</span>
              </p>
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#00E5FF] flex-shrink-0" />
                <span>2:00 PM IST</span>
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Credits Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#94A3B8]">
          <p>
            © {new Date().getFullYear()} TECHMANIA 2.0 • Department of MCA, VCET Puttur. All rights reserved.
          </p>

          <button
            onClick={scrollToTop}
            className="p-2 rounded-xl bg-[#0A1930] hover:bg-[#061426] text-[#00E5FF] border border-[#00A6FF]/30 transition-all hover:scale-105"
            title="Scroll to top"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>

      </div>
    </footer>
  );
}
