import mongoose from 'mongoose';
import User from './server/models/User.js';

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/cricacademy');
  const result = await User.updateMany(
    { role: { $in: ['Player', 'Coach'] } },
    { $set: { forcePasswordChange: true } }
  );
  console.log('Updated users:', result.modifiedCount);
  process.exit(0);
}
run().catch(console.error);
