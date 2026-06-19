import mongoose from 'mongoose';
import Fee from './server/models/Fee.js';

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/cricacademy');
  await Fee.deleteMany({ month: { $in: ['2026-04', '2026-05'] } });
  console.log("Reverted fake arrears.");
  process.exit(0);
}
run().catch(console.error);
