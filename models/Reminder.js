const ReminderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  aNumber: { type: String, required: true },
  hearingDate: { type: Date, required: true },
  email: { type: String, required: true },
  language: {
    type: String,
    enum: ["en", "es"],
    default: "en",
  },
  createdAt: { type: Date, default: Date.now },
  reminderSent: { type: Boolean, default: false },
  monthsReminded: [{ type: Number }],
  updateToken: { type: String },
  isUnsubscribed: { type: Boolean, default: false },
});
