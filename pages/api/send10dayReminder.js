
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
    const tenDaysLater = new Date(today);
    tenDaysLater.setDate(today.getDate() + 10);

    // Normalize to YYYY-MM-DD for comparison
    const isoTargetDate = tenDaysLater.toISOString().split("T")[0];

    const reminders = await Reminder.find({
      hearingDate: { $regex: `^${isoTargetDate}` },
    });

    for (const reminder of reminders) {
      const { name, email, hearingDate } = reminder;

      const formattedDate = new Date(hearingDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      const msg = {
        to: email,
        from: "reinaldogutvill@gmail.com",
        subject: "Reminder: Immigration Hearing in 10 Days",
        text: `Hi ${name}, this is a friendly reminder that your immigration court hearing is scheduled for ${formattedDate} — just 10 days from today.

Please confirm your date by calling the EOIR hotline at 1-800-898-7180 or checking your case at https://acis.eoir.justice.gov/.

Wishing you all the best,  
– Immigration Court Reminder Tool`,
      };

      await sgMail.send(msg);
    }

    res.status(200).json({ message: `Sent ${reminders.length} reminders.` });
  } catch (error) {
    console.error("Error sending 10-day reminders:", error);
    res.status(500).json({ message: "Something went wrong." });
  }
}