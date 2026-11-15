const mongoose = require('mongoose');

async function updateVenues() {
  await mongoose.connect('mongodb://127.0.0.1:27017/techmania2');
  console.log('[DB] Connected to MongoDB');

  await mongoose.connection.collection('events').updateMany({}, {
    $set: { venue: 'APJ Hall' }
  });

  const events = await mongoose.connection.collection('events').find().toArray();
  console.log('All event venues successfully updated:');
  events.forEach((e) => {
    console.log(` - ${e.name}: venue = "${e.venue}"`);
  });

  process.exit(0);
}

updateVenues();
