import express from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { requireAuth, signToken } from "../middleware/auth.js";
import User from "../models/User.js";
import Academy from "../models/Academy.js";

const router = express.Router();

function publicUser(user) {
  const { passwordHash, ...safeUser } = user.toObject ? user.toObject() : user;
  safeUser.id = user._id ? user._id.toString() : safeUser.id;
  if (safeUser._id) delete safeUser._id;
  
  if (safeUser.academyId && typeof safeUser.academyId === 'object' && safeUser.academyId.name) {
    safeUser.academyName = safeUser.academyId.name;
    if (safeUser.academyId.customMetrics) {
      safeUser.customMetrics = safeUser.academyId.customMetrics instanceof Map 
        ? Object.fromEntries(safeUser.academyId.customMetrics) 
        : safeUser.academyId.customMetrics;
    }
    safeUser.academyId = safeUser.academyId._id.toString();
  }
  
  return safeUser;
}

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  
  const user = await User.findOne({ email: String(email || "").toLowerCase() }).populate("academyId");

  if (!user || !(await bcrypt.compare(password || "", user.passwordHash))) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  return res.json({
    token: signToken(publicUser(user)),
    user: publicUser(user)
  });
});

router.post("/signup", async (req, res) => {
  const { name, email, password, role = "Player", academyId } = req.body;
  
  let tenantId = academyId;
  if (!tenantId) {
    const defaultAcademy = await Academy.findOne();
    tenantId = defaultAcademy ? defaultAcademy._id : null;
  }

  if (!name || !email || !password || !tenantId) {
    return res.status(400).json({ message: "Name, email, password, and academy are required." });
  }

  if (!["Admin", "Coach", "Player"].includes(role)) {
    return res.status(400).json({ message: "Unsupported role." });
  }

  const normalizedEmail = email.toLowerCase();
  const exists = await User.findOne({ email: normalizedEmail, academyId: tenantId });
  if (exists) {
    return res.status(409).json({ message: "A user already exists for this academy." });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  
  const user = await User.create({
    academyId: tenantId,
    name,
    email: normalizedEmail,
    passwordHash,
    role
  });

  return res.status(201).json({
    token: signToken(publicUser(user)),
    user: publicUser(user)
  });
});

router.post("/register-academy", async (req, res) => {
  const { academyName, location, adminName, email, password } = req.body;
  
  if (!academyName || !adminName || !email || !password) {
    return res.status(400).json({ message: "Academy name, admin name, email, and password are required." });
  }

  const normalizedEmail = email.toLowerCase();
  const exists = await User.findOne({ email: normalizedEmail });
  if (exists) {
    return res.status(409).json({ message: "An account with this email already exists." });
  }

  const academy = await Academy.create({
    name: academyName,
    location: location || "Global"
  });

  const passwordHash = await bcrypt.hash(password, 10);
  const adminUser = await User.create({
    academyId: academy._id,
    name: adminName,
    email: normalizedEmail,
    passwordHash,
    role: "Admin"
  });
  
  await adminUser.populate("academyId");

  return res.status(201).json({
    token: signToken(publicUser(adminUser)),
    user: publicUser(adminUser)
  });
});

router.put("/update-password", requireAuth, async (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters." });
  }

  const user = await User.findById(req.user.id).populate("academyId");
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  user.forcePasswordChange = false;
  await user.save();

  return res.json({
    message: "Password updated successfully.",
    token: signToken(publicUser(user)),
    user: publicUser(user)
  });
});

import { sendEmail } from "../utils/email.js";

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required." });

  const normalizedEmail = email.toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    // Return 200 even if not found to prevent email enumeration
    return res.json({ message: "If an account exists, a reset link has been sent to your email." });
  }

  // Generate a random token
  const resetToken = crypto.randomBytes(32).toString("hex");
  
  // Hash the token before saving to database (security best practice)
  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiration
  await user.save();

  // Full absolute link for the email. Assuming frontend runs on localhost:4173 currently
  // In production, this should be the actual domain name.
  const hostUrl = req.headers.origin || "http://127.0.0.1:4173";
  const resetLink = `${hostUrl}/reset-password?token=${resetToken}&email=${normalizedEmail}`;
  
  const emailHtml = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #0f172a;">Password Reset Request</h2>
      <p style="color: #475569; font-size: 16px;">Hello,</p>
      <p style="color: #475569; font-size: 16px;">We received a request to reset the password for your CricAcademy OS account.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="background-color: #a3e635; color: #0f172a; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Reset Password</a>
      </div>
      <p style="color: #475569; font-size: 14px;">If you did not request a password reset, please ignore this email or contact your academy administrator.</p>
      <p style="color: #475569; font-size: 14px;">This link will expire in 1 hour.</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="color: #94a3b8; font-size: 12px; text-align: center;">CricAcademy OS - The Open Source Cricket Academy Operating System</p>
    </div>
  `;

  await sendEmail({
    to: normalizedEmail,
    subject: "Reset your CricAcademy OS Password",
    html: emailHtml
  });

  return res.json({ 
    message: "If an account exists, a reset link has been sent to your email."
  });
});

router.post("/reset-password", async (req, res) => {
  const { token, email, newPassword } = req.body;
  
  if (!token || !email || !newPassword) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  const normalizedEmail = email.toLowerCase();
  
  // Hash the incoming token to compare with the DB
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({ 
    email: normalizedEmail,
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() } 
  });

  if (!user) {
    return res.status(400).json({ message: "Invalid or expired password reset token." });
  }

  // Set the new password
  user.passwordHash = await bcrypt.hash(newPassword, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  return res.json({ message: "Password has been successfully reset. You can now log in." });
});

router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("academyId");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    return res.json({ user: publicUser(user) });
  } catch (err) {
    return res.status(401).json({ message: "Invalid session token." });
  }
});

export default router;
