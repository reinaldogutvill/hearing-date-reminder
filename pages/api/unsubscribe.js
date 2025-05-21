import dbConnect from "@/lib/mongodb";
import Reminder from "@/models/Reminder";

export default async function handler(req, res) {
  await dbConnect();

  const { token } = req.query;
  if (!token) return res.status(400).json({ message: "Missing token" });

  const reminder = await Reminder.findOneAndUpdate(
    { updateToken: token },
    { isUnsubscribed: true }
  );

  if (!reminder) return res.status(404).json({ message: "Reminder not found" });

  res.status(200).json({ message: "You have been unsubscribed." });
}
