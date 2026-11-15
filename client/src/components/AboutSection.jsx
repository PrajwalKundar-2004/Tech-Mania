import React from 'react';
import { 
  Sparkles, 
  Users, 
  Heart,
  Terminal,
  Compass
} from 'lucide-react';

export default function AboutSection() {
  return (
    <section id="about" className="py-12 sm:py-16 relative bg-[#020817] overflow-hidden">
      {/* Decorative ambient elements */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#061426] border border-[#00A6FF]/40 text-[#00E5FF] text-xs font-semibold uppercase tracking-wider mb-2.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Built by Seniors, for Juniors</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            About <span className="text-[#00E5FF]">TECHMANIA 2.0</span>
          </h2>
        </div>

        {/* Main Experience Highlight Banner */}
        <div className="space-y-5">
          
          {/* Banner Tagline */}
          <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-[#006BFF]/20 via-[#00A6FF]/20 to-[#00E5FF]/20 border border-[#00E5FF]/40 text-center shadow-lg shadow-[#00E5FF]/10">
            <p className="text-base sm:text-xl font-black text-white tracking-wide leading-snug">
              More than an event, it's an experience built by seniors, for juniors!
            </p>
          </div>

          {/* Core Story & Vision Card */}
          <div className="p-5 sm:p-8 rounded-2xl bg-[#0A1930] border border-[#00A6FF]/25 space-y-4 shadow-xl">
            <p className="text-sm sm:text-base text-[#F8FAFC] leading-relaxed">
              TECHMANIA 2.0 is a special initiative by the Department of MCA, organized under the <strong className="text-[#00E5FF]">ANKURAM Association</strong> of <strong>Vivekananda College of Engineering and Technology, Puttur</strong>.
            </p>

            <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed">
              As seniors, we believe college life is not just about classrooms, assignments, and examinations. It's also about discovering talents, building connections, sharing knowledge, and creating unforgettable memories.
            </p>

            <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed">
              With this thought, we bring TECHMANIA 2.0 – a platform where our juniors can step beyond their comfort zones, showcase their abilities, challenge themselves, and experience the excitement of friendly competition.
            </p>

            <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed">
              Whether it's creativity, technical knowledge, problem-solving, or teamwork, this event is all about participation, innovation, learning, and having fun together.
            </p>
          </div>

          {/* Goal Highlight Box */}
          <div className="p-4 sm:p-6 rounded-2xl bg-[#061426] border-2 border-[#00A6FF]/35 flex flex-col sm:flex-row items-center gap-4 shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-[#006BFF]/20 border border-[#00E5FF]/40 text-[#00E5FF] flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div className="text-center sm:text-left space-y-1">
              <span className="text-xs font-mono font-bold text-[#00E5FF] uppercase tracking-wider block">
                Our goal is simple:
              </span>
              <p className="text-sm sm:text-base font-semibold text-white leading-relaxed">
                To bring juniors together, encourage their potential, strengthen the bond between seniors and juniors, and make every moment count.
              </p>
            </div>
          </div>

          {/* Call to Action & Concluding Quote */}
          <div className="text-center space-y-3 pt-3">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-[#0A1930] border border-[#00E5FF]/40 text-xs sm:text-sm font-mono font-bold text-[#00E5FF] tracking-[0.2em] uppercase">
              <span>CODE</span>
              <span className="text-[#006BFF]">•</span>
              <span>INNOVATE</span>
              <span className="text-[#006BFF]">•</span>
              <span>COMPETE</span>
            </div>

            <p className="text-base sm:text-lg font-bold text-white italic max-w-xl mx-auto leading-relaxed pt-1">
              “Because the best memories are created when we learn, compete, and grow together.”
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}
