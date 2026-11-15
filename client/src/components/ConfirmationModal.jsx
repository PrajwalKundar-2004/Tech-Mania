import React, { useEffect } from 'react';
import { 
  CheckCircle2, 
  X, 
  Sparkles, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Hash, 
  Award,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSuccessSound } from '../utils/soundEffects';

export default function ConfirmationModal({ registration, isOpen, onClose }) {
  useEffect(() => {
    if (isOpen) {
      // Play celebratory chime & confetti explosion
      playSuccessSound();
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#006BFF', '#00A6FF', '#00E5FF', '#F8FAFC'],
      });
    }
  }, [isOpen]);

  if (!isOpen || !registration) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-300">
      <div className="relative w-full max-w-[340px] sm:max-w-[380px] rounded-2xl bg-[#0A1930] border-2 border-[#00E5FF] shadow-2xl shadow-[#00E5FF]/30 p-4 sm:p-5 my-auto max-h-[90vh] overflow-y-auto text-center">
        
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-16 bg-gradient-to-b from-[#00E5FF]/25 to-transparent blur-2xl pointer-events-none"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#061426] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Icon */}
        <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-tr from-[#006BFF] via-[#00A6FF] to-[#00E5FF] p-[1.5px] shadow-lg shadow-[#00E5FF]/40 flex items-center justify-center">
          <div className="w-full h-full bg-[#020817] rounded-[10px] flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7 text-[#00E5FF]" />
          </div>
        </div>

        {/* Heading & Confirmation Message */}
        <div className="mt-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-widest bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold">
            <Check className="w-3 h-3" />
            <span>Registration Confirmed</span>
          </span>

          <h3 className="text-xl font-black text-white mt-1.5 tracking-tight font-mono">
            Congratulations!
          </h3>
          <p className="text-xs font-semibold text-[#00E5FF] mt-1 leading-snug">
            You are successfully registered for <span className="text-white font-bold">{registration.eventName}</span>.
          </p>
        </div>

        {/* Participant Details Card */}
        <div className="mt-4 p-3.5 rounded-xl bg-[#061426] border border-[#00A6FF]/30 text-left space-y-2.5">
          
          <div className="flex items-center justify-between pb-2 border-b border-[#00A6FF]/20">
            <span className="text-xs text-[#94A3B8] flex items-center gap-1.5 font-mono">
              <Hash className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span>Register Number</span>
            </span>
            <span className="text-xs font-mono font-bold text-[#00E5FF] px-2 py-0.5 rounded bg-[#00E5FF]/10 border border-[#00E5FF]/30">
              #{registration.registrationNumber}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-[#94A3B8] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#00A6FF]" />
              <span>Participant</span>
            </span>
            <span className="text-xs font-bold text-white">
              {registration.fullName}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-[#94A3B8] flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-[#00A6FF]" />
              <span>USN</span>
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {registration.usn}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-[#94A3B8] flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-[#00A6FF]" />
              <span>Event</span>
            </span>
            <span className="text-xs font-bold text-[#00E5FF]">
              {registration.eventName}
            </span>
          </div>
        </div>

        {/* Done Button */}
        <div className="mt-4">
          <button
            onClick={onClose}
            className="btn-cyber-primary w-full py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs shadow-lg shadow-[#00A6FF]/30"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
