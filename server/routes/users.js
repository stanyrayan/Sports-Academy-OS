import express from "express";
import bcrypt from "bcryptjs";
import { allowRoles, requireAuth } from "../middleware/auth.js";
import User from "../models/User.js";
import Player from "../models/Player.js";

const router = express.Router();

function publicUser(user) {
  const { passwordHash, ...safeUser } = user.toObject ? user.toObject() : user;
  safeUser.id = user._id ? user._id.toString() : safeUser.id;
  if (safeUser._id) delete safeUser._id;
  return safeUser;
}

// Get all coaches for the academy
router.get("/coaches", requireAuth, allowRoles("Admin"), async (req, res) => {
  const coachesDoc = await User.find({ academyId: req.user.academyId, role: "Coach" });
  const coaches = coachesDoc.map(publicUser);
  return res.json({ coaches });
});

// Add a new coach
router.post("/coaches", requireAuth, allowRoles("Admin"), async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: "Name and email are required." });
  }

  const normalizedEmail = email.toLowerCase();
  const exists = await User.findOne({ email: normalizedEmail, academyId: req.user.academyId });
  if (exists) {
    return res.status(409).json({ message: "A user with this email already exists in your academy." });
  }

  const passwordHash = await bcrypt.hash("coach123", 10);
  
  const coachDoc = await User.create({
    academyId: req.user.academyId,
    name,
    email: normalizedEmail,
    passwordHash,
    role: "Coach",
    forcePasswordChange: true
  });

  return res.status(201).json({ coach: publicUser(coachDoc) });
});

// Update a coach
router.put("/coaches/:id", requireAuth, allowRoles("Admin"), async (req, res) => {
  const { name, email } = req.body;
  const normalizedEmail = email.toLowerCase();

  const coachDoc = await User.findOne({ _id: req.params.id, academyId: req.user.academyId, role: "Coach" });
  if (!coachDoc) return res.status(404).json({ message: "Coach not found." });

  // Check if new email conflicts with existing users
  if (coachDoc.email !== normalizedEmail) {
    const exists = await User.findOne({ email: normalizedEmail, academyId: req.user.academyId });
    if (exists) return res.status(409).json({ message: "Another user is already using this email." });
  }

  coachDoc.name = name || coachDoc.name;
  coachDoc.email = normalizedEmail;
  await coachDoc.save();

  return res.json({ coach: publicUser(coachDoc) });
});

// Delete a coach
router.delete("/coaches/:id", requireAuth, allowRoles("Admin"), async (req, res) => {
  const coachDoc = await User.findOneAndDelete({ _id: req.params.id, academyId: req.user.academyId, role: "Coach" });
  if (!coachDoc) return res.status(404).json({ message: "Coach not found." });

  // Unassign all players from this coach
  await Player.updateMany(
    { coachId: req.params.id, academyId: req.user.academyId },
    { $unset: { coachId: "" } }
  );

  return res.json({ message: "Coach removed and players unassigned." });
});

export default router;
