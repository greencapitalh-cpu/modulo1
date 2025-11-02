import express from "express";
import multer from "multer";
import crypto from "crypto";
import File from "../models/File.js";
import { createHashFromBuffer } from "../utils/hash.js";

const router = express.Router();

// almacenamiento temporal local (puedes cambiar luego a GridFS)
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ ok: false, message: "No se subió ningún archivo." });

    const { originalname, mimetype, size, buffer } = req.file;
    const hash = await createHashFromBuffer(buffer);

    const file = new File({ originalName: originalname, hash, mimetype, size });
    await file.save();

    res.json({
      ok: true,
      message: "Archivo guardado correctamente.",
      file: {
        name: originalname,
        size,
        hash,
        url: `/api/view/${hash}`
      }
    });
  } catch (err) {
    console.error("Error al subir archivo:", err);
    res.status(500).json({ ok: false, message: err.message });
  }
});

export default router;
