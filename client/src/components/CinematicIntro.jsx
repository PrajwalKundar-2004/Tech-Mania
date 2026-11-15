import React, { useState, useEffect, useRef } from 'react';

export default function CinematicIntro({ onComplete }) {
  // stages: 0: Init, 1: Flare, 2: Logo Reveal, 3: Title Glint Sweep, 4: Tagline, 5: Dissolve
  const [stage, setStage] = useState(0);
  const [isSkipped, setIsSkipped] = useState(false);
  const stageTimers = useRef([]);

  const handleSkip = (e) => {
    if (e) e.stopPropagation();
    if (isSkipped) return;
    setIsSkipped(true);
    setStage(5);
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  useEffect(() => {
    // Stage 1: Flare & shockwaves expand (250ms)
    stageTimers.current.push(setTimeout(() => setStage(1), 250));

    // Stage 2: Logo reveal with glowing orbit (750ms)
    stageTimers.current.push(setTimeout(() => setStage(2), 750));

    // Stage 3: Title TECHMANIA displays with metallic glint sweep (1400ms)
    stageTimers.current.push(setTimeout(() => setStage(3), 1400));

    // Stage 4: Tagline appears (2100ms)
    stageTimers.current.push(setTimeout(() => setStage(4), 2100));

    // Stage 5: Cinematic dissolve to home page (3300ms)
    stageTimers.current.push(setTimeout(() => {
      setStage(5);
      setTimeout(() => {
        onComplete();
      }, 700);
    }, 3300));

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        handleSkip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      stageTimers.current.forEach(clearTimeout);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#01040A] text-white overflow-hidden transition-all duration-700 ease-out select-none pointer-events-auto ${stage === 5 ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
        }`}
    >
      {/* Deep Cyber Anamorphic Lens Flare Line */}
      <div
        className={`absolute w-full h-[2px] bg-gradient-to-r from-transparent via-[#00E5FF] to-transparent pointer-events-none transition-all duration-1000 ${stage >= 1 ? 'opacity-90 scale-x-100 shadow-[0_0_30px_#00E5FF]' : 'opacity-0 scale-x-0'
          }`}
      />

      {/* Radial Blue Cinema Nebula Backdrop */}
      <div
        className={`absolute w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-[#006BFF]/30 via-[#00A6FF]/20 to-[#00E5FF]/25 blur-[120px] pointer-events-none transition-all duration-1000 ${stage >= 1 ? 'scale-100 opacity-80' : 'scale-50 opacity-0'
          }`}
      />

      {/* Expanding Cyber Shockwave Rings */}
      {stage >= 1 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[320px] sm:w-[500px] h-[320px] sm:h-[500px] rounded-full border border-[#00E5FF]/30 animate-ping opacity-25" />
          <div className="w-[200px] sm:w-[350px] h-[200px] sm:h-[350px] rounded-full border border-[#006BFF]/40 animate-pulse opacity-40" />
        </div>
      )}

      {/* Skip Button (Top Right) */}
      <button
        onClick={handleSkip}
        className="absolute top-6 right-6 z-30 px-3.5 py-1.5 rounded-full bg-black/60 hover:bg-[#061426] border border-[#00A6FF]/40 hover:border-[#00E5FF] text-[11px] font-mono font-semibold tracking-wider text-[#94A3B8] hover:text-[#00E5FF] transition-all flex items-center gap-1.5 shadow-lg group backdrop-blur-md cursor-pointer"
      >
        <span>SKIP INTRO</span>
        <span className="group-hover:translate-x-1 transition-transform">→</span>
      </button>

      {/* Top Studio/College Header Banner (Cinema Style) */}
      <div
        className={`relative z-10 text-center mb-6 transition-all duration-700 ${stage >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          }`}
      >
        <span className="text-[10px] sm:text-xs font-mono font-bold tracking-[0.35em] text-[#94A3B8] uppercase block">
          ANKURAM ASSOCIATION • DEPARTMENT OF MCA
        </span>
        <span className="text-[9px] sm:text-[11px] font-mono tracking-[0.25em] text-[#00E5FF]/80 uppercase block mt-1">
          VIVEKANANDA COLLEGE OF ENGINEERING & TECHNOLOGY, PUTTUR
        </span>
      </div>

      {/* Central Movie Logo Reveal with 3D Holographic Glow */}
      <div
        className={`relative z-10 transition-all duration-1000 ease-out transform ${stage >= 2
          ? 'scale-100 opacity-100 filter drop-shadow-[0_0_40px_rgba(0,229,255,0.8)]'
          : 'scale-75 opacity-0 filter blur-sm'
          }`}
      >
        <div className="relative w-28 h-28 sm:w-36 sm:h-36 mx-auto rounded-3xl p-1 bg-gradient-to-tr from-[#006BFF] via-[#00A6FF] to-[#00E5FF] shadow-2xl shadow-[#00E5FF]/50 flex items-center justify-center">
          <div className="w-full h-full bg-[#01040A] rounded-[22px] overflow-hidden flex items-center justify-center p-2">
            <img
              src="/techmania-logo.jpg"
              alt="TechMania 2.0"
              className="w-full h-full object-contain animate-pulse-glow"
            />
          </div>

          {/* Sweeping Cyan Orbital Sheen Accent */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-[#00E5FF]/40 to-transparent opacity-0 animate-shimmer pointer-events-none" />
        </div>
      </div>

      {/* Blockbuster Cinema 3D Title Reveal & Light Streak */}
      <div
        className={`relative z-10 text-center mt-6 transition-all duration-1000 ease-out transform ${stage >= 3
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 translate-y-6 scale-95'
          }`}
      >
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase font-mono tracking-wider relative inline-block">
          {/* Metallic 3D Title */}
          <span className="techmania-3d-text inline-block">
            TECHMANIA
          </span>{' '}
          <span className="text-[#00E5FF] tech-glow-title inline-block">
            2.0
          </span>

          {/* Cinematic Light Glint Sweep across Text on Title Display */}
          {stage >= 3 && (
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent bg-clip-text text-transparent pointer-events-none animate-cinematic-sweep" />
          )}
        </h1>

        {/* Epic Tagline */}
        <div
          className={`mt-4 flex items-center justify-center gap-3 text-xs sm:text-sm font-mono tracking-[0.3em] font-extrabold text-[#00E5FF] transition-all duration-700 ${stage >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
            }`}
        >
          <span>CODE</span>
          <span className="text-[#94A3B8]">•</span>
          <span>INNOVATE</span>
          <span className="text-[#94A3B8]">•</span>
          <span>COMPETE</span>
        </div>

        <p className={`text-[11px] sm:text-xs text-[#94A3B8] font-mono mt-2 tracking-widest uppercase transition-all duration-700 ${stage >= 4 ? 'opacity-100' : 'opacity-0'
          }`}>
          An Experience Built by Seniors, for Juniors
        </p>
      </div>

      {/* Ambient Bottom Prompt */}
      <div className="absolute bottom-6 z-10 text-[10px] font-mono text-[#94A3B8]/60 tracking-widest uppercase">
        [ Press ESC or Skip to enter ]
      </div>
    </div>
  );
}
