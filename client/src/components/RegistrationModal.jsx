import React, { useState } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Hash, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2, 
  ShieldCheck, 
  Sparkles,
  Calendar,
  MapPin,
  Clock
} from 'lucide-react';
import { api } from '../services/api';
import { playSuccessSound } from '../utils/soundEffects';

export default function RegistrationModal({ 
  event, 
  isOpen, 
  onClose, 
  onSuccess,
  gmailOnly = true,
  usnPattern = '^([1-9]|[1-4][0-9]|5[0-5])$'
}) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    usn: '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !event) return null;

  // Real-time field validation
  const validateField = (name, value) => {
    let error = null;

    if (name === 'fullName') {
      const trimmed = value.trim();
      if (!trimmed) {
        error = 'Full name is required.';
      } else if (trimmed.length < 2) {
        error = 'Name must be at least 2 characters long.';
      } else if (trimmed.length > 80) {
        error = 'Name cannot exceed 80 characters.';
      } else if (!/^[a-zA-Z\s.'-]+$/.test(trimmed)) {
        error = 'Please enter a valid name (letters and spaces only).';
      }
    }

    if (name === 'email') {
      const trimmed = value.trim().toLowerCase();
      if (!trimmed) {
        error = 'Email address is required.';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
        error = 'Please enter a valid email address.';
      } else if (gmailOnly && !trimmed.endsWith('@gmail.com')) {
        error = 'Only Gmail addresses (@gmail.com) are accepted.';
      }
    }

    if (name === 'usn') {
      const trimmed = value.trim();
      if (!trimmed) {
        error = 'USN is required.';
      } else {
        const num = parseInt(trimmed, 10);
        if (isNaN(num) || num < 1 || num > 55 || String(num) !== trimmed) {
          error = 'Please enter a number between 1 and 55.';
        }
      }
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setServerError(null);

    // Live validation
    const err = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: err }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);

    // Validate all fields
    const nameErr = validateField('fullName', formData.fullName);
    const emailErr = validateField('email', formData.email);
    const usnErr = validateField('usn', formData.usn);

    if (nameErr || emailErr || usnErr) {
      setErrors({
        fullName: nameErr,
        email: emailErr,
        usn: usnErr,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        usn: formData.usn.trim().toUpperCase(),
        eventId: event.id || event._id,
      };

      const response = await api.register(payload);
      
      // Clean form and notify parent of success
      setFormData({ fullName: '', email: '', usn: '' });
      setErrors({});
      playSuccessSound();
      onSuccess(response.data, response.message);
    } catch (err) {
      console.error('Registration failed:', err);
      // Capture exact backend error message
      const errorMsg = err.data?.error || err.message || 'An error occurred during registration.';
      setServerError({
        message: errorMsg,
        alreadyRegisteredEvent: err.data?.alreadyRegisteredEvent,
        existingRegistration: err.data?.existingRegistration,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const remainingSlots = Math.max(0, (event.maximumParticipants || 25) - (event.registeredCount || 0));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-[360px] sm:max-w-[400px] rounded-2xl bg-[#0A1930] border border-[#00E5FF]/40 shadow-2xl shadow-[#00A6FF]/30 p-4 sm:p-5 my-auto max-h-[92vh] overflow-y-auto">
        
        {/* Glow ambient accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#00E5FF]/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Modal Header: Only Game Name */}
        <div className="flex items-center justify-between pb-3 border-b border-[#00A6FF]/20">
          <h3 className="text-xl sm:text-2xl font-black text-[#00E5FF] font-mono tracking-wide truncate">
            {event.name}
          </h3>

          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#061426] transition-colors ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div className="mt-3 p-2.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs flex items-start gap-2 animate-in shake">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-rose-300">{serverError.message}</p>
              {serverError.alreadyRegisteredEvent && (
                <p className="mt-0.5 text-[11px] text-rose-300/80">
                  You are already confirmed for <strong>{serverError.alreadyRegisteredEvent}</strong>.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="mt-3.5 space-y-3">
          
          {/* 1. Full Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-1 font-mono">
              Full Name <span className="text-[#00E5FF]">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94A3B8]">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your name"
                disabled={isSubmitting}
                className={`w-full pl-9 pr-3 py-2 rounded-xl bg-[#061426] text-white text-sm border focus:outline-none transition-colors ${
                  errors.fullName
                    ? 'border-rose-500 focus:border-rose-400'
                    : 'border-[#00A6FF]/30 focus:border-[#00E5FF]'
                }`}
              />
            </div>
            {errors.fullName && (
              <p className="mt-0.5 text-[11px] text-rose-400 font-medium">
                {errors.fullName}
              </p>
            )}
          </div>

          {/* 2. Gmail Address */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-1 font-mono">
              Email Address <span className="text-[#00E5FF]">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94A3B8]">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                disabled={isSubmitting}
                className={`w-full pl-9 pr-3 py-2 rounded-xl bg-[#061426] text-white text-sm border focus:outline-none transition-colors ${
                  errors.email
                    ? 'border-rose-500 focus:border-rose-400'
                    : 'border-[#00A6FF]/30 focus:border-[#00E5FF]'
                }`}
              />
            </div>
            {errors.email && (
              <p className="mt-0.5 text-[11px] text-rose-400 font-medium">
                {errors.email}
              </p>
            )}
          </div>

          {/* 3. USN (Numbers 1-55) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-1 font-mono flex items-center justify-between">
              <span>USN / Roll Number <span className="text-[#00E5FF]">*</span></span>
              <span className="text-[10px] text-[#00E5FF] font-normal lowercase">(1 to 55)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94A3B8]">
                <Hash className="w-4 h-4" />
              </div>
              <input
                type="text"
                inputMode="numeric"
                name="usn"
                value={formData.usn}
                onChange={(e) => {
                  const digitsOnly = e.target.value.replace(/[^0-9]/g, '');
                  e.target.value = digitsOnly;
                  handleChange(e);
                }}
                placeholder="Enter your number (1-55)"
                disabled={isSubmitting}
                className={`w-full pl-9 pr-3 py-2 rounded-xl bg-[#061426] text-white text-sm font-mono tracking-wider border focus:outline-none transition-colors ${
                  errors.usn
                    ? 'border-rose-500 focus:border-rose-400'
                    : 'border-[#00A6FF]/30 focus:border-[#00E5FF]'
                }`}
              />
            </div>
            {errors.usn && (
              <p className="mt-0.5 text-[11px] text-rose-400 font-medium">
                {errors.usn}
              </p>
            )}
          </div>

          {/* Submit Actions */}
          <div className="pt-2.5 border-t border-[#00A6FF]/20 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-1/3 py-2.5 px-3 rounded-xl text-xs font-semibold text-[#94A3B8] hover:text-white bg-[#061426] hover:bg-[#020817] border border-[#00A6FF]/20 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || remainingSlots <= 0}
              className="btn-cyber-primary flex-1 py-2.5 px-4 rounded-xl font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#020817]" />
                  <span>Locking Slot...</span>
                </>
              ) : remainingSlots <= 0 ? (
                <span>Registration Closed</span>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Confirm Registration</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
