const mongoose = require('mongoose');

async function updateCapacities() {
  await mongoose.connect('mongodb://127.0.0.1:27017/techmania2');
  await mongoose.connection.collection('events').updateOne({ code: 'CSTM' }, { $set: { maximumParticipants: 15 } });
  await mongoose.connection.collection('events').updateOne({ code: 'WCFT' }, { $set: { maximumParticipants: 15 } });
  await mongoose.connection.collection('events').updateOne({ code: 'TTRV' }, { $set: { maximumParticipants: 15 } });
  await mongoose.connection.collection('events').updateOne({ code: 'INVX' }, { $set: { maximumParticipants: 10 } });

  const events = await mongoose.connection.collection('events').find().toArray();
  const total = events.reduce((sum, e) => sum + e.maximumParticipants, 0);
  console.log(`Capacities updated. Total seats across all events: ${total}`);
  events.forEach(e => console.log(` - ${e.name} (${e.code}): ${e.maximumParticipants} seats`));
  process.exit(0);
}

updateCapacities();
