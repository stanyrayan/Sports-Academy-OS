import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema({
  academyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Academy', required: true },
  playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
  month: { type: String, required: true },
  ratings: {
    batting: { type: Number, min: 1, max: 10 },
    bowling: { type: Number, min: 1, max: 10 },
    fielding: { type: Number, min: 1, max: 10 },
    fitness: { type: Number, min: 1, max: 10 },
    gameAwareness: { type: Number, min: 1, max: 10 },
    pressureIndex: { type: Number, min: 1, max: 10 }
  },
  notes: { type: String },
}, { timestamps: true });

export default mongoose.model('Skill', skillSchema);
