import mongoose from 'mongoose';
import Player from './server/models/Player.js';
import Fee from './server/models/Fee.js';

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/cricacademy');
  const player = await Player.findOne({ name: /Mohan/i });
  if (player) {
    // Inject two fake unpaid invoices from the past
    await Fee.create({
      academyId: player.academyId,
      playerId: player._id,
      month: '2026-04',
      amount: 2500,
      status: 'Pending'
    });
    await Fee.create({
      academyId: player.academyId,
      playerId: player._id,
      month: '2026-05',
      amount: 2500,
      status: 'Pending'
    });
    console.log("Injected fake arrears for Mohan.");
  }
  process.exit(0);
}
run().catch(console.error);
