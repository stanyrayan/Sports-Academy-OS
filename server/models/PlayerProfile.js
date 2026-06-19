import mongoose from "mongoose";

const PlayerProfileSchema = new mongoose.Schema(
  {
    academyId: { type: mongoose.Schema.Types.ObjectId, ref: "Academy", required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    coachId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    location: { type: String, default: "Bengaluru" },
    ageGroup: { type: String, enum: ["Under-14", "Under-16", "Under-19"], required: true, index: true },
    dateOfBirth: { type: Date, required: true },
    battingStyle: { type: String, default: "Right-hand bat" },
    bowlingStyle: { type: String, default: "Right-arm medium" },
    parentPhone: { type: String }
  },
  { timestamps: true }
);

PlayerProfileSchema.index({ academyId: 1, ageGroup: 1 });
PlayerProfileSchema.index({ academyId: 1, email: 1 }, { unique: true });

export default mongoose.model("PlayerProfile", PlayerProfileSchema);
