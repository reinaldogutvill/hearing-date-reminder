import mongoose, { Schema } from "mongoose";

const ReminderSchema = new Schema({
  name: String,
  aNumber: String,
  hearingDate: Date,
  email: String,
  language: { type: String, default: "en" },
  updateToken: String,
  isUnsubscribed: { type: Boolean, default: false },
  reminderSent: { type: Boolean, default: false },
  monthsReminded: { type: [Number], default: [] },
});

export default mongoose.models.Reminder || mongoose.model("Reminder", ReminderSchema);
