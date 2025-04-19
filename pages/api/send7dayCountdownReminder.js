import dbConnect from "@/lib/mongodb";
import Reminder from "@/models/Reminder";
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Only GET requests allowed" });
  }

  try {
    await dbConnect();

    const today = new Date();
    const start = new Date(today);
    const end = new Date(today);

    start.setDate(today.getDate() + 1); // Tomorrow
    end.setDate(today.getDate() + 7);   // 7 days from now

    // Normalize both for clean date comparisons
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const reminders = await Reminder.find({
      hearingDate: {
        $gte: start,
        $lte: end,
      },
    });

    for (const reminder of reminders) {
      const { name, email, hearingDate } = reminder;

      const formattedDate = new Date(hearingDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      const daysLeft = Math.ceil((new Date(hearingDate) - today) / (1000 * 60 * 60 * 24));

      const msg = {
        to: email,
        from: "reinaldogutvill@gmail.com",
        subject: `Reminder: ${daysLeft} day(s) until your immigration hearing`,
        text: `Hi ${name}, your hearing is coming up on ${formattedDate} — just ${daysLeft} day(s) away.

Please double-check your hearing date using the EOIR hotline: 1-800-898-7180  
Or visit: https://acis.eoir.justice.gov/

We'll continue sending you reminders each day until your hearing.

— Immigration Court Hearing Reminder Tool`,
      };

      await sgMail.send(msg);
    }

    res.status(200).json({ message: `Sent ${reminders.length} countdown reminders.` });
  } catch (error) {
    console.error("Error sending daily countdown reminders:", error);
    res.status(500).json({ message: "Something went wrong.", error: error.message });
  }
}
