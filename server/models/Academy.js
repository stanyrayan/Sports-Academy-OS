import mongoose from 'mongoose';

const academySchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  monthlyFee: { type: Number, default: 2500 },
  customMetrics: {
    type: Map,
    of: String,
    default: {
      batting: "True Strike Rate",
      bowling: "Expected Wickets",
      fitness: "Workload Fitness",
      gameAwareness: "Game IQ",
      pressureIndex: "Pressure Index"
    }
  }
}, { timestamps: true });

export default mongoose.model('Academy', academySchema);
