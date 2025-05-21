import mongoose from "mongoose";

const ReminderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  aNumber: { type: String, required: true },
  hearingDate: { type: Date, required: true },
  email: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  reminderSent: { type: Boolean, default: false },

  // NEW FIELD for monthly reminder tracking
  monthsReminded: { type: [Number], default: [] },
});

export default mongoose.models.Reminder || mongoose.model("Reminder", ReminderSchema);

