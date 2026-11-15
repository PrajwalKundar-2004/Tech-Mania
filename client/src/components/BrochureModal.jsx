import React from 'react';
import { X, Download, Sparkles, ExternalLink } from 'lucide-react';

export default function BrochureModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-hidden animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-auto max-w-[92vw] sm:max-w-[460px] rounded-2xl bg-[#0A1930] border border-[#00E5FF]/50 shadow-2xl shadow-black/90 p-3 sm:p-4 my-auto overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-[#00A6FF]/20 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-[#006BFF]/20 text-[#00E5FF]">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-wide font-mono leading-none">
                TECHMANIA 2.0
              </h3>
              <span className="text-[10px] text-[#00E5FF] font-mono">Official Event Brochure</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <a
              href="/TECHMANIA 2.0.png"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-[#061426] hover:bg-[#0A1930] text-[#94A3B8] hover:text-[#00E5FF] border border-[#00A6FF]/25 transition-colors"
              title="Open full size in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <a
              href="/TECHMANIA 2.0.png"
              download="TECHMANIA 2.0.png"
              className="px-2.5 py-1.5 rounded-lg bg-[#006BFF]/20 hover:bg-[#006BFF]/40 text-[#00E5FF] border border-[#00A6FF]/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Download brochure image"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-xs">Save</span>
            </a>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#061426] transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Brochure Image: Perfectly fitted & centered */}
        <div className="my-2.5 flex-1 min-h-0 flex items-center justify-center overflow-hidden rounded-xl bg-[#020817] p-1 border border-[#00A6FF]/20">
          <img
            src="/TECHMANIA 2.0.png"
            alt="Official TECHMANIA 2.0 Brochure - VCET MCA"
            className="max-h-[68vh] sm:max-h-[72vh] w-auto h-auto max-w-full object-contain rounded-lg shadow-xl"
          />
        </div>

        {/* Footer info */}
        <div className="pt-2 border-t border-[#00A6FF]/20 flex items-center justify-between text-[10px] sm:text-[11px] text-[#94A3B8] font-mono flex-shrink-0">
          <span>VCET MCA • Nehru Nagar, Puttur</span>
          <span className="text-[#00E5FF] font-semibold">Nov 16 • 2:00 PM</span>
        </div>

      </div>
    </div>
  );
}
