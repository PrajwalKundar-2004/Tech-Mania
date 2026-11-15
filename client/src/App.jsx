import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import EventCard from './components/EventCard';
import AboutSection from './components/AboutSection';
import Footer from './components/Footer';
import RegistrationModal from './components/RegistrationModal';
import ConfirmationModal from './components/ConfirmationModal';
import BrochureModal from './components/BrochureModal';
import AdminPanel from './components/AdminPanel';
import CircuitBackground from './components/CircuitBackground';
import CinematicIntro from './components/CinematicIntro';
import { api } from './services/api';
import { 
  Sparkles, 
  Terminal, 
  Layers, 
  RefreshCw, 
  AlertCircle, 
  ShieldAlert, 
  CheckCircle2, 
  Info,
  Calendar,
  Clock,
  MapPin,
  Trophy,
  Flame
} from 'lucide-react';

export default function App() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Modals state
  const getAdminRoute = () => {
    try {
      return (typeof __ADMIN_ROUTE__ !== 'undefined' ? __ADMIN_ROUTE__ : '/mca-admin-team').toLowerCase().replace(/\/+$/, '');
    } catch {
      return '/mca-admin-team';
    }
  };

  const isDirectAdminUrl = () => {
    if (typeof window === 'undefined') return false;
    const configured = getAdminRoute();
    const cleanConfigured = configured.startsWith('/') ? configured : `/${configured}`;
    const slug = cleanConfigured.replace(/^\//, '');

    const path = window.location.pathname.toLowerCase().replace(/\/+$/, '');
    const hash = window.location.hash.toLowerCase().replace(/^#\/?/, '/');
    const search = window.location.search.toLowerCase();

    // Check against secret ADMIN_LINK from .env
    const isConfiguredPath = path === cleanConfigured;
    const isConfiguredHash = hash === cleanConfigured || window.location.hash.toLowerCase() === `#${slug}`;
    const isConfiguredSearch = search === `?${slug}` || search.startsWith(`?${slug}=`);

    // Standard fallback
    const isDefaultAdmin = path === '/admin' || hash === '/admin' || window.location.hash.toLowerCase() === '#admin' || search === '?admin';

    return isConfiguredPath || isConfiguredHash || isConfiguredSearch || isDefaultAdmin;
  };

  const [registerEvent, setRegisterEvent] = useState(null);
  const [confirmedReg, setConfirmedReg] = useState(null);
  const [brochureOpen, setBrochureOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(() => isDirectAdminUrl());
  const [showIntro, setShowIntro] = useState(() => {
    if (typeof window !== 'undefined' && isDirectAdminUrl()) return false;
    return true;
  });

  // Global Toast / Banner notification
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 5000);
  };

  // Sync admin modal with browser URL (/admin, #admin, ?admin)
  useEffect(() => {
    const handleUrlChange = () => {
      setAdminOpen(isDirectAdminUrl());
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  const handleCloseAdmin = () => {
    setAdminOpen(false);
    if (isDirectAdminUrl()) {
      window.history.pushState(null, '', window.location.origin + '/');
    }
  };

  // Fetch events from backend API
  const loadEvents = useCallback(async (isSilent = false) => {
    if (!isSilent) setRefreshing(true);
    try {
      const data = await api.getEvents();
      setEvents(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load events:', err);
      if (!isSilent) {
        setError(err.message || 'Could not connect to event database. Please verify backend service.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();

    // Auto-poll every 12 seconds to keep participant counts & remaining slots 100% synchronized in real time
    const interval = setInterval(() => {
      loadEvents(true);
    }, 12000);

    return () => clearInterval(interval);
  }, [loadEvents]);

  // Handle successful registration
  const handleRegistrationSuccess = (newReg, message) => {
    setRegisterEvent(null);
    setConfirmedReg(newReg);
    showToast(message || 'Registration successfully confirmed!', 'success');
    loadEvents(true);
  };

  return (
    <div className="min-h-screen bg-[#020817] text-[#F8FAFC] relative selection:bg-[#00E5FF] selection:text-[#020817]">
      {/* Cinematic Movie Studio Opening Intro */}
      {showIntro && (
        <CinematicIntro onComplete={() => setShowIntro(false)} />
      )}

      {/* Main Home Page with Smooth Cinematic Unveil */}
      <div className={`transition-opacity duration-1000 ${showIntro ? 'opacity-0 pointer-events-none' : 'opacity-100 page-fade-in'}`}>
        
        {/* Interactive Circuit Particle Background */}
        <CircuitBackground />

        {/* Fixed Cyber Navbar */}
        <Navbar
          onOpenBrochure={() => setBrochureOpen(true)}
          serverOnline={!error}
        />

      {/* Global Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 max-w-sm p-4 rounded-2xl glass-panel border border-[#00E5FF]/60 shadow-2xl animate-in slide-in-from-top-3 flex items-start gap-3">
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          ) : toast.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          ) : (
            <Info className="w-5 h-5 text-[#00E5FF] flex-shrink-0 mt-0.5" />
          )}
          <div className="text-xs font-semibold text-white">
            {toast.message}
          </div>
        </div>
      )}

      {/* Hero Section */}
      <Hero
        onExploreEvents={() => {
          const el = document.getElementById('events');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenBrochure={() => setBrochureOpen(true)}
      />

      {/* Highlights / Badges Bar */}
      <section className="relative z-10 py-3 border-y border-[#00A6FF]/20 bg-[#061426]/70 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
            
            <div className="p-1.5 sm:p-2">
              <span className="text-xl sm:text-2xl font-mono font-black text-[#00E5FF] block">
                4
              </span>
              <span className="text-[10px] sm:text-xs uppercase font-bold text-[#94A3B8] tracking-widest mt-0.5 block">
                Competitions
              </span>
            </div>

            <div className="p-1.5 sm:p-2">
              <span className="text-xl sm:text-2xl font-mono font-black text-emerald-400 block">
                55
              </span>
              <span className="text-[10px] sm:text-xs uppercase font-bold text-[#94A3B8] tracking-widest mt-0.5 block">
                Seat Limit
              </span>
            </div>

            <div className="p-1.5 sm:p-2">
              <span className="text-xl sm:text-2xl font-mono font-black text-amber-400 block">
                FREE
              </span>
              <span className="text-[10px] sm:text-xs uppercase font-bold text-[#94A3B8] tracking-widest mt-0.5 block">
                Registration
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* Events Section (Crucial Requirement) */}
      <section id="events" className="py-12 sm:py-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Heading & Real-time Live Badge */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 mb-8 sm:mb-12 text-center sm:text-left">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0A1930] border border-[#00A6FF]/40 text-[#00E5FF] text-xs font-semibold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Featured Events</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                Competition <span className="text-[#00E5FF]">Events</span>
              </h2>

              <p className="mt-2 text-xs sm:text-sm text-[#94A3B8] max-w-xl mx-auto sm:mx-0">
                Choose your battlefield. Remember: each participant is permitted to register for <strong>strictly one event</strong>. Slots are strictly capped.
              </p>
            </div>

            {/* Live Synchronizer Button */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => loadEvents(false)}
                disabled={refreshing}
                className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-[#0A1930] hover:bg-[#061426] text-[#00E5FF] border border-[#00A6FF]/30 text-xs font-mono font-bold flex items-center gap-2 transition-all hover:border-[#00E5FF]"
                title="Refresh remaining slots live"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Live Slots Synced</span>
              </button>
            </div>
          </div>

          {/* Error Banner if Server Offline */}
          {error && (
            <div className="mb-8 p-4 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                <span>{error}</span>
              </div>
              <button
                onClick={() => loadEvents(false)}
                className="px-3 py-1 rounded-lg bg-rose-900/60 text-white font-bold text-xs"
              >
                Retry Connection
              </button>
            </div>
          )}

          {/* Event Cards Grid (4 Configurable Events) */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-4 max-w-[320px] sm:max-w-none mx-auto">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="rounded-xl sm:rounded-2xl bg-[#0A1930] border border-[#00A6FF]/20 p-3.5 sm:p-4 h-[270px] sm:h-[280px] animate-pulse flex flex-col justify-between w-full max-w-[320px] sm:max-w-none mx-auto"
                >
                  <div className="space-y-4">
                    <div className="w-10 h-10 rounded-xl bg-[#061426]"></div>
                    <div className="h-6 w-3/4 rounded bg-[#061426]"></div>
                    <div className="h-4 w-1/2 rounded bg-[#061426]"></div>
                  </div>
                  <div className="h-10 w-full rounded-xl bg-[#061426]"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-4 max-w-[320px] sm:max-w-none mx-auto">
              {events.map((ev) => (
                <EventCard
                  key={ev.id || ev._id}
                  event={ev}
                  onRegister={(selected) => setRegisterEvent(selected)}
                />
              ))}
            </div>
          )}

        </div>
      </section>

      {/* About Section */}
      <AboutSection />

      {/* Footer */}
      <Footer
        onOpenBrochure={() => setBrochureOpen(true)}
      />

      </div>

      {/* --- MODALS --- */}

      {/* 1. Registration Form Modal */}
      <RegistrationModal
        event={registerEvent}
        isOpen={Boolean(registerEvent)}
        onClose={() => setRegisterEvent(null)}
        onSuccess={handleRegistrationSuccess}
      />

      {/* 2. Registration Confirmation Modal */}
      <ConfirmationModal
        registration={confirmedReg}
        isOpen={Boolean(confirmedReg)}
        onClose={() => setConfirmedReg(null)}
      />

      {/* 3. Official Brochure Modal */}
      <BrochureModal
        isOpen={brochureOpen}
        onClose={() => setBrochureOpen(false)}
      />

      {/* 4. Admin Panel Modal */}
      <AdminPanel
        isOpen={adminOpen}
        onClose={handleCloseAdmin}
        onRefreshEvents={() => loadEvents(true)}
      />

    </div>
  );
}
