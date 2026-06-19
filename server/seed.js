import mongoose from 'mongoose';
import { connectDatabase } from './config/db.js';
import { createDemoStore } from './data/memoryStore.js';
import Academy from './models/Academy.js';
import User from './models/User.js';
import Player from './models/Player.js';
import Fee from './models/Fee.js';
import Document from './models/Document.js';
import Skill from './models/Skill.js';
import Attendance from './models/Attendance.js';

if (!process.env.MONGO_URI) {
  process.env.MONGO_URI = 'mongodb://127.0.0.1:27017/cricacademy';
}

async function seed() {
  const connected = await connectDatabase();
  if (!connected) {
    console.error("Failed to connect to database");
    process.exit(1);
  }

  console.log("Fetching demo store data...");
  const data = await createDemoStore();

  console.log("Clearing existing collections...");
  await Academy.deleteMany({});
  await User.deleteMany({});
  await Player.deleteMany({});
  await Fee.deleteMany({});
  await Document.deleteMany({});
  await Skill.deleteMany({});
  await Attendance.deleteMany({});

  const idMap = new Map();
  function getObjectId(oldId) {
    if (!oldId) return undefined;
    if (!idMap.has(oldId)) {
      idMap.set(oldId, new mongoose.Types.ObjectId());
    }
    return idMap.get(oldId);
  }

  console.log("Mapping and inserting Academies...");
  const academies = data.academies.map(a => ({
    _id: getObjectId(a.id),
    name: a.name,
    location: a.city
  }));
  await Academy.insertMany(academies);

  console.log("Mapping and inserting Players...");
  const players = data.players.map(p => ({
    _id: getObjectId(p.id),
    academyId: getObjectId(p.academyId),
    coachId: getObjectId(p.coachId),
    name: p.name,
    email: p.email,
    location: p.location,
    ageGroup: p.ageGroup,
    dateOfBirth: p.dateOfBirth,
    battingStyle: p.battingStyle,
    bowlingStyle: p.bowlingStyle,
    parentPhone: p.parentPhone
  }));
  await Player.insertMany(players);

  console.log("Mapping and inserting Users...");
  const users = data.users.map(u => ({
    _id: getObjectId(u.id),
    academyId: getObjectId(u.academyId),
    name: u.name,
    email: u.email,
    passwordHash: u.passwordHash,
    role: u.role,
    playerId: getObjectId(u.playerId)
  }));
  await User.insertMany(users);

  console.log("Mapping and inserting Fees...");
  const fees = data.fees.map(f => ({
    _id: getObjectId(f.id),
    academyId: getObjectId(f.academyId),
    playerId: getObjectId(f.playerId),
    month: f.month,
    amount: f.amount,
    status: f.status,
    paidAt: f.paidAt ? new Date(f.paidAt) : undefined
  }));
  await Fee.insertMany(fees);

  console.log("Mapping and inserting Documents...");
  const documents = data.documents.map(d => ({
    _id: getObjectId(d.id),
    academyId: getObjectId(d.academyId),
    playerId: getObjectId(d.playerId),
    type: d.type,
    fileUrl: d.fileUrl,
    status: d.status,
    verifiedAt: d.status === "Verified" ? new Date() : undefined
  }));
  await Document.insertMany(documents);

  console.log("Mapping and inserting Skills...");
  const skills = data.skills.map(s => ({
    _id: getObjectId(s.id),
    academyId: getObjectId(s.academyId),
    playerId: getObjectId(s.playerId),
    month: s.month,
    ratings: {
      batting: s.trueStrikeRateIndex || 5,
      bowling: s.expectedWicketsIndex || 5,
      fielding: 5,
      fitness: s.workloadFatigueIndex || 5,
      gameAwareness: s.situationalAdaptability || 5,
      pressureIndex: s.pressurePerformanceIndex || 5
    },
    notes: s.coachNotes
  }));
  await Skill.insertMany(skills);

  console.log("Mapping and inserting Attendance...");
  const attendance = data.attendance.map(a => ({
    _id: getObjectId(a.id),
    academyId: getObjectId(a.academyId),
    playerId: getObjectId(a.playerId),
    coachId: getObjectId(a.coachId),
    date: a.date,
    status: a.status
  }));
  await Attendance.insertMany(attendance);

  console.log("Database seeded successfully!");
  process.exit(0);
}

seed().catch(err => {
  console.error("Seeding error:", err);
  process.exit(1);
});
