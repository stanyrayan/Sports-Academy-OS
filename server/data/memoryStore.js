import bcrypt from "bcryptjs";

const academyId = "academy-royal-bengaluru";
const adminId = "user-admin";
const coachId = "user-coach";
const playerUserId = "user-player";
const playerOneId = "player-aarav";
const playerTwoId = "player-kabir";
const playerThreeId = "player-meera";

export async function createDemoStore() {
  const [adminHash, coachHash, playerHash] = await Promise.all([
    bcrypt.hash("admin123", 10),
    bcrypt.hash("coach123", 10),
    bcrypt.hash("player123", 10)
  ]);

  return {
    cloudinaryReady: false,
    academies: [
      {
        id: academyId,
        name: "Royal Bengaluru Cricket Academy",
        city: "Bengaluru",
        ownerName: "Rohan Mehta",
        monthlyFee: 2500
      }
    ],
    users: [
      {
        id: adminId,
        academyId,
        name: "Rohan Mehta",
        email: "admin@cric.test",
        passwordHash: adminHash,
        role: "Admin"
      },
      {
        id: coachId,
        academyId,
        name: "Ananya Rao",
        email: "coach@cric.test",
        passwordHash: coachHash,
        role: "Coach"
      },
      {
        id: playerUserId,
        academyId,
        name: "Aarav Sharma",
        email: "player@cric.test",
        passwordHash: playerHash,
        role: "Player",
        playerId: playerOneId
      }
    ],
    players: [
      {
        id: playerOneId,
        academyId,
        userId: playerUserId,
        coachId,
        name: "Aarav Sharma",
        email: "player@cric.test",
        location: "Indiranagar",
        ageGroup: "Under-19",
        dateOfBirth: "2009-08-18",
        battingStyle: "Right-hand bat",
        bowlingStyle: "Leg spin",
        parentPhone: "+91 90000 11111"
      },
      {
        id: playerTwoId,
        academyId,
        coachId,
        name: "Kabir Nair",
        email: "kabir.nair@example.com",
        location: "Whitefield",
        ageGroup: "Under-16",
        dateOfBirth: "2011-03-04",
        battingStyle: "Left-hand bat",
        bowlingStyle: "Left-arm orthodox",
        parentPhone: "+91 90000 22222"
      },
      {
        id: playerThreeId,
        academyId,
        coachId,
        name: "Meera Iyer",
        email: "meera.iyer@example.com",
        location: "Jayanagar",
        ageGroup: "Under-19",
        dateOfBirth: "2006-01-22",
        battingStyle: "Right-hand bat",
        bowlingStyle: "Right-arm fast",
        parentPhone: "+91 90000 33333"
      }
    ],
    fees: [
      { id: "fee-1", academyId, playerId: playerOneId, month: "2026-05", amount: 2500, status: "Pending" },
      { id: "fee-2", academyId, playerId: playerTwoId, month: "2026-05", amount: 2500, status: "Paid", paidAt: "2026-05-08" },
      { id: "fee-3", academyId, playerId: playerThreeId, month: "2026-05", amount: 2500, status: "Pending" },
      { id: "fee-4", academyId, playerId: playerOneId, month: "2026-04", amount: 2500, status: "Paid", paidAt: "2026-04-11" },
      { id: "fee-5", academyId, playerId: playerTwoId, month: "2026-04", amount: 2500, status: "Paid", paidAt: "2026-04-09" }
    ],
    skills: [
      {
        id: "skill-aarav-jan",
        academyId,
        playerId: playerOneId,
        coachId,
        month: "2026-01",
        trueStrikeRateIndex: 5,
        expectedWicketsIndex: 6,
        workloadFatigueIndex: 5,
        situationalAdaptability: 4,
        pressurePerformanceIndex: 5,
        coachNotes: "Promising spin control, needs clearer chase planning."
      },
      {
        id: "skill-aarav-mar",
        academyId,
        playerId: playerOneId,
        coachId,
        month: "2026-03",
        trueStrikeRateIndex: 6,
        expectedWicketsIndex: 7,
        workloadFatigueIndex: 6,
        situationalAdaptability: 6,
        pressurePerformanceIndex: 6,
        coachNotes: "Better tempo against spin and improved recovery discipline."
      },
      {
        id: "skill-aarav-may",
        academyId,
        playerId: playerOneId,
        coachId,
        month: "2026-05",
        trueStrikeRateIndex: 8,
        expectedWicketsIndex: 7,
        workloadFatigueIndex: 7,
        situationalAdaptability: 8,
        pressurePerformanceIndex: 7,
        coachNotes: "Ready for district camp shortlist if documents clear."
      },
      {
        id: "skill-kabir-may",
        academyId,
        playerId: playerTwoId,
        coachId,
        month: "2026-05",
        trueStrikeRateIndex: 7,
        expectedWicketsIndex: 8,
        workloadFatigueIndex: 6,
        situationalAdaptability: 6,
        pressurePerformanceIndex: 6,
        coachNotes: "Bowling index is strong; batting decision-making is improving."
      },
      {
        id: "skill-meera-may",
        academyId,
        playerId: playerThreeId,
        coachId,
        month: "2026-05",
        trueStrikeRateIndex: 9,
        expectedWicketsIndex: 8,
        workloadFatigueIndex: 8,
        situationalAdaptability: 9,
        pressurePerformanceIndex: 8,
        coachNotes: "Elite prospect, but U-19 age eligibility needs review."
      }
    ],
    documents: [
      {
        id: "doc-aarav-birth",
        academyId,
        playerId: playerOneId,
        type: "Birth Certificate",
        fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        status: "Verified",
        reviewedBy: adminId
      },
      {
        id: "doc-aarav-aadhaar",
        academyId,
        playerId: playerOneId,
        type: "Aadhaar",
        fileUrl: "https://placehold.co/600x400/png?text=Sample+Aadhaar+Card",
        status: "Pending"
      }
    ],
    attendance: [
      { id: "att-1", academyId, playerId: playerOneId, coachId, date: "2026-05-27", status: "Present" },
      { id: "att-2", academyId, playerId: playerTwoId, coachId, date: "2026-05-27", status: "Present" },
      { id: "att-3", academyId, playerId: playerThreeId, coachId, date: "2026-05-27", status: "Absent" }
    ]
  };
}

export function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}
