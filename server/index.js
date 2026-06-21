import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { connectDatabase } from "./config/db.js";
import { configureCloudinary } from "./config/cloudinary.js";
import { createDemoStore } from "./data/memoryStore.js";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import playerRoutes from "./routes/players.js";
import feeRoutes from "./routes/fees.js";
import skillRoutes from "./routes/skills.js";
import documentRoutes from "./routes/documents.js";
import attendanceRoutes from "./routes/attendance.js";
import userRoutes from "./routes/users.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const port = process.env.PORT || 5000;
const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(",").map((origin) => origin.trim())
  : ["http://127.0.0.1:5173", "http://127.0.0.1:4173"];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Origin is not allowed by CORS."));
    },
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.locals.dbReady = await connectDatabase();
app.locals.cloudinaryReady = configureCloudinary();
app.locals.store = await createDemoStore();

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    database: app.locals.dbReady ? "mongodb" : "memory",
    cloudinary: app.locals.cloudinaryReady ? "configured" : "mock"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/players", playerRoutes);
app.use("/api/fees", feeRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/users", userRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === "production" || process.env.SERVE_STATIC === "true") {
  const distPath = path.join(__dirname, "../client/dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: "Something went wrong on the server." });
});

if (process.env.NODE_ENV !== 'production' || process.env.RENDER || process.env.RAILWAY_ENVIRONMENT) {
  app.listen(port, () => {
    console.log(`SportsAcademy-OS Server running on port ${port}`);
  });
}

export default app;
