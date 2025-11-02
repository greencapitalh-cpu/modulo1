import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import { GridFSBucket } from "mongodb";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json());
app.use(express.static("public"));

const PORT = process.env.PORT || 8080;

// 🔗 Conexión Mongo
const conn = await mongoose.connect(process.env.MONGO_URI);
const db = conn.connection.db;
const bucket = new GridFSBucket(db, { bucketName: "uploads" });

const upload = multer({ dest: "uploads/" });

// 📤 SUBIR archivo
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const { path: tempPath, originalname, mimetype } = req.file;
    const uploadStream = bucket.openUploadStream(originalname, {
      contentType: mimetype,
    });
    fs.createReadStream(tempPath)
      .pipe(uploadStream)
      .on("error", (err) => res.status(500).send(err))
      .on("finish", () => {
        fs.unlinkSync(tempPath);
        res.json({ ok: true, id: uploadStream.id, filename: originalname });
      });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📥 VER / DESCARGAR archivo
app.get("/file/:id", async (req, res) => {
  try {
    const id = new mongoose.Types.ObjectId(req.params.id);
    const file = await db.collection("uploads.files").findOne({ _id: id });
    if (!file) return res.status(404).send("File not found");

    res.set({
      "Content-Type": file.contentType || "application/octet-stream",
      "Content-Disposition": `inline; filename="${file.filename}"`
    });

    const downloadStream = bucket.openDownloadStream(id);
    downloadStream.pipe(res);
  } catch {
    res.status(404).send("File not found");
  }
});

// 📋 LISTAR archivos
app.get("/files", async (_, res) => {
  const files = await db.collection("uploads.files").find().toArray();
  res.json(files);
});

// 🏠 Página principal
app.get("/", (_, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.listen(PORT, () =>
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`)
);
