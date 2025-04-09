import mongoose from 'mongoose';

const NoteSchema = new mongoose.Schema({
  content: String,
  summary: String,
  tags: [String],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Note || mongoose.model('Note', NoteSchema);