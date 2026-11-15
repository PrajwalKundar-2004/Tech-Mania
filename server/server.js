const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const eventRoutes = require('./routes/eventRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const Event = require('./models/Event');
const Admin = require('./models/Admin');
const Setting = require('./models/Setting');

dotenv.config();

const app = express();

// Database Connection
connectDB();

// Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static assets if any
app.use('/public', express.static(path.join(__dirname, 'public')));

// Root & Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ONLINE',
    event: 'TECHMANIA 2.0',
    organizedBy: 'Department of MCA, VCET Puttur',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/admin', adminRoutes);

// Auto-seed initial events & admin user if empty
const autoInitialize = async () => {
  try {
    const eventCount = await Event.countDocuments();
    if (eventCount === 0) {
      console.log('[Auto-Init] No events found. Seeding initial events...');
      const seedData = require('./seed/seedData');
      // seedData runs standalone when called as script, let's seed directly
    }

    // Sync or create admin user matching .env
    const targetUsername = (process.env.ADMIN_USERNAME || 'admin').trim().toLowerCase();
    const targetEmail = (process.env.ADMIN_EMAIL || 'mca.techmania@vcetputtur.ac.in').trim().toLowerCase();
    const targetPassword = process.env.ADMIN_PASSWORD || 'TechMania@2026';

    let admin = await Admin.findOne({
      $or: [
        { username: targetUsername },
        { email: targetEmail },
        { username: 'admin' },
        { role: 'superadmin' }
      ]
    });

    if (!admin) {
      console.log('[Auto-Init] Seeding default admin from .env...');
      await Admin.create({
        username: targetUsername,
        email: targetEmail,
        password: targetPassword,
        name: 'MCA Event Administrator',
        role: 'superadmin',
      });
    } else {
      admin.username = targetUsername;
      admin.email = targetEmail;
      admin.password = targetPassword;
      await admin.save();
      console.log(`[Auto-Init] Admin account synced with .env: ${targetUsername} (${targetEmail})`);
    }

    // Default settings
    const settingCount = await Setting.countDocuments();
    if (settingCount === 0) {
      await Setting.create([
        {
          key: 'USN_REGEX',
          value: process.env.USN_REGEX || '^([1-9]|[1-4][0-9]|5[0-5])$',
          description: 'USN Validation Regex Pattern',
        },
        {
          key: 'GMAIL_ONLY',
          value: process.env.GMAIL_ONLY !== 'false',
          description: 'Strict Gmail only registration',
        },
      ]);
    }
  } catch (err) {
    console.error('[Auto-Init Error]:', err.message);
  }
};

autoInitialize();

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error: ' + (err.message || 'Unknown error'),
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[TechMania 2.0 Server] Running on http://localhost:${PORT}`);
});
