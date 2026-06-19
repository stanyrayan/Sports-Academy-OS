import mongoose from "mongoose";

const FeeRecordSchema = new mongoose.Schema(
  {
    academyId: { type: mongoose.Schema.Types.ObjectId, ref: "Academy", required: true, index: true },
    playerId: { type: mongoose.Schema.Types.ObjectId, ref: "PlayerProfile", required: true, index: true },
    month: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["Paid", "Pending"], default: "Pending", index: true },
    paidAt: { type: Date }
  },
  { timestamps: true }
);

FeeRecordSchema.index({ academyId: 1, status: 1, month: 1 });

export default mongoose.model("FeeRecord", FeeRecordSchema);
