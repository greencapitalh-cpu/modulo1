import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/udochain";

export default async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("🟢 Conectado a MongoDB correctamente.");
  } catch (error) {
    console.error("🔴 Error al conectar con MongoDB:", error.message);
    process.exit(1);
  }
}
