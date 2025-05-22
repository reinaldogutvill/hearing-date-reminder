// pages/api/unsubscribe.js

import dbConnect from "@/lib/mongodb";
import Reminder from "@/models/Reminder";

export default async function handler(req, res) {
  try {
    await dbConnect();

    // only allow GET
    if (req.method !== "GET") {
      return res.status(405).send("Method Not Allowed");
    }

    const { token } = req.query;
    if (!token) {
      return res.status(400).send("Missing token");
    }

    // mark them unsubscribed
    const reminder = await Reminder.findOneAndUpdate(
      { updateToken: token },
      { $set: { isUnsubscribed: true } },
      { new: true }
    );

    if (!reminder) {
      return res.status(404).send("Reminder not found");
    }

    // return a simple HTML confirmation
    return res.status(200).send(`
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><title>Unsubscribed</title></head>
      <body style="font-family:sans-serif; text-align:center; padding:2rem;">
        <h1>You’ve been unsubscribed</h1>
        <p>No more emails will be sent to <strong>${reminder.email}</strong>.</p>
      </body>
      </html>
    `);
  } catch (err) {
    console.error("📬 Unsubscribe error:", err);
    return res.status(500).send("Internal Server Error");
  }
}
