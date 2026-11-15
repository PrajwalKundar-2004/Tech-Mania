const mongoose = require('mongoose');

async function reset() {
  await mongoose.connect('mongodb://127.0.0.1:27017/techmania2');
  await mongoose.connection.collection('registrations').deleteMany({});
  await mongoose.connection.collection('events').updateMany({}, {
    $set: { registeredCount: 0, status: 'OPEN' }
  });
  console.log('Database successfully reset to pristine state');
  process.exit(0);
}

reset();
