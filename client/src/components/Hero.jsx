import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  ArrowRight, 
  Sparkles, 
  Flame 
} from 'lucide-react';

export default function Hero({ onExploreEvents, onOpenBrochure }) {
  // Countdown Timer to November 16, 2026, 2:00 PM IST
  const targetDate = new Date('2026-11-16T14:00:00+05:30').getTime();

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <section id="hero" className="relative min-h-[90vh] lg:min-h-screen pt-20 pb-8 flex flex-col justify-center items-center overflow-hidden bg-circuit-pattern">
      {/* Subtle radial ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[350px] bg-[#006BFF]/15 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-4 text-center relative z-10 w-full flex flex-col items-center justify-center">
        
        {/* College & Department Header */}
        <div className="mb-3 space-y-1 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <h2 className="text-xs sm:text-sm md:text-base font-bold tracking-wider text-[#F8FAFC] uppercase">
            VIVEKANANDA COLLEGE OF ENGINEERING AND TECHNOLOGY, PUTTUR
          </h2>
          <div className="flex items-center justify-center gap-2 text-[11px] sm:text-xs font-semibold text-[#00A6FF] uppercase tracking-wider">
            <span className="text-[#00E5FF]">DEPARTMENT OF MCA</span>
            <span className="text-[#94A3B8]">•</span>
            <span className="text-white">ANKURAM ASSOCIATION</span>
          </div>
        </div>

        {/* Official Glowing Emblem & 3D Title */}
        <div className="relative my-2 flex flex-col items-center animate-fade-in-up" style={{ animationDelay: '250ms' }}>
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-black/80 border-2 border-[#00E5FF]/50 shadow-xl shadow-[#00E5FF]/30 animate-float-slow mb-2.5 p-1 transition-transform hover:scale-110 duration-300">
            <img
              src="/techmania-logo.jpg"
              alt="TechMania 2.0 Emblem"
              className="w-full h-full object-contain"
            />
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tight uppercase select-none leading-none">
            <span className="techmania-3d-text">
              TECHMANIA
            </span>{' '}
            <span className="text-[#00E5FF] tech-glow-title font-mono">
              2.0
            </span>
          </h1>

          {/* Official Tagline */}
          <div className="mt-2 sm:mt-2.5 flex items-center justify-center space-x-2 sm:space-x-3 text-[11px] sm:text-sm md:text-base font-black tracking-[0.15em] sm:tracking-[0.2em] text-[#00E5FF] uppercase">
            <span>CODE</span>
            <span className="text-[#006BFF]">•</span>
            <span>INNOVATE</span>
            <span className="text-[#006BFF]">•</span>
            <span>COMPETE</span>
          </div>
        </div>

        {/* Compact Info Ribbon: Date, Time, Venue */}
        <div className="mt-3.5 sm:mt-4 glass-panel px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-[#00E5FF]/40 shadow-lg flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-[11px] sm:text-xs font-mono text-[#F8FAFC] animate-fade-in-up transition-all hover:border-[#00E5FF]" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span className="font-bold text-white">NOV 16, 2026</span>
          </div>
          <span className="text-[#00A6FF]/50 hidden sm:inline">•</span>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span className="font-bold text-white">2:00 PM IST</span>
          </div>
          <span className="text-[#00A6FF]/50 hidden sm:inline">•</span>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-bold text-white">APJ HALL</span>
          </div>
        </div>

        {/* Streamlined Countdown Pills */}
        <div className="mt-3.5 sm:mt-4 flex items-center justify-center gap-1.5 sm:gap-2 animate-fade-in-up" style={{ animationDelay: '550ms' }}>
          {[
            { label: 'D', val: timeLeft.days },
            { label: 'H', val: timeLeft.hours },
            { label: 'M', val: timeLeft.minutes },
            { label: 'S', val: timeLeft.seconds },
          ].map((unit, i) => (
            <div
              key={i}
              className="bg-[#0A1930]/90 border border-[#00A6FF]/30 rounded-lg px-2 sm:px-2.5 py-1 text-center min-w-[44px] sm:min-w-[50px] shadow-sm"
            >
              <span className="text-sm sm:text-lg font-mono font-black text-[#00E5FF]">
                {String(unit.val).padStart(2, '0')}
              </span>
              <span className="text-[8px] sm:text-[9px] uppercase font-bold text-[#94A3B8] ml-0.5 sm:ml-1 font-mono">
                {unit.label}
              </span>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-4 sm:mt-5 flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 w-full sm:w-auto max-w-xs sm:max-w-none">
          <button
            onClick={onExploreEvents}
            className="btn-cyber-primary w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-lg"
          >
            <span>Explore Events</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onOpenBrochure}
            className="btn-cyber-outline w-full sm:w-auto px-5 py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span>Brochure</span>
          </button>
        </div>

        {/* Leadership & Cordially Invited Footer */}
        <div className="mt-5 pt-3 border-t border-[#00A6FF]/20 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-[#94A3B8]">
          <span>
            <strong className="text-white">Dr. Jothimani K</strong> (Director MCA)
          </span>
          <span className="text-[#00A6FF]/50 hidden sm:inline">•</span>
          <span>
            <strong className="text-white">Prof. Neema H</strong> (Staff Co-ordinator)
          </span>
          <span className="text-[#00A6FF]/50 hidden sm:inline">•</span>
          <span className="text-[#00E5FF] font-bold">ALL ARE CORDIALLY INVITED</span>
        </div>

      </div>
    </section>
  );
}
