import mongoose from "mongoose";

const SkillAssessmentSchema = new mongoose.Schema(
  {
    academyId: { type: mongoose.Schema.Types.ObjectId, ref: "Academy", required: true, index: true },
    playerId: { type: mongoose.Schema.Types.ObjectId, ref: "PlayerProfile", required: true, index: true },
    coachId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    month: { type: String, required: true },
    trueStrikeRateIndex: { type: Number, min: 1, max: 10, default: 5 },
    expectedWicketsIndex: { type: Number, min: 1, max: 10, default: 5 },
    workloadFatigueIndex: { type: Number, min: 1, max: 10, default: 5 },
    situationalAdaptability: { type: Number, min: 1, max: 10, default: 5 },
    pressurePerformanceIndex: { type: Number, min: 1, max: 10, default: 5 },
    coachNotes: { type: String, default: "" }
  },
  { timestamps: true }
);

SkillAssessmentSchema.index({ academyId: 1, playerId: 1, month: 1 }, { unique: true });

export default mongoose.model("SkillAssessment", SkillAssessmentSchema);
