import express from "express";
import { allowRoles, requireAuth } from "../middleware/auth.js";
import Player from "../models/Player.js";
import Attendance from "../models/Attendance.js";

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  let query = { academyId: req.user.academyId };

  if (req.user.role === "Coach") {
    query.coachId = req.user.id;
  }

  if (req.user.role === "Player") {
    query.playerId = req.user.playerId;
  }

  const attendanceDoc = await Attendance.find(query);
  const attendance = attendanceDoc.map(doc => ({ ...doc.toObject(), id: doc._id.toString() }));

  return res.json({ attendance });
});

router.post("/", requireAuth, allowRoles("Coach", "Admin"), async (req, res) => {
  const { playerId, date, status } = req.body;
  const playerDoc = await Player.findOne({ _id: playerId, academyId: req.user.academyId });

  if (!playerDoc) {
    return res.status(404).json({ message: "Player not found." });
  }

  const attendanceDoc = await Attendance.create({
    academyId: req.user.academyId,
    playerId,
    coachId: req.user.id,
    date,
    status: status === "Absent" ? "Absent" : "Present"
  });

  const record = { ...attendanceDoc.toObject(), id: attendanceDoc._id.toString() };

  return res.status(201).json({ record });
});

export default router;
