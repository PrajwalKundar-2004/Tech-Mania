import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Lock, 
  LogOut, 
  Users, 
  Download, 
  Search, 
  Trash2, 
  AlertCircle, 
  RefreshCw, 
  ShieldCheck, 
  Clock, 
  MapPin,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  Gamepad2,
  Brain,
  CheckCircle2,
  Sparkles,
  FileSpreadsheet,
  User,
  Mail
} from 'lucide-react';
import { api } from '../services/api';

const getEventVisuals = (name = '', code = '') => {
  const n = (name || '').toLowerCase();
  const c = (code || '').toLowerCase();

  if (n.includes('pixel') || c === 'pxlp') {
    return {
      icon: LayoutGrid,
      gradient: 'from-[#006BFF] to-[#00E5FF]',
      border: 'border-[#00E5FF]/40',
      badge: 'bg-[#00E5FF]/15 text-[#00E5FF] border-[#00E5FF]/30',
      color: 'text-[#00E5FF]',
    };
  }

  if (n.includes('fun') || c === 'fnex') {
    return {
      icon: Gamepad2,
      gradient: 'from-[#8B5CF6] via-[#A855F7] to-[#00E5FF]',
      border: 'border-purple-500/40',
      badge: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
      color: 'text-purple-300',
    };
  }

  if (n.includes('logix') || c === 'lgix') {
    return {
      icon: Brain,
      gradient: 'from-[#006BFF] via-[#00A6FF] to-[#38BDF8]',
      border: 'border-sky-500/40',
      badge: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
      color: 'text-sky-300',
    };
  }

  if (n.includes('dead') || c === 'ddlk') {
    return {
      icon: Lock,
      gradient: 'from-[#EF4444] via-[#F43F5E] to-[#00A6FF]',
      border: 'border-rose-500/40',
      badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
      color: 'text-rose-300',
    };
  }

  return {
    icon: LayoutGrid,
    gradient: 'from-[#006BFF] to-[#00E5FF]',
    border: 'border-[#00A6FF]/40',
    badge: 'bg-[#00A6FF]/15 text-[#00A6FF] border-[#00A6FF]/30',
    color: 'text-[#00A6FF]',
  };
};

export default function AdminPanel({ isOpen, onClose, onRefreshEvents }) {
  // Auth state
  const [token, setToken] = useState(() => localStorage.getItem('techmania_admin_token') || '');
  const [adminUser, setAdminUser] = useState(() => {
    const saved = localStorage.getItem('techmania_admin_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Login form state (username, email, password)
  const [loginForm, setLoginForm] = useState({ username: '', email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Events & Registrations Data
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Unwanted user removal modal state
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Collapsed sections tracking (empty set = all expanded by default)
  const [collapsedEvents, setCollapsedEvents] = useState({});

  // Fetch all data when authenticated
  const fetchAllData = async () => {
    if (!token) return;
    setLoadingData(true);
    try {
      // 1. Fetch live events list
      const evData = await api.getEvents();
      setEvents(evData || []);

      // 2. Fetch all confirmed student registrations
      const regData = await api.getAdminRegistrations(token, { limit: 200 });
      setRegistrations(regData.registrations || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
      if (err.message && err.message.toLowerCase().includes('not authorized')) {
        handleLogout();
      }
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAllData();
    }
  }, [token]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const res = await api.adminLogin(loginForm.username, loginForm.email, loginForm.password);
      setToken(res.token);
      setAdminUser(res.admin);
      localStorage.setItem('techmania_admin_token', res.token);
      localStorage.setItem('techmania_admin_user', JSON.stringify(res.admin));
      setToastMsg(`Logged in successfully as "${res.admin.username}" (${res.admin.email})`);
      setTimeout(() => setToastMsg(''), 5000);
      setLoginForm({ username: '', email: '', password: '' });
    } catch (err) {
      setLoginError(err.message || 'Invalid admin credentials');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setToken('');
    setAdminUser(null);
    localStorage.removeItem('techmania_admin_token');
    localStorage.removeItem('techmania_admin_user');
  };

  const toggleEventCollapse = (eventId) => {
    setCollapsedEvents((prev) => ({
      ...prev,
      [eventId]: !prev[eventId],
    }));
  };

  // Remove unwanted user / registration
  const confirmExecuteDelete = async () => {
    if (!userToDelete) return;
    setDeleteLoading(true);
    try {
      await api.deleteRegistration(token, userToDelete._id);
      setToastMsg(`Removed unwanted participant ${userToDelete.fullName} (${userToDelete.usn}) from ${userToDelete.eventName}. Slot re-opened!`);
      setTimeout(() => setToastMsg(''), 5000);
      setUserToDelete(null);
      await fetchAllData();
      if (onRefreshEvents) onRefreshEvents();
    } catch (err) {
      alert(err.message || 'Failed to remove participant');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleExportCsv = (eventId = 'all') => {
    const url = `${api.getExportUrl(token, eventId)}&token=${encodeURIComponent(token)}`;
    window.open(url, '_blank');
  };

  // Group registrations under each event
  const eventsWithStudents = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();

    return events.map((ev) => {
      // Find all students registered for this event
      const enrolled = registrations.filter((r) => {
        const idMatch = r.eventId && (String(r.eventId._id || r.eventId) === String(ev._id || ev.id));
        const codeMatch = r.eventCode && r.eventCode.toUpperCase() === ev.code.toUpperCase();
        const nameMatch = r.eventName && r.eventName.toLowerCase() === ev.name.toLowerCase();
        return idMatch || codeMatch || nameMatch;
      });

      // Filter by search query if present
      const filtered = enrolled.filter((s) => {
        if (!term) return true;
        const name = (s.fullName || '').toLowerCase();
        const usn = (s.usn || '').toLowerCase();
        const email = (s.email || '').toLowerCase();
        const regNum = (s.registrationNumber || '').toLowerCase();
        return name.includes(term) || usn.includes(term) || email.includes(term) || regNum.includes(term);
      });

      const max = ev.maximumParticipants || 14;
      const count = enrolled.length;
      const remaining = Math.max(0, max - count);
      const percent = Math.min(100, Math.round((count / max) * 100));

      return {
        ...ev,
        enrolledStudents: filtered,
        totalEnrolled: count,
        remainingSlots: remaining,
        percentFilled: percent,
        maxCapacity: max,
      };
    });
  }, [events, registrations, searchQuery]);

  // Overall totals
  const totalRegistrations = registrations.length;
  const totalCapacity = events.reduce((acc, ev) => acc + (ev.maximumParticipants || 0), 0) || 55;

  if (!isOpen) return null;

  // ================= 1. NOT LOGGED IN: ONLY THE LOGIN CARD (NO DOUBLE BOXES) =================
  if (!token) {
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
        onClick={onClose}
      >
        <div 
          className="relative w-full max-w-md rounded-2xl bg-[#0A1930] border-2 border-[#00E5FF]/60 shadow-2xl shadow-black/90 p-6 sm:p-8 overflow-hidden animate-in zoom-in-95 duration-200 my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Decorative ambient corner glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#00E5FF]/15 via-transparent to-transparent pointer-events-none"></div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#061426] transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon & Title Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-[#006BFF]/20 border border-[#00E5FF]/50 text-[#00E5FF] flex items-center justify-center mx-auto mb-3 shadow-md shadow-[#00E5FF]/20">
              <Lock className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-black text-white tracking-wide font-mono">
              Admin Portal
            </h3>
            <span className="text-[10px] uppercase font-mono px-2.5 py-0.5 rounded-full bg-[#00E5FF]/15 text-[#00E5FF] font-bold border border-[#00E5FF]/30 mt-1 inline-block">
              TECHMANIA 2.0 • VCET MCA
            </span>
            <p className="text-xs text-[#94A3B8] mt-2">
              Enter administrative credentials to manage registrations.
            </p>
          </div>

          {/* Error Alert */}
          {loginError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          {/* Login Form (Username, Email, Password) */}
          <form onSubmit={handleLogin} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-1 font-mono flex items-center justify-between">
                <span>Username</span>
                <span className="text-[10px] text-[#00E5FF] font-normal lowercase">(can be anything)</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  placeholder="Enter any username or your name"
                  required
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#061426] text-white text-xs sm:text-sm border border-[#00A6FF]/30 focus:border-[#00E5FF] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-1 font-mono">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  placeholder="e.g. mca.techmania@vcetputtur.ac.in"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#061426] text-white text-xs sm:text-sm border border-[#00A6FF]/30 focus:border-[#00E5FF] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-1 font-mono">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#061426] text-white text-xs sm:text-sm border border-[#00A6FF]/30 focus:border-[#00E5FF] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="btn-cyber-primary w-full py-3 rounded-xl font-bold uppercase tracking-wider text-xs shadow-lg mt-2 flex items-center justify-center gap-2"
            >
              {loginLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Unlock Admin Portal</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#00A6FF]/20 text-center text-[10px] text-[#94A3B8] font-mono">
            Department of MCA • Vivekananda College of Engg. & Tech.
          </div>
        </div>
      </div>
    );
  }

  // ================= 2. LOGGED IN: FULL EVENT-CENTRIC DASHBOARD (COMPLETE FULL-SCREEN SPACE) =================
  return (
    <div className="fixed inset-0 z-50 flex flex-col w-screen h-screen bg-[#020817] text-white overflow-hidden animate-in fade-in duration-200">
      <div className="relative w-full h-full flex flex-col overflow-hidden bg-[#0A1930]">
        
        {/* ================= TOP NAVBAR ================= */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[#00A6FF]/30 bg-[#061426] flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-[#006BFF]/20 border border-[#00E5FF]/40 text-[#00E5FF]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white tracking-wide">
                  TECHMANIA 2.0 • ADMIN PORTAL
                </h3>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#00E5FF]/20 text-[#00E5FF] font-bold">
                  VCET MCA
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono mt-0.5 flex-wrap">
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Username: <span className="text-[#00E5FF] font-black bg-[#020817] px-2 py-0.5 rounded border border-[#00E5FF]/40">{adminUser?.username || 'admin'}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={fetchAllData}
              disabled={loadingData}
              className="p-2 rounded-lg bg-[#0A1930] hover:bg-[#020817] text-[#00E5FF] border border-[#00A6FF]/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loadingData ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">Refresh</span>
            </button>

            <button
              onClick={() => handleExportCsv('all')}
              className="px-3 py-1.5 rounded-lg bg-[#006BFF]/20 hover:bg-[#006BFF]/40 text-[#00E5FF] border border-[#00A6FF]/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Export All Registrations to Excel/CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export All CSV</span>
            </button>

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#020817] transition-colors"
              title="Close Admin Portal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toast alert banner if any */}
        {toastMsg && (
          <div className="bg-emerald-950/90 border-b border-emerald-500/40 px-4 py-2.5 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* ================= CONTENT BODY (FULL WIDTH) ================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 w-full">

          {/* Summary Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-[#061426] border border-[#00A6FF]/30 text-center">
                  <span className="text-[10px] uppercase font-bold text-[#94A3B8] tracking-wider block font-mono">
                    Total Enrolled
                  </span>
                  <div className="mt-1 flex items-baseline justify-center gap-1">
                    <span className="text-2xl font-black font-mono text-emerald-400">{totalRegistrations}</span>
                    <span className="text-xs text-[#94A3B8] font-mono">/ {totalCapacity}</span>
                  </div>
                </div>

                {eventsWithStudents.map((ev) => {
                  const visuals = getEventVisuals(ev.name, ev.code);
                  return (
                    <div key={ev.id || ev._id} className="p-3 rounded-xl bg-[#061426] border border-[#00A6FF]/20 text-center">
                      <span className="text-[10px] uppercase font-bold text-[#94A3B8] truncate block">
                        {ev.name}
                      </span>
                      <div className="mt-1 flex items-baseline justify-center gap-1">
                        <span className={`text-xl font-black font-mono ${visuals.color}`}>{ev.totalEnrolled}</span>
                        <span className="text-xs text-[#94A3B8] font-mono">/ {ev.maxCapacity}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Real-time Search Filter Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter enrolled students by Reg No (1-55), Name, USN, or Email..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#061426] text-white text-xs sm:text-sm border border-[#00A6FF]/30 focus:border-[#00E5FF] focus:outline-none placeholder:text-[#94A3B8]/60"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#94A3B8] hover:text-white"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* ================= EVENTS LIST WITH ENROLLED STUDENTS UNDER EACH ================= */}
              <div className="space-y-6">
                {eventsWithStudents.map((event) => {
                  const visuals = getEventVisuals(event.name, event.code);
                  const Icon = visuals.icon;
                  const isCollapsed = Boolean(collapsedEvents[event.id || event._id]);
                  const enrolledList = event.enrolledStudents || [];

                  return (
                    <div
                      key={event.id || event._id}
                      className={`rounded-2xl bg-[#061426] border ${visuals.border} shadow-xl overflow-hidden transition-all`}
                    >
                      {/* Event Banner Header */}
                      <div className="p-4 sm:p-5 bg-gradient-to-r from-[#061426] via-[#0A1930] to-[#061426] border-b border-[#00A6FF]/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        
                        {/* Event Title & Metadata */}
                        <div className="flex items-center space-x-3.5">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${visuals.gradient} p-[1.5px] shadow-md flex-shrink-0`}>
                            <div className="w-full h-full bg-[#061426] rounded-[9px] flex items-center justify-center">
                              <Icon className={`w-5 h-5 ${visuals.color}`} />
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-base sm:text-lg font-black text-white font-mono tracking-wide">
                                {event.name}
                              </h4>
                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase border ${visuals.badge}`}>
                                {event.code}
                              </span>
                            </div>

                            <div className="flex items-center gap-3 text-xs text-[#94A3B8] font-mono mt-0.5">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-emerald-400" />
                                <span>{event.venue || 'APJ Hall'}</span>
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-[#00E5FF]" />
                                <span>{event.time || '2:00 PM'}</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Event Capacity Pill & Actions */}
                        <div className="flex items-center gap-3 self-end md:self-auto flex-wrap">
                          {/* Slot Progress Pill */}
                          <div className="bg-[#020817] px-3 py-1.5 rounded-xl border border-[#00A6FF]/20 text-xs font-mono flex items-center gap-3">
                            <div>
                              <span className="text-[#94A3B8]">Enrolled: </span>
                              <span className="font-bold text-white">{event.totalEnrolled}</span>
                              <span className="text-[#94A3B8]"> / {event.maxCapacity}</span>
                            </div>
                            <span className="text-[#00E5FF] font-bold">
                              ({event.remainingSlots} left)
                            </span>
                          </div>

                          {/* Export Event CSV Button */}
                          <button
                            onClick={() => handleExportCsv(event.id || event._id)}
                            className="px-3 py-1.5 rounded-lg bg-[#0A1930] hover:bg-[#020817] text-[#00E5FF] border border-[#00A6FF]/30 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
                            title={`Export ${event.name} enrolled students to CSV`}
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Export CSV</span>
                          </button>

                          {/* Collapse/Expand Toggle */}
                          <button
                            onClick={() => toggleEventCollapse(event.id || event._id)}
                            className="p-1.5 rounded-lg bg-[#0A1930] hover:bg-[#020817] text-[#94A3B8] hover:text-white border border-[#00A6FF]/20 transition-colors"
                            title={isCollapsed ? 'Expand Student List' : 'Collapse Student List'}
                          >
                            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Enrolled Students Table Under the Event */}
                      {!isCollapsed && (
                        <div className="p-3 sm:p-4">
                          {enrolledList.length === 0 ? (
                            <div className="py-8 text-center bg-[#020817]/60 rounded-xl border border-[#00A6FF]/15">
                              <Users className="w-8 h-8 text-[#94A3B8]/40 mx-auto mb-2" />
                              <p className="text-xs sm:text-sm font-medium text-[#94A3B8]">
                                {searchQuery 
                                  ? `No enrolled students match "${searchQuery}" in ${event.name}.`
                                  : `No students enrolled in ${event.name} yet.`}
                              </p>
                              <span className="text-[11px] text-[#00E5FF] font-mono mt-1 block">
                                All {event.maxCapacity} slots currently open.
                              </span>
                            </div>
                          ) : (
                            <div className="overflow-x-auto rounded-xl border border-[#00A6FF]/20 bg-[#020817]">
                              <table className="w-full text-left text-xs text-[#94A3B8]">
                                <thead className="bg-[#0A1930] text-[#00E5FF] font-mono text-[11px] uppercase tracking-wider border-b border-[#00A6FF]/20">
                                  <tr>
                                    <th className="px-3 py-2.5 text-center w-16">Reg No</th>
                                    <th className="px-3 py-2.5">Student Name</th>
                                    <th className="px-3 py-2.5">USN</th>
                                    <th className="px-3 py-2.5">Email</th>
                                    <th className="px-3 py-2.5">Enrolled At</th>
                                    <th className="px-3 py-2.5 text-center w-24">Action</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-[#00A6FF]/10 font-mono">
                                  {enrolledList.map((student, idx) => (
                                    <tr 
                                      key={student._id || idx}
                                      className="hover:bg-[#061426]/80 transition-colors group/row"
                                    >
                                      {/* Register Number (1 to 55) */}
                                      <td className="px-3 py-2.5 text-center font-bold text-[#00E5FF]">
                                        #{student.registrationNumber}
                                      </td>

                                      {/* Full Name */}
                                      <td className="px-3 py-2.5 font-sans font-bold text-white whitespace-nowrap">
                                        {student.fullName}
                                      </td>

                                      {/* USN */}
                                      <td className="px-3 py-2.5 text-amber-300 font-bold whitespace-nowrap">
                                        {student.usn}
                                      </td>

                                      {/* Email */}
                                      <td className="px-3 py-2.5 text-slate-300 whitespace-nowrap">
                                        {student.email}
                                      </td>

                                      {/* Date Time */}
                                      <td className="px-3 py-2.5 text-[11px] text-slate-400 whitespace-nowrap">
                                        {new Date(student.createdAt || student.registeredAt).toLocaleString('en-IN', {
                                          day: '2-digit',
                                          month: 'short',
                                          hour: '2-digit',
                                          minute: '2-digit',
                                          hour12: true,
                                        })}
                                      </td>

                                      {/* Action: Remove / Delete */}
                                      <td className="px-3 py-2.5 text-center whitespace-nowrap">
                                        <button
                                          onClick={() => setUserToDelete(student)}
                                          className="px-2.5 py-1 rounded-lg text-rose-300 hover:text-white bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-[11px] font-sans font-bold inline-flex items-center gap-1 transition-all shadow-sm"
                                          title={`Remove ${student.fullName} from ${event.name}`}
                                        >
                                          <Trash2 className="w-3 h-3" />
                                          <span>Remove</span>
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

        </div>

        {/* ================= DELETE UNWANTED USER CONFIRMATION MODAL ================= */}
        {userToDelete && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="relative w-full max-w-md rounded-2xl bg-[#061426] border-2 border-rose-500/70 p-5 sm:p-6 shadow-2xl shadow-rose-950/60 space-y-4 animate-in zoom-in-95 duration-150">
              
              <div className="flex items-center gap-3 border-b border-rose-500/30 pb-3">
                <div className="p-2 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-400">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white font-mono">
                    Remove Unwanted Participant
                  </h4>
                  <p className="text-xs text-rose-300">
                    This action will permanently delete the registration.
                  </p>
                </div>
              </div>

              {/* User details card */}
              <div className="p-3.5 rounded-xl bg-[#020817] border border-[#00A6FF]/20 space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-[#94A3B8]">Register No:</span>
                  <span className="font-bold text-[#00E5FF]">#{userToDelete.registrationNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#94A3B8]">Student Name:</span>
                  <span className="font-bold text-white font-sans">{userToDelete.fullName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#94A3B8]">USN:</span>
                  <span className="font-bold text-amber-300">{userToDelete.usn}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#94A3B8]">Email:</span>
                  <span className="text-slate-300">{userToDelete.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#94A3B8]">Competition:</span>
                  <span className="font-bold text-[#00E5FF]">{userToDelete.eventName}</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/30 text-[11px] text-rose-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <span>
                  Deleting this user will immediately free up 1 slot in <strong>{userToDelete.eventName}</strong> so another eligible student can register.
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setUserToDelete(null)}
                  disabled={deleteLoading}
                  className="px-4 py-2 rounded-xl bg-[#0A1930] hover:bg-[#020817] text-[#94A3B8] hover:text-white border border-[#00A6FF]/20 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmExecuteDelete}
                  disabled={deleteLoading}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-rose-600/30 transition-all disabled:opacity-50"
                >
                  {deleteLoading ? (
                    <span>Removing...</span>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Confirm Remove User</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
