import express from "express";
import { allowRoles, requireAuth } from "../middleware/auth.js";
import { checkAgeEligibility, summarizeDocuments } from "../utils/eligibility.js";
import Player from "../models/Player.js";
import Fee from "../models/Fee.js";
import Document from "../models/Document.js";
import Skill from "../models/Skill.js";
import Academy from "../models/Academy.js";

const router = express.Router();

router.get("/overview", requireAuth, allowRoles("Admin"), async (req, res) => {
  const academyId = req.user.academyId;
  
  const playersDoc = await Player.find({ academyId });
  const feesDoc = await Fee.find({ academyId });
  const documentsDoc = await Document.find({ academyId });
  const skillsDoc = await Skill.find({ academyId });
  
  const players = playersDoc.map(doc => ({ ...doc.toObject(), id: doc._id.toString() }));
  const fees = feesDoc.map(doc => ({ ...doc.toObject(), id: doc._id.toString() }));
  const documents = documentsDoc.map(doc => ({ ...doc.toObject(), id: doc._id.toString() }));
  const skills = skillsDoc.map(doc => ({ ...doc.toObject(), id: doc._id.toString() }));

  const paidFees = fees.filter((fee) => fee.status === "Paid");
  const pendingFees = fees.filter((fee) => fee.status === "Pending");

  const playerCards = players.map((player) => {
    const playerDocs = documents.filter((doc) => doc.playerId.toString() === player.id);
    const playerSkills = skills
      .filter((skill) => skill.playerId.toString() === player.id)
      .sort((a, b) => a.month.localeCompare(b.month));
    const playerFees = fees.filter((fee) => fee.playerId.toString() === player.id);

    const currentMonth = new Date().toISOString().slice(0, 7);
    const playerPendingFees = playerFees.filter(f => f.status === "Pending");
    
    return {
      ...player,
      eligibility: checkAgeEligibility(player.dateOfBirth, player.ageGroup),
      documentSummary: summarizeDocuments(playerDocs),
      documents: playerDocs,
      skills: playerSkills,
      fees: playerFees,
      feeStatus: playerFees.find((fee) => fee.month === currentMonth)?.status || "Pending",
      pendingFeesCount: playerPendingFees.length,
      totalArrears: playerPendingFees.reduce((sum, fee) => sum + (Number(fee.amount) || 0), 0)
    };
  });

  const academyDoc = await Academy.findById(academyId);
  const academy = academyDoc ? { ...academyDoc.toObject(), id: academyDoc._id.toString() } : null;

  return res.json({
    academy,
    metrics: {
      totalPlayers: players.length,
      monthlyRevenue: paidFees.reduce((sum, fee) => sum + (Number(fee.amount) || 0), 0),
      pendingRevenue: pendingFees.reduce((sum, fee) => sum + (Number(fee.amount) || 0), 0),
      pendingFees: pendingFees.length,
      verifiedDocuments: documents.filter((doc) => doc.status === "Verified").length
    },
    players: playerCards,
    pendingFees: pendingFees.map((fee) => ({
      ...fee,
      player: players.find((player) => player.id === fee.playerId.toString())
    }))
  });
});

router.put("/academy", requireAuth, allowRoles("Admin"), async (req, res) => {
  const { monthlyFee, customMetrics } = req.body;
  const academy = await Academy.findById(req.user.academyId);
  
  if (!academy) return res.status(404).json({ message: "Academy not found" });
  
  if (monthlyFee !== undefined) {
    academy.monthlyFee = Number(monthlyFee);
    
    // Automatically sync all pending invoices to the new base fee
    await Fee.updateMany(
      { academyId: req.user.academyId, status: "Pending" },
      { amount: Number(monthlyFee) }
    );
  }
  
  if (customMetrics && typeof customMetrics === 'object') {
    if (!academy.customMetrics) academy.customMetrics = new Map();
    for (const [key, value] of Object.entries(customMetrics)) {
      academy.customMetrics.set(key, value);
    }
  }
  
  await academy.save();
  return res.json({ academy: { ...academy.toObject(), id: academy._id.toString() } });
});

export default router;
