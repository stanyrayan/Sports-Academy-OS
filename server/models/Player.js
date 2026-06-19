import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
  academyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Academy', required: true },
  coachId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  location: { type: String },
  ageGroup: { type: String },
  dateOfBirth: { type: Date },
  primaryRole: { type: String },
  parentPhone: { type: String },
}, { timestamps: true });

export default mongoose.model('Player', playerSchema);
