import express from "express";
import { allowRoles, requireAuth } from "../middleware/auth.js";
import Player from "../models/Player.js";
import Skill from "../models/Skill.js";

const router = express.Router();

router.get("/:playerId", requireAuth, async (req, res) => {
  const playerDoc = await Player.findOne({ _id: req.params.playerId, academyId: req.user.academyId });

  if (!playerDoc) {
    return res.status(404).json({ message: "Player not found." });
  }

  if (req.user.role === "Player" && String(req.user.playerId) !== String(playerDoc._id)) {
    return res.status(403).json({ message: "You can only view your own skill history." });
  }

  const skillsDoc = await Skill.find({ playerId: playerDoc._id }).sort({ month: 1 });
  const skills = skillsDoc.map(doc => ({ ...doc.toObject(), id: doc._id.toString() }));

  return res.json({ skills });
});

router.post("/:playerId", requireAuth, allowRoles("Coach", "Admin"), async (req, res) => {
  const playerDoc = await Player.findOne({ _id: req.params.playerId, academyId: req.user.academyId });

  if (!playerDoc) {
    return res.status(404).json({ message: "Player not found." });
  }

  if (req.user.role === "Coach" && String(playerDoc.coachId) !== String(req.user.id)) {
    return res.status(403).json({ message: "This player is assigned to another coach." });
  }

  const month = req.body.month;
  if (!month) {
    return res.status(400).json({ message: "Month is required." });
  }

  let skillDoc = await Skill.findOne({ playerId: playerDoc._id, month });

  const bodyFields = req.body;
  
  if (!skillDoc) {
    skillDoc = new Skill({
      academyId: req.user.academyId,
      playerId: playerDoc._id,
      month,
      ratings: {
        batting: Math.min(10, Math.max(1, Number(bodyFields.batting || 5))),
        bowling: Math.min(10, Math.max(1, Number(bodyFields.bowling || 5))),
        fielding: Math.min(10, Math.max(1, Number(bodyFields.fielding || 5))),
        fitness: Math.min(10, Math.max(1, Number(bodyFields.fitness || 5))),
        gameAwareness: Math.min(10, Math.max(1, Number(bodyFields.gameAwareness || 5))),
        pressureIndex: Math.min(10, Math.max(1, Number(bodyFields.pressureIndex || 5)))
      },
      notes: bodyFields.coachNotes || ""
    });
  } else {
    if (bodyFields.batting) skillDoc.ratings.batting = Math.min(10, Math.max(1, Number(bodyFields.batting)));
    if (bodyFields.bowling) skillDoc.ratings.bowling = Math.min(10, Math.max(1, Number(bodyFields.bowling)));
    if (bodyFields.fielding) skillDoc.ratings.fielding = Math.min(10, Math.max(1, Number(bodyFields.fielding)));
    if (bodyFields.fitness) skillDoc.ratings.fitness = Math.min(10, Math.max(1, Number(bodyFields.fitness)));
    if (bodyFields.gameAwareness) skillDoc.ratings.gameAwareness = Math.min(10, Math.max(1, Number(bodyFields.gameAwareness)));
    if (bodyFields.pressureIndex) skillDoc.ratings.pressureIndex = Math.min(10, Math.max(1, Number(bodyFields.pressureIndex)));
    if (bodyFields.coachNotes) skillDoc.notes = bodyFields.coachNotes;
  }

  await skillDoc.save();
  
  const assessment = { ...skillDoc.toObject(), id: skillDoc._id.toString() };

  // For compatibility with old fields being returned, though frontend shouldn't depend if they refactored to new names
  assessment.trueStrikeRateIndex = assessment.ratings.batting;
  assessment.expectedWicketsIndex = assessment.ratings.bowling;
  assessment.situationalAdaptability = assessment.ratings.gameAwareness;
  assessment.pressurePerformanceIndex = assessment.ratings.pressureIndex;
  assessment.workloadFatigueIndex = assessment.ratings.fitness;

  return res.status(201).json({ assessment });
});

export default router;
