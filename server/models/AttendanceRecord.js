import mongoose from "mongoose";

const AttendanceRecordSchema = new mongoose.Schema(
  {
    academyId: { type: mongoose.Schema.Types.ObjectId, ref: "Academy", required: true, index: true },
    playerId: { type: mongoose.Schema.Types.ObjectId, ref: "PlayerProfile", required: true, index: true },
    coachId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: String, required: true },
    status: { type: String, enum: ["Present", "Absent"], default: "Present" }
  },
  { timestamps: true }
);

AttendanceRecordSchema.index({ academyId: 1, date: 1 });

export default mongoose.model("AttendanceRecord", AttendanceRecordSchema);
