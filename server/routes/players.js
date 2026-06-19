import express from "express";
import bcrypt from "bcryptjs";
import { allowRoles, requireAuth } from "../middleware/auth.js";
import { checkAgeEligibility, summarizeDocuments } from "../utils/eligibility.js";
import Player from "../models/Player.js";
import User from "../models/User.js";
import Document from "../models/Document.js";
import Skill from "../models/Skill.js";
import Fee from "../models/Fee.js";

const router = express.Router();

async function enrichPlayer(playerData) {
  const documentsDoc = await Document.find({ playerId: playerData.id });
  const skillsDoc = await Skill.find({ playerId: playerData.id }).sort({ month: 1 });
  const feesDoc = await Fee.find({ playerId: playerData.id });

  const documents = documentsDoc.map(doc => ({ ...doc.toObject(), id: doc._id.toString() }));
  const skills = skillsDoc.map(doc => ({ ...doc.toObject(), id: doc._id.toString() }));
  const fees = feesDoc.map(doc => ({ ...doc.toObject(), id: doc._id.toString() }));

  return {
    ...playerData,
    eligibility: checkAgeEligibility(playerData.dateOfBirth, playerData.ageGroup),
    documentSummary: summarizeDocuments(documents),
    documents,
    skills,
    fees
  };
}

router.get("/", requireAuth, async (req, res) => {
  let query = { academyId: req.user.academyId };

  if (req.user.role === "Coach") {
    query.coachId = req.user.id;
  }

  if (req.user.role === "Player") {
    query._id = req.user.playerId;
  }

  if (req.query.ageGroup) {
    query.ageGroup = req.query.ageGroup;
  }

  const playersDoc = await Player.find(query);
  const players = playersDoc.map(doc => ({ ...doc.toObject(), id: doc._id.toString() }));

  const enrichedPlayers = await Promise.all(players.map(player => enrichPlayer(player)));

  return res.json({ players: enrichedPlayers });
});

router.get("/:id", requireAuth, async (req, res) => {
  const playerDoc = await Player.findOne({ _id: req.params.id, academyId: req.user.academyId });

  if (!playerDoc) {
    return res.status(404).json({ message: "Player not found." });
  }

  if (req.user.role === "Player" && String(req.user.playerId) !== String(playerDoc._id)) {
    return res.status(403).json({ message: "You can only view your own player profile." });
  }

  const player = { ...playerDoc.toObject(), id: playerDoc._id.toString() };
  return res.json({ player: await enrichPlayer(player) });
});

router.post("/", requireAuth, allowRoles("Admin"), async (req, res) => {
  const { name, email, ageGroup, dateOfBirth, location, primaryRole, parentPhone } = req.body;

  if (!name || !email || !ageGroup || !dateOfBirth) {
    return res.status(400).json({ message: "Name, email, age group, and date of birth are required." });
  }

  let coachId = req.body.coachId;
  if (!coachId) {
    const coach = await User.findOne({ role: "Coach", academyId: req.user.academyId });
    if (coach) coachId = coach._id;
  }

  const playerDoc = await Player.create({
    academyId: req.user.academyId,
    coachId,
    name,
    email: String(email).toLowerCase(),
    location: location || "",
    ageGroup,
    dateOfBirth,
    primaryRole: primaryRole || "Athlete",
    parentPhone: parentPhone || ""
  });
  const player = { ...playerDoc.toObject(), id: playerDoc._id.toString() };

  const userExists = await User.findOne({ email: player.email, academyId: player.academyId });
  if (!userExists) {
    const passwordHash = await bcrypt.hash("player123", 10);
    await User.create({
      academyId: req.user.academyId,
      name: player.name,
      email: player.email,
      passwordHash,
      role: "Player",
      playerId: player.id,
      forcePasswordChange: true
    });
  }

  return res.status(201).json({ player: await enrichPlayer(player) });
});

router.patch("/:id", requireAuth, allowRoles("Admin"), async (req, res) => {
  const playerDoc = await Player.findOne({ _id: req.params.id, academyId: req.user.academyId });

  if (!playerDoc) {
    return res.status(404).json({ message: "Player not found." });
  }

  if (req.body.ageGroup) playerDoc.ageGroup = req.body.ageGroup;
  if (req.body.dateOfBirth) playerDoc.dateOfBirth = req.body.dateOfBirth;

  await playerDoc.save();
  const player = { ...playerDoc.toObject(), id: playerDoc._id.toString() };

  return res.json({ player: await enrichPlayer(player) });
});

router.delete("/:id", requireAuth, allowRoles("Admin"), async (req, res) => {
  const playerDoc = await Player.findOne({ _id: req.params.id, academyId: req.user.academyId });

  if (!playerDoc) {
    return res.status(404).json({ message: "Player not found." });
  }

  // Delete the player
  await Player.deleteOne({ _id: req.params.id });

  // Delete the associated user account
  await User.deleteOne({ playerId: req.params.id });

  // Delete associated documents, skills, and fees to prevent orphans
  await Document.deleteMany({ playerId: req.params.id });
  await Skill.deleteMany({ playerId: req.params.id });
  await Fee.deleteMany({ playerId: req.params.id });

  return res.json({ message: "Player and all associated records permanently deleted." });
});

export default router;
