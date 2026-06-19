import mongoose from "mongoose";

const DocumentRecordSchema = new mongoose.Schema(
  {
    academyId: { type: mongoose.Schema.Types.ObjectId, ref: "Academy", required: true, index: true },
    playerId: { type: mongoose.Schema.Types.ObjectId, ref: "PlayerProfile", required: true, index: true },
    type: {
      type: String,
      enum: ["Birth Certificate", "Aadhaar", "Academic Mark Sheet"],
      required: true
    },
    fileUrl: { type: String, required: true },
    cloudinaryPublicId: { type: String },
    status: { type: String, enum: ["Pending", "Verified", "Rejected"], default: "Pending" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

DocumentRecordSchema.index({ academyId: 1, playerId: 1, type: 1 }, { unique: true });

export default mongoose.model("DocumentRecord", DocumentRecordSchema);
