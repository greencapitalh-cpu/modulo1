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
app.get("/download/:id", async (req, res) => {
  try {
    const files = await bucket.find({ _id: new ObjectId(req.params.id) }).toArray();
    if (!files || files.length === 0) return res.status(404).send("Archivo no encontrado");

    const file = files[0];
    res.set({
      "Content-Type": file.contentType,
      "Content-Disposition": `attachment; filename="${file.filename}"`,
    });

    const readStream = bucket.openDownloadStream(file._id);
    readStream.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al descargar el archivo");
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
