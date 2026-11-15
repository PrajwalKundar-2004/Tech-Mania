const mongoose = require('mongoose');

const officialEvents = [
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

async function seedOfficialGames() {
  await mongoose.connect('mongodb://127.0.0.1:27017/techmania2');
  console.log('[DB] Connected to MongoDB');

  // Clear existing registrations and events
  await mongoose.connection.collection('registrations').deleteMany({});
  await mongoose.connection.collection('events').deleteMany({});

  // Insert the 4 official competitions
  await mongoose.connection.collection('events').insertMany(officialEvents);

  const inserted = await mongoose.connection.collection('events').find().toArray();
  const totalSlots = inserted.reduce((sum, e) => sum + e.maximumParticipants, 0);

  console.log(`\nSuccessfully updated to official events. Total seats: ${totalSlots}`);
  inserted.forEach((e, idx) => {
    console.log(` ${idx + 1}. ${e.name} (${e.code}) -> ${e.maximumParticipants} slots | Venue: ${e.venue}`);
  });

  process.exit(0);
}

seedOfficialGames();
