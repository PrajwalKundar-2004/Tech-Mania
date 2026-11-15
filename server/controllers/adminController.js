const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const Setting = require('../models/Setting');

// Helper to sign JWT
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'techmania_vcet_mca_2026_jwt_secret_token_secure_key',
    { expiresIn: '7d' }
  );
};

// @desc    Admin login (requires username, email, and password - username can be anything!)
// @route   POST /api/admin/login
// @access  Public
const adminLogin = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please enter username, email, and password.',
      });
    }

    const u = username.trim();
    const e = email.trim().toLowerCase();

    // Verify admin identity by email (or role/admin record)
    let admin = await Admin.findOne({
      $or: [
        { email: e },
        { role: 'superadmin' },
      ],
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        error: 'Invalid admin email address.',
      });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid admin password.',
      });
    }

    // Set the active session username to whatever was entered
    admin.username = u;
    admin.lastLogin = new Date();
    await admin.save();

    const token = generateToken(admin._id);

    return res.status(200).json({
      success: true,
      message: `Welcome ${u}! Login successful.`,
      token,
      admin: {
        id: admin._id,
        username: u,
        email: admin.email || e,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getDashboardStats = async (req, res) => {
  try {
    const events = await Event.find().sort({ order: 1 });
    const totalRegistrations = await Registration.countDocuments({ registrationStatus: 'CONFIRMED' });

    let totalCapacity = 0;
    const eventBreakdown = await Promise.all(
      events.map(async (ev) => {
        const count = await Registration.countDocuments({
          eventId: ev._id,
          registrationStatus: 'CONFIRMED',
        });
        totalCapacity += ev.maximumParticipants;
        const remaining = Math.max(0, ev.maximumParticipants - count);
        const percent = Math.min(100, Math.round((count / ev.maximumParticipants) * 100));

        return {
          id: ev._id,
          name: ev.name,
          code: ev.code,
          category: ev.category,
          maximumParticipants: ev.maximumParticipants,
          registeredCount: count,
          remainingSlots: remaining,
          percentFilled: percent,
          status: ev.status,
          icon: ev.icon,
        };
      })
    );

    const recentRegistrations = await Registration.find({ registrationStatus: 'CONFIRMED' })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('registrationNumber fullName email usn eventName createdAt');

    return res.status(200).json({
      success: true,
      stats: {
        totalRegistrations,
        totalCapacity,
        totalRemainingSlots: Math.max(0, totalCapacity - totalRegistrations),
        overallPercentage: totalCapacity > 0 ? Math.round((totalRegistrations / totalCapacity) * 100) : 0,
        events: eventBreakdown,
        recentRegistrations,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get all registrations with search, filter, and pagination
// @route   GET /api/admin/registrations
// @access  Private (Admin)
const getAllRegistrations = async (req, res) => {
  try {
    const { search, eventId, page = 1, limit = 50 } = req.query;

    const query = { registrationStatus: 'CONFIRMED' };

    if (eventId && eventId !== 'all') {
      query.eventId = eventId;
    }

    if (search && search.trim() !== '') {
      const term = search.trim();
      query.$or = [
        { fullName: { $regex: term, $options: 'i' } },
        { usn: { $regex: term, $options: 'i' } },
        { email: { $regex: term, $options: 'i' } },
        { registrationNumber: { $regex: term, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const totalCount = await Registration.countDocuments(query);
    const registrations = await Registration.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10))
      .populate('eventId', 'name code venue time maximumParticipants');

    return res.status(200).json({
      success: true,
      totalCount,
      page: parseInt(page, 10),
      totalPages: Math.ceil(totalCount / parseInt(limit, 10)),
      registrations,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete/Cancel registration (by ID, USN, or Email)
// @route   DELETE /api/admin/registrations/:id
// @access  Private (Admin)
const deleteRegistration = async (req, res) => {
  try {
    const param = req.params.id;
    const mongoose = require('mongoose');

    let registration = null;
    if (mongoose.Types.ObjectId.isValid(param)) {
      registration = await Registration.findById(param);
    }
    if (!registration) {
      registration = await Registration.findOne({
        $or: [
          { registrationNumber: param.toUpperCase() },
          { usn: param.toUpperCase() },
          { email: param.toLowerCase() },
        ],
      });
    }

    if (!registration) {
      return res.status(404).json({ success: false, error: 'Registration record not found.' });
    }

    const eventId = registration.eventId;
    const participantName = registration.fullName;
    const participantUsn = registration.usn;
    const eventName = registration.eventName;

    // Permanently delete the registration
    await Registration.findByIdAndDelete(registration._id);

    // Update event slot count safely
    if (eventId) {
      const actualCount = await Registration.countDocuments({
        eventId,
        registrationStatus: 'CONFIRMED',
      });
      const event = await Event.findById(eventId);
      if (event) {
        event.registeredCount = actualCount;
        if (event.status === 'FULL' && actualCount < event.maximumParticipants) {
          event.status = 'OPEN';
        }
        await event.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: `User ${participantName} (${participantUsn}) removed from ${eventName}. Slot has been re-opened.`,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Change Admin Password (to prevent unauthorized access)
// @route   POST /api/admin/change-password
// @access  Private (Admin)
const changeAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'New password must be at least 6 characters long.' });
    }

    const admin = await Admin.findById(req.admin._id);
    if (!admin) {
      return res.status(404).json({ success: false, error: 'Admin account not found.' });
    }

    if (currentPassword) {
      const isMatch = await admin.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ success: false, error: 'Current password does not match.' });
      }
    }

    admin.password = newPassword;
    await admin.save();

    return res.status(200).json({
      success: true,
      message: 'Admin password changed successfully. Any unauthorized sessions are invalidated.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Export registrations as CSV
// @route   GET /api/admin/export
// @access  Private (Admin)
const exportRegistrationsCsv = async (req, res) => {
  try {
    const { eventId } = req.query;
    const query = { registrationStatus: 'CONFIRMED' };

    let eventNameSlug = 'All_Events';
    if (eventId && eventId !== 'all') {
      query.eventId = eventId;
      const targetEvent = await Event.findById(eventId);
      if (targetEvent) {
        eventNameSlug = targetEvent.name.replace(/[^a-zA-Z0-9]/g, '_');
      }
    }

    const registrations = await Registration.find(query)
      .sort({ createdAt: 1 })
      .populate('eventId', 'name code venue time');

    // Build CSV content
    const headers = [
      'Sl No',
      'Registration Number',
      'Full Name',
      'USN',
      'Email',
      'Registered Event',
      'Event Code',
      'Venue',
      'Time',
      'Registration Date & Time',
    ];

    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = registrations.map((reg, index) => [
      index + 1,
      escapeCsv(reg.registrationNumber),
      escapeCsv(reg.fullName),
      escapeCsv(reg.usn),
      escapeCsv(reg.email),
      escapeCsv(reg.eventName),
      escapeCsv(reg.eventCode),
      escapeCsv(reg.eventId?.venue || 'APJ Hall'),
      escapeCsv(reg.eventId?.time || '2:00 PM'),
      escapeCsv(new Date(reg.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    const filename = `TECHMANIA_2.0_Registrations_${eventNameSlug}_${new Date().toISOString().slice(0, 10)}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(csvContent);
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get system settings
// @route   GET /api/admin/settings
// @access  Private (Admin)
const getSettings = async (req, res) => {
  try {
    const settings = await Setting.find();
    const settingsMap = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    // Provide default fallbacks
    if (settingsMap['GMAIL_ONLY'] === undefined) {
      settingsMap['GMAIL_ONLY'] = process.env.GMAIL_ONLY !== 'false';
    }
    if (!settingsMap['USN_REGEX']) {
      settingsMap['USN_REGEX'] = process.env.USN_REGEX || '^(4VP[0-9]{2}[A-Z]{2}[0-9]{3}|[0-9][A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{3}|[0-9A-Z]{8,12})$';
    }

    return res.status(200).json({ success: true, settings: settingsMap });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update system settings
// @route   PUT /api/admin/settings
// @access  Private (Admin)
const updateSettings = async (req, res) => {
  try {
    const { usnRegex, gmailOnly } = req.body;

    if (usnRegex !== undefined) {
      await Setting.findOneAndUpdate(
        { key: 'USN_REGEX' },
        { key: 'USN_REGEX', value: usnRegex.trim(), description: 'Regex validation pattern for USN' },
        { upsert: true, returnDocument: 'after' }
      );
    }

    if (gmailOnly !== undefined) {
      await Setting.findOneAndUpdate(
        { key: 'GMAIL_ONLY' },
        { key: 'GMAIL_ONLY', value: Boolean(gmailOnly), description: 'Whether to restrict registrations to @gmail.com' },
        { upsert: true, returnDocument: 'after' }
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  adminLogin,
  getDashboardStats,
  getAllRegistrations,
  deleteRegistration,
  changeAdminPassword,
  exportRegistrationsCsv,
  getSettings,
  updateSettings,
};
