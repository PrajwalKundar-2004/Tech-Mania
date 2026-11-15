const API_BASE = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL.replace(/\/+$/, '')}/api` 
  : '/api';

export const api = {
  // Public Events API
  async getEvents() {
    const res = await fetch(`${API_BASE}/events`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch events');
    return data.data;
  },

  async getEventById(id) {
    const res = await fetch(`${API_BASE}/events/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch event details');
    return data.data;
  },

  // Registration API
  async register(registrationData) {
    const res = await fetch(`${API_BASE}/registrations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registrationData),
    });
    const data = await res.json();
    if (!res.ok) {
      const err = new Error(data.error || 'Registration failed');
      err.data = data;
      throw err;
    }
    return data;
  },

  async checkRegistration(usn, email) {
    const params = new URLSearchParams();
    if (usn) params.append('usn', usn);
    if (email) params.append('email', email);
    const res = await fetch(`${API_BASE}/registrations/check?${params.toString()}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to check status');
    return data;
  },

  // Admin APIs
  async adminLogin(username, email, password) {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Admin login failed');
    return data;
  },

  async getAdminStats(token) {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch stats');
    return data.stats;
  },

  async getAdminRegistrations(token, { search = '', eventId = 'all', page = 1, limit = 50 } = {}) {
    const params = new URLSearchParams({ search, eventId, page, limit });
    const res = await fetch(`${API_BASE}/admin/registrations?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch registrations');
    return data;
  },

  async deleteRegistration(token, id) {
    const res = await fetch(`${API_BASE}/admin/registrations/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete registration');
    return data;
  },

  async changeAdminPassword(token, currentPassword, newPassword) {
    const res = await fetch(`${API_BASE}/admin/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update admin password');
    return data;
  },

  async updateEvent(token, id, eventData) {
    const res = await fetch(`${API_BASE}/events/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(eventData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update event');
    return data;
  },

  async getSettings(token) {
    const res = await fetch(`${API_BASE}/admin/settings`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch settings');
    return data.settings;
  },

  async updateSettings(token, settings) {
    const res = await fetch(`${API_BASE}/admin/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(settings),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update settings');
    return data;
  },

  getExportUrl(token, eventId = 'all') {
    return `${API_BASE}/admin/export?eventId=${eventId}`;
  },
};
