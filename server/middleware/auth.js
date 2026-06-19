import jwt from "jsonwebtoken";

export function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      academyId: user.academyId,
      role: user.role,
      playerId: user.playerId
    },
    process.env.JWT_SECRET || "dev-secret-change-me",
    { expiresIn: "7d" }
  );
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Authentication required." });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || "dev-secret-change-me");
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

export function allowRoles(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "You do not have access to this resource." });
    }
    return next();
  };
}
