import express from "express";
import { allowRoles, requireAuth } from "../middleware/auth.js";
import Fee from "../models/Fee.js";
import Player from "../models/Player.js";

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  let query = { academyId: req.user.academyId };

  if (req.user.role === "Player") {
    query.playerId = req.user.playerId;
  }

  const feesDoc = await Fee.find(query);
  const fees = feesDoc.map(doc => ({ ...doc.toObject(), id: doc._id.toString() }));

  const playersDoc = await Player.find({ academyId: req.user.academyId });
  const players = playersDoc.map(doc => ({ ...doc.toObject(), id: doc._id.toString() }));

  return res.json({
    fees: fees.map((fee) => ({
      ...fee,
      player: players.find((player) => String(player.id) === String(fee.playerId))
    }))
  });
});

router.patch("/:id/pay", requireAuth, allowRoles("Admin"), async (req, res) => {
  const feeDoc = await Fee.findOne({ _id: req.params.id, academyId: req.user.academyId });

  if (!feeDoc) {
    return res.status(404).json({ message: "Fee record not found." });
  }

  feeDoc.status = "Paid";
  feeDoc.paidAt = new Date();
  await feeDoc.save();

  const fee = { ...feeDoc.toObject(), id: feeDoc._id.toString() };

  return res.json({ fee });
});

router.patch("/:id/unpay", requireAuth, allowRoles("Admin"), async (req, res) => {
  const feeDoc = await Fee.findOne({ _id: req.params.id, academyId: req.user.academyId });

  if (!feeDoc) {
    return res.status(404).json({ message: "Fee record not found." });
  }

  feeDoc.status = "Pending";
  feeDoc.paidAt = null;
  await feeDoc.save();

  const fee = { ...feeDoc.toObject(), id: feeDoc._id.toString() };

  return res.json({ fee });
});

router.post("/generate", requireAuth, allowRoles("Admin"), async (req, res) => {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const academyId = req.user.academyId;

  // We need the Academy.js imported for this route. I will import it at the top.
  const { default: AcademyModel } = await import("../models/Academy.js");
  const academy = await AcademyModel.findById(academyId);
  const feeAmount = academy?.monthlyFee || 2500;

  const players = await Player.find({ academyId });
  const existingFees = await Fee.find({ academyId, month: currentMonth });
  const existingPlayerIds = new Set(existingFees.map(f => String(f.playerId)));

  const newFees = [];
  for (const player of players) {
    if (!existingPlayerIds.has(String(player._id))) {
      newFees.push({
        academyId,
        playerId: player._id,
        month: currentMonth,
        amount: feeAmount,
        status: "Pending"
      });
    }
  }

  if (newFees.length > 0) {
    await Fee.insertMany(newFees);
  }

  return res.json({ message: `Generated ${newFees.length} invoices for ${currentMonth}` });
});

export default router;
