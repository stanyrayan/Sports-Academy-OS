import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  academyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Academy', required: true },
  playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
  type: { type: String, enum: ['Birth Certificate', 'Aadhaar', 'Academic Mark Sheet'], required: true },
  fileUrl: { type: String, required: true },
  publicId: { type: String },
  status: { type: String, enum: ['Pending', 'Verified', 'Rejected'], default: 'Pending' },
  verifiedAt: { type: Date },
}, { timestamps: true });

export default mongoose.model('Document', documentSchema);
