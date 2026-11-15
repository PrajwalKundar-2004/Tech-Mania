const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Event = require('../models/Event');
const Admin = require('../models/Admin');
const Setting = require('../models/Setting');
const connectDB = require('../config/db');

dotenv.config();

const initialEvents = [
  {
    name: 'Pixel Perfect',
    code: 'PXLP',
    category: 'Design & Code Challenge',
    tagline: 'Pixel-level Precision',
    description: 'Classified technical challenge. Rules & mechanics revealed on the spot at APJ Hall.',
    rules: ['Individual participation.', 'Rules and theme will be announced on the spot.'],
    maximumParticipants: 16,
    registeredCount: 0,
    status: 'OPEN',
    icon: 'layout',
    time: '2:00 PM',
    venue: 'APJ Hall',
    coordinator: 'Department of MCA',
    order: 1,
  },
  {
    name: 'Fun.exe',
    code: 'FNEX',
    category: 'Interactive Tech Event',
    tagline: 'Run the Unexpected',
    description: 'Classified technical challenge. Rules & mechanics revealed on the spot at APJ Hall.',
    rules: ['Individual participation.', 'Rules and theme will be announced on the spot.'],
    maximumParticipants: 14,
    registeredCount: 0,
    status: 'OPEN',
    icon: 'sparkles',
    time: '2:00 PM',
    venue: 'APJ Hall',
    coordinator: 'Department of MCA',
    order: 2,
  },
  {
    name: 'LOGIX',
    code: 'LGIX',
    category: 'Algorithmic Mind Arena',
    tagline: 'Master the Logic',
    description: 'Classified technical challenge. Rules & mechanics revealed on the spot at APJ Hall.',
    rules: ['Individual participation.', 'Rules and theme will be announced on the spot.'],
    maximumParticipants: 16,
    registeredCount: 0,
    status: 'OPEN',
    icon: 'brain',
    time: '2:00 PM',
    venue: 'APJ Hall',
    coordinator: 'Department of MCA',
    order: 3,
  },
  {
    name: 'DeadLock',
    code: 'DDLK',
    category: 'Competitive Cyber Battle',
    tagline: 'Break the Loop',
    description: 'Classified technical challenge. Rules & mechanics revealed on the spot at APJ Hall.',
    rules: ['Individual participation.', 'Rules and theme will be announced on the spot.'],
    maximumParticipants: 9,
    registeredCount: 0,
    status: 'OPEN',
    icon: 'cpu',
    time: '2:00 PM',
    venue: 'APJ Hall',
    coordinator: 'Department of MCA',
    order: 4,
  },
];

const seedData = async () => {
  try {
    await connectDB();
    console.log('[Seed] Connected to database');

    for (const evData of initialEvents) {
      const existing = await Event.findOne({ code: evData.code });
      if (!existing) {
        await Event.create(evData);
        console.log(`[Seed] Created event: ${evData.name}`);
      } else {
        existing.maximumParticipants = evData.maximumParticipants;
        existing.name = evData.name;
        await existing.save();
        console.log(`[Seed] Updated event: ${existing.name}`);
      }
    }

    const adminUsername = (process.env.ADMIN_USERNAME || 'admin').toLowerCase();
    const existingAdmin = await Admin.findOne({ username: adminUsername });
    if (!existingAdmin) {
      const adminPassword = process.env.ADMIN_PASSWORD || 'TechMania@2026';
      await Admin.create({
        username: adminUsername,
        password: adminPassword,
        name: 'MCA Event Administrator',
        role: 'superadmin',
      });
      console.log(`[Seed] Admin user created with username: ${adminUsername}`);
    }

    const usnRegexSetting = await Setting.findOne({ key: 'USN_REGEX' });
    if (!usnRegexSetting) {
      await Setting.create({
        key: 'USN_REGEX',
        value: process.env.USN_REGEX || '^(4VP[0-9]{2}[A-Z]{2}[0-9]{3}|[0-9][A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{3}|[0-9A-Z]{8,12})$',
        description: 'Regex pattern for University Seat Number (USN) validation',
      });
    }

    const gmailOnlySetting = await Setting.findOne({ key: 'GMAIL_ONLY' });
    if (!gmailOnlySetting) {
      await Setting.create({
        key: 'GMAIL_ONLY',
        value: process.env.GMAIL_ONLY !== 'false',
        description: 'Restrict registration strictly to @gmail.com accounts',
      });
    }

    console.log('[Seed] Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedData();
}

module.exports = seedData;
