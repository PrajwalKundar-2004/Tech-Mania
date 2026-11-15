import React, { useState } from 'react';
import { 
  LayoutGrid, 
  Gamepad2, 
  Brain, 
  Lock, 
  Users, 
  Clock, 
  MapPin, 
  ChevronRight, 
  AlertCircle,
  ShieldAlert,
  RotateCcw
} from 'lucide-react';

const getEventVisuals = (name = '', code = '') => {
  const n = (name || '').toLowerCase();
  const c = (code || '').toLowerCase();

  // 1. Pixel Perfect -> Precision Pixel Grid
  if (n.includes('pixel') || c === 'pxlp') {
    return {
      icon: LayoutGrid,
      gradient: 'from-[#006BFF] to-[#00E5FF]',
      iconColor: 'text-[#00E5FF]',
      accentBg: 'shadow-[#00E5FF]/20',
    };
  }

  // 2. Fun.exe -> Gaming & Executable Entertainment
  if (n.includes('fun') || c === 'fnex') {
    return {
      icon: Gamepad2,
      gradient: 'from-[#8B5CF6] via-[#A855F7] to-[#00E5FF]',
      iconColor: 'text-purple-300',
      accentBg: 'shadow-purple-500/20',
    };
  }

  // 3. LOGIX -> Neural & Algorithmic Logic
  if (n.includes('logix') || c === 'lgix') {
    return {
      icon: Brain,
      gradient: 'from-[#006BFF] via-[#00A6FF] to-[#38BDF8]',
      iconColor: 'text-sky-300',
      accentBg: 'shadow-sky-500/20',
    };
  }

  // 4. DeadLock -> Concurrency Lock / Mutual Exclusion
  if (n.includes('dead') || c === 'ddlk') {
    return {
      icon: Lock,
      gradient: 'from-[#EF4444] via-[#F43F5E] to-[#00A6FF]',
      iconColor: 'text-rose-300',
      accentBg: 'shadow-rose-500/20',
    };
  }

  return {
    icon: LayoutGrid,
    gradient: 'from-[#006BFF] to-[#00E5FF]',
    iconColor: 'text-[#00E5FF]',
    accentBg: 'shadow-[#00A6FF]/20',
  };
};

export default function EventCard({ event, onRegister }) {
  // Continuous rotation angle: increases by +180deg on every tap to keep flipping in the same direction
  const [rotation, setRotation] = useState(0);
  const visuals = getEventVisuals(event.name, event.code);
  const IconComponent = visuals.icon;

  // Calculate percentage filled
  const max = event.maximumParticipants || 14;
  const registered = event.registeredCount || 0;
  const remaining = Math.max(0, max - registered);
  const percentage = Math.min(100, Math.round((registered / max) * 100));

  // Determine status color and state
  const isFull = event.status === 'FULL' || remaining <= 0;
  const isClosed = event.status === 'CLOSED';
  const isFastFilling = remaining <= 3 && !isFull && !isClosed;

  let badgeColor = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
  let badgeText = 'OPEN';

  if (isClosed) {
    badgeColor = 'bg-gray-500/15 text-gray-400 border-gray-500/30';
    badgeText = 'CLOSED';
  } else if (isFull) {
    badgeColor = 'bg-rose-500/15 text-rose-400 border-rose-500/30';
    badgeText = 'FULL';
  } else if (isFastFilling) {
    badgeColor = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
    badgeText = `${remaining} LEFT`;
  }

  // Continuous same-direction flip
  const handleFlip = () => {
    setRotation((prev) => prev + 180);
  };

  const handleRegisterClick = (e) => {
    e.stopPropagation();
    onRegister(event);
  };

  return (
    <div className="w-full max-w-[320px] sm:max-w-none mx-auto perspective-1000 h-[270px] sm:h-[280px]">
      
      {/* 3D Flip Card Inner Container with Continuous Same-Direction Rotation */}
      <div 
        onClick={handleFlip}
        style={{ transform: `rotateY(${rotation}deg)` }}
        className="w-full h-full relative transition-transform duration-600 ease-in-out transform-style-3d cursor-pointer group"
      >
        
        {/* ================= FRONT SIDE OF CARD ================= */}
        <div className="absolute inset-0 w-full h-full rounded-xl sm:rounded-2xl bg-[#0A1930] border border-[#00A6FF]/25 p-3.5 sm:p-4 flex flex-col justify-between backface-hidden transition-all duration-300 tech-glow-card-hover hover:border-[#00E5FF] overflow-hidden shadow-lg shadow-black/40">
          
          {/* Decorative top corner accent */}
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-[#00E5FF]/10 via-transparent to-transparent pointer-events-none"></div>

          <div>
            {/* Top Header: Matching Custom Icon & Compact Status Badge */}
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${visuals.gradient} p-[1.5px] shadow-md ${visuals.accentBg} flex-shrink-0`}>
                <div className="w-full h-full bg-[#061426] rounded-[6px] flex items-center justify-center">
                  <IconComponent className={`w-4 h-4 ${visuals.iconColor} group-hover:scale-110 transition-transform`} />
                </div>
              </div>

              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider uppercase border ${badgeColor}`}>
                {badgeText}
              </span>
            </div>

            {/* Event Title */}
            <h3 className="text-lg sm:text-xl font-black text-white group-hover:text-[#00E5FF] transition-colors tracking-tight font-mono leading-tight">
              {event.name}
            </h3>

            {/* Venue & Schedule */}
            <div className="mt-1.5 pt-1.5 border-t border-[#00A6FF]/15 flex items-center justify-between text-[10px] sm:text-[11px] text-[#94A3B8] font-mono">
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                <span className="text-white font-medium truncate max-w-[130px]">{event.venue || 'APJ Hall'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#00E5FF] flex-shrink-0" />
                <span>{event.time || '2:00 PM'}</span>
              </div>
            </div>

            {/* Capacity & Progress Bar */}
            <div className="mt-1.5 bg-[#061426] p-2 rounded-lg border border-[#00A6FF]/15 space-y-1">
              <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono">
                <span className="text-[#94A3B8] flex items-center gap-1">
                  <Users className="w-3 h-3 text-[#00E5FF]" />
                  <span>Slots</span>
                </span>
                <div className="text-right">
                  <span className="font-bold text-white">{registered}</span>
                  <span className="text-[#94A3B8]"> / {max}</span>
                  <span className="text-[#00E5FF] font-bold ml-1">({remaining} left)</span>
                </div>
              </div>

              {/* Progress bar container */}
              <div className="w-full h-1.5 rounded-full bg-[#020817] overflow-hidden p-[0.5px]">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    isFull
                      ? 'bg-rose-500 shadow-[0_0_6px_#F43F5E]'
                      : isFastFilling
                      ? 'bg-amber-400 shadow-[0_0_6px_#F59E0B]'
                      : 'bg-gradient-to-r from-[#006BFF] via-[#00A6FF] to-[#00E5FF] shadow-[0_0_6px_#00E5FF]'
                  }`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Bottom Controls: Lighter Blinking "tap to see rules" + Register Button */}
          <div className="mt-2 space-y-1.5">
            {/* Lighter, Continuously Blinking "tap to see rules" */}
            <div 
              onClick={(e) => {
                e.stopPropagation();
                handleFlip();
              }}
              className="animate-neon-blink py-0.5 px-2.5 rounded-full bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 border border-[#00E5FF]/40 flex items-center justify-center gap-1 text-[10px] sm:text-[11px] font-mono text-[#00E5FF] font-semibold tracking-wider uppercase transition-all cursor-pointer select-none shadow-[0_0_8px_rgba(0,229,255,0.15)]"
            >
              <RotateCcw className="w-2.5 h-2.5 text-[#00E5FF]" />
              <span>tap to see rules</span>
            </div>

            {/* Action Button: Compact Register Now */}
            <button
              onClick={handleRegisterClick}
              disabled={isFull || isClosed}
              className={`w-full py-1.5 sm:py-2 px-3 rounded-lg sm:rounded-xl font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-1.5 transition-all ${
                isFull || isClosed
                  ? 'bg-gray-800/80 text-gray-500 border border-gray-700 cursor-not-allowed'
                  : 'btn-cyber-primary shadow-md'
              }`}
            >
              {isClosed ? (
                <>
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Closed</span>
                </>
              ) : isFull ? (
                <>
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>All Slots Filled</span>
                </>
              ) : (
                <>
                  <span>Register Now</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>

        </div>

        {/* ================= BACK SIDE OF CARD (FLIPPED: RULES) ================= */}
        <div className="absolute inset-0 w-full h-full rounded-xl sm:rounded-2xl bg-[#061426] border-2 border-[#00E5FF]/60 p-3.5 sm:p-4 flex flex-col justify-between backface-hidden rotate-y-180 shadow-2xl shadow-black/80 overflow-hidden">
          
          {/* Decorative neon ambient top line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00E5FF] to-transparent"></div>

          {/* Top Header */}
          <div className="flex items-center justify-between gap-2 border-b border-[#00A6FF]/25 pb-1.5">
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${visuals.gradient} p-[1px] flex-shrink-0`}>
                <div className="w-full h-full bg-[#061426] rounded-[5px] flex items-center justify-center">
                  <IconComponent className={`w-3 h-3 ${visuals.iconColor}`} />
                </div>
              </div>
              <h4 className="text-xs sm:text-sm font-black text-white font-mono leading-tight">{event.name}</h4>
            </div>
            <span className="text-[9px] font-mono text-[#00E5FF] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30">
              Rules
            </span>
          </div>

          {/* 3 Explicit Event Rules */}
          <div className="space-y-1.5 my-auto py-1">
            {/* Rule 1 */}
            <div className="flex items-start gap-2 p-1.5 rounded-lg bg-[#0A1930]/90 border border-[#00A6FF]/20 shadow-sm">
              <span className="w-4 h-4 rounded-full bg-[#006BFF]/30 text-[#00E5FF] font-mono text-[10px] font-black flex items-center justify-center flex-shrink-0 mt-0.5 border border-[#00E5FF]/40">
                1
              </span>
              <p className="text-[11px] text-[#F8FAFC] font-medium leading-tight">
                strictly select one event
              </p>
            </div>

            {/* Rule 2 */}
            <div className="flex items-start gap-2 p-1.5 rounded-lg bg-[#0A1930]/90 border border-[#00A6FF]/20 shadow-sm">
              <span className="w-4 h-4 rounded-full bg-[#006BFF]/30 text-[#00E5FF] font-mono text-[10px] font-black flex items-center justify-center flex-shrink-0 mt-0.5 border border-[#00E5FF]/40">
                2
              </span>
              <p className="text-[11px] text-[#F8FAFC] font-medium leading-tight">
                Rules will be disclosed on spot
              </p>
            </div>

            {/* Rule 3 */}
            <div className="flex items-start gap-2 p-1.5 rounded-lg bg-[#0A1930]/90 border border-[#00A6FF]/20 shadow-sm">
              <span className="w-4 h-4 rounded-full bg-[#006BFF]/30 text-[#00E5FF] font-mono text-[10px] font-black flex items-center justify-center flex-shrink-0 mt-0.5 border border-[#00E5FF]/40">
                3
              </span>
              <p className="text-[11px] text-[#F8FAFC] font-medium leading-tight">
                remember the event you selected
              </p>
            </div>
          </div>

          {/* Bottom Controls: Similar Blinking "tap to flip" + Register Button */}
          <div className="mt-2 space-y-1.5">
            {/* Similar Lighter, Continuously Blinking "tap to flip" */}
            <div 
              onClick={(e) => {
                e.stopPropagation();
                handleFlip();
              }}
              className="animate-neon-blink py-0.5 px-2.5 rounded-full bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 border border-[#00E5FF]/40 flex items-center justify-center gap-1 text-[10px] sm:text-[11px] font-mono text-[#00E5FF] font-semibold tracking-wider uppercase transition-all cursor-pointer select-none shadow-[0_0_8px_rgba(0,229,255,0.15)]"
            >
              <RotateCcw className="w-2.5 h-2.5 text-[#00E5FF]" />
              <span>tap to flip</span>
            </div>

            {/* Action Button: Compact Register Now */}
            <button
              onClick={handleRegisterClick}
              disabled={isFull || isClosed}
              className={`w-full py-1.5 sm:py-2 px-3 rounded-lg sm:rounded-xl font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-1.5 transition-all ${
                isFull || isClosed
                  ? 'bg-gray-800/80 text-gray-500 border border-gray-700 cursor-not-allowed'
                  : 'btn-cyber-primary shadow-md'
              }`}
            >
              {isClosed ? (
                <>
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Closed</span>
                </>
              ) : isFull ? (
                <>
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>All Slots Filled</span>
                </>
              ) : (
                <>
                  <span>Register Now</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
