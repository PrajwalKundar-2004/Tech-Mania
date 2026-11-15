const mongoose = require('mongoose');

async function updatePixelPerfect() {
  await mongoose.connect('mongodb://127.0.0.1:27017/techmania2');
  console.log('[DB] Connected to MongoDB');

  await mongoose.connection.collection('events').updateOne(
    { code: 'PXLP' },
    { $set: { maximumParticipants: 16 } }
  );

  const events = await mongoose.connection.collection('events').find().toArray();
  const total = events.reduce((sum, e) => sum + e.maximumParticipants, 0);

  console.log(`Updated Pixel Perfect. Total slots across all events: ${total}`);
  events.forEach((e) => {
    console.log(` - ${e.name} (${e.code}): ${e.maximumParticipants} slots | Venue: ${e.venue}`);
  });

  process.exit(0);
}

updatePixelPerfect();
