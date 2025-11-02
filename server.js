import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import uploadRoutes from "./routes/upload.routes.js";
import connectDB from "./utils/storage.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads")); // solo si usas almacenamiento local

connectDB();

// rutas
app.use("/api/upload", uploadRoutes);

// inicio
app.listen(PORT, () => console.log(`🚀 Servidor activo en puerto ${PORT}`));
