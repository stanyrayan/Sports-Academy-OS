import mongoose from 'mongoose';
import Player from './server/models/Player.js';
import Academy from './server/models/Academy.js';
import Skill from './server/models/Skill.js';

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/cricacademy');
  
  // Update all players
  await Player.updateMany({}, {
    $unset: { battingStyle: "", bowlingStyle: "" },
    $set: { primaryRole: "Athlete" }
  });

  // Reset custom metrics for all academies to clear cricket defaults
  await Academy.updateMany({}, {
    $unset: { customMetrics: "" }
  });

  // Drop all skills to avoid metric mismatches for old radar charts
  await Skill.deleteMany({});

  console.log("Database successfully migrated to generic SportsAcademy-OS format!");
  process.exit(0);
}
run().catch(console.error);
