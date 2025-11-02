import mongoose from "mongoose";

const FileSchema = new mongoose.Schema({
  originalName: String,
  hash: { type: String, unique: true },
  mimetype: String,
  size: Number,
  uploadDate: { type: Date, default: Date.now }
});

export default mongoose.model("File", FileSchema);
