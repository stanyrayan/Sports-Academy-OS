import express from "express";
import multer from "multer";
import { Readable } from "stream";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { cloudinary } from "../config/cloudinary.js";
import { allowRoles, requireAuth } from "../middleware/auth.js";
import { checkAgeEligibility } from "../utils/eligibility.js";
import Player from "../models/Player.js";
import Document from "../models/Document.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const router = express.Router();
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`);
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 }
});

function uploadToCloudinary(file, playerId) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `cricacademy-os/${playerId}`,
        resource_type: "auto",
        access_mode: "authenticated"
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(result);
      }
    );

    fs.createReadStream(file.path).pipe(stream);
  });
}

router.post("/:playerId", requireAuth, upload.single("document"), async (req, res) => {
  const playerDoc = await Player.findOne({
    _id: req.params.playerId,
    academyId: req.user.academyId
  });

  if (!playerDoc) {
    return res.status(404).json({ message: "Player not found." });
  }
  const player = { ...playerDoc.toObject(), id: playerDoc._id.toString() };

  if (req.user.role === "Player" && String(req.user.playerId) !== String(player.id)) {
    return res.status(403).json({ message: "You can only upload documents for your own profile." });
  }

  const eligibility = checkAgeEligibility(player.dateOfBirth, player.ageGroup);
  if (!eligibility.eligible) {
    return res.status(409).json({
      message: `Ineligible for ${player.ageGroup} selection. Document submission blocked.`,
      eligibility
    });
  }

  const type = req.body.type;
  if (!["Birth Certificate", "Aadhaar", "Academic Mark Sheet"].includes(type)) {
    return res.status(400).json({ message: "Unsupported document type." });
  }

  let storageMode = "mock";
  let result = {
    secure_url: `https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf`,
    public_id: `mock/${player.id}/${type}`
  };

  if (req.app.locals.cloudinaryReady && req.file) {
    result = await uploadToCloudinary(req.file, player.id);
    storageMode = "cloudinary";
  } else if (req.file) {
    result = {
      secure_url: `http://${req.get("host")}/uploads/${req.file.filename}`,
      public_id: `local/${player.id}/${req.file.filename}`
    };
    storageMode = "local";
  }

  let documentDoc = await Document.findOne({ playerId: player.id, type });

  if (documentDoc) {
    documentDoc.fileUrl = result.secure_url;
    documentDoc.publicId = result.public_id;
    documentDoc.status = "Pending";
    await documentDoc.save();
  } else {
    documentDoc = await Document.create({
      academyId: req.user.academyId,
      playerId: player.id,
      type,
      fileUrl: result.secure_url,
      publicId: result.public_id,
      status: "Pending"
    });
  }

  const document = { ...documentDoc.toObject(), id: documentDoc._id.toString() };

  return res.status(201).json({ document, eligibility, storageMode });
});

router.patch("/:id/verify", requireAuth, allowRoles("Admin"), async (req, res) => {
  const documentDoc = await Document.findOne({ _id: req.params.id, academyId: req.user.academyId });

  if (!documentDoc) {
    return res.status(404).json({ message: "Document not found." });
  }

  documentDoc.status = req.body.status || "Verified";
  documentDoc.verifiedAt = new Date();
  await documentDoc.save();
  
  const document = { ...documentDoc.toObject(), id: documentDoc._id.toString(), reviewedBy: req.user.id };

  return res.json({ document });
});

export default router;
