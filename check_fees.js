import mongoose from 'mongoose';
import Player from './server/models/Player.js';
import Fee from './server/models/Fee.js';

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/cricacademy');
  const player = await Player.findOne({ name: /Mohan/i });
  console.log("Player:", player);
  if (player) {
    const fees = await Fee.find({ playerId: player._id });
    console.log("Fees:", fees);
  }
  process.exit(0);
}
run().catch(console.error);
