/**
 * soundEffects.js
 * High-performance, zero-latency Web Audio sound engine for TechMania 2.0
 */

let audioCtx = null;
let isMuted = false;
let lastClickTime = 0;

/**
 * Get or resume the singleton AudioContext
 */
export function getAudioContext() {
  if (typeof window === 'undefined') return null;

  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }

  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }

  return audioCtx;
}

/**
 * Play a tactile, high-tech UI click sound (instantaneous, 0ms latency)
 */
export function playClickSound(intensity = 1.0) {
  if (isMuted) return;

  // Prevent multiple sounds firing simultaneously within 35ms (e.g. nested elements)
  const nowMs = Date.now();
  if (nowMs - lastClickTime < 35) return;
  lastClickTime = nowMs;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const t = ctx.currentTime;

    // 1. Primary tactile transient click (1600Hz down to 280Hz in 30ms)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1500, t);
    osc1.frequency.exponentialRampToValueAtTime(260, t + 0.035);

    const vol = 0.65 * intensity;
    gain1.gain.setValueAtTime(vol, t);
    gain1.gain.exponentialRampToValueAtTime(0.0005, t + 0.035);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(t);
    osc1.stop(t + 0.035);

    // 2. High-frequency cyber metallic micro-tick (3200Hz down to 800Hz in 15ms)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(3200, t);
    osc2.frequency.exponentialRampToValueAtTime(800, t + 0.018);

    gain2.gain.setValueAtTime(0.35 * intensity, t);
    gain2.gain.exponentialRampToValueAtTime(0.0005, t + 0.018);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(t);
    osc2.stop(t + 0.018);
  } catch (err) {
    // Graceful fallback: try playing cached click.wav
    try {
      const audio = new Audio('/audio/click.wav');
      audio.volume = 0.75;
      audio.play().catch(() => {});
    } catch {}
  }
}

/**
 * Play futuristic positive chime (for registration, confirm, copy, etc.)
 */
export function playSuccessSound() {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const t = ctx.currentTime;

    // Two-tone rising cyber chime (C6 -> G6)
    [1046.5, 1567.98].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.07);

      gain.gain.setValueAtTime(0.001, t + idx * 0.07);
      gain.gain.linearRampToValueAtTime(0.38, t + idx * 0.07 + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0005, t + idx * 0.07 + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t + idx * 0.07);
      osc.stop(t + idx * 0.07 + 0.18);
    });
  } catch {}
}

/**
 * Toggle sound mute state
 */
export function toggleGlobalMute() {
  isMuted = !isMuted;
  return isMuted;
}

export function getMuteState() {
  return isMuted;
}

/**
 * Initialize global event listener for all interactive clicks
 */
export function initGlobalClickSound() {
  if (typeof window === 'undefined') return;

  const handleClick = (e) => {
    // Un-suspend AudioContext on any user gesture
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }

    // Check if target or any ancestor is clickable
    const target = e.target;
    if (!target) return;

    const clickable = target.closest(
      'button, a, input[type="submit"], input[type="button"], input[type="checkbox"], input[type="radio"], select, [role="button"], [role="tab"], .cursor-pointer, [data-clickable="true"]'
    );

    if (clickable) {
      playClickSound();
    }
  };

  // Capture phase ensures we hear the click before any stopPropagation
  document.addEventListener('click', handleClick, true);
  // Also register touchstart to wake up audio on mobile devices immediately
  document.addEventListener('touchstart', () => {
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
  }, { once: true, passive: true });
}
