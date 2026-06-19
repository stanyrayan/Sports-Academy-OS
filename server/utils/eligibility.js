const ageGroupLimits = {
  "Under-14": { maxAge: 14, minAge: 10 },
  "Under-16": { maxAge: 16, minAge: 12 },
  "Under-19": { maxAge: 19, minAge: 14 }
};

export function yearsBefore(date, years) {
  const next = new Date(date);
  next.setFullYear(next.getFullYear() - years);
  return next;
}

export function checkAgeEligibility(dateOfBirth, ageGroup, trialDate = new Date()) {
  const limits = ageGroupLimits[ageGroup];
  if (!limits) {
    return {
      eligible: false,
      reason: "Unknown age group.",
      ageGroup
    };
  }

  const dob = new Date(dateOfBirth);
  const trial = new Date(trialDate);
  const oldestAllowedDob = yearsBefore(trial, limits.maxAge);
  const youngestAllowedDob = yearsBefore(trial, limits.minAge);
  const eligible = dob > oldestAllowedDob && dob <= youngestAllowedDob;

  return {
    eligible,
    ageGroup,
    trialDate: trial.toISOString(),
    oldestAllowedDob: oldestAllowedDob.toISOString(),
    youngestAllowedDob: youngestAllowedDob.toISOString(),
    reason: eligible
      ? "Player is eligible for the selected trial age group."
      : `Player must be younger than ${limits.maxAge} and at least ${limits.minAge} on the trial date.`
  };
}

export function summarizeDocuments(documents = []) {
  const required = ["Birth Certificate", "Aadhaar", "Academic Mark Sheet"];
  const uploadedTypes = new Set(documents.map((doc) => doc.type));
  const missing = required.filter((type) => !uploadedTypes.has(type));

  return {
    required,
    missing,
    complete: missing.length === 0,
    verifiedCount: documents.filter((doc) => doc.status === "Verified").length
  };
}
