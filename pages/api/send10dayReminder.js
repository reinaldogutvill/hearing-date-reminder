import dbConnect from "@/lib/mongodb";
import Reminder from "@/models/Reminder";
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Only GET requests allowed" });
  }

  try {
    console.log("🔌 Connecting to database...");
    await dbConnect();

    const today = new Date();
    const tenDaysLater = new Date(today);
    tenDaysLater.setDate(today.getDate() + 10);

    // Define the start and end of that day
    const startOfDay = new Date(tenDaysLater.setHours(0, 0, 0, 0));
    const endOfDay = new Date(tenDaysLater.setHours(23, 59, 59, 999));

    console.log("📅 Searching for hearings on:", startOfDay.toISOString());

    const reminders = await Reminder.find({
      hearingDate: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    console.log(`📨 Found ${reminders.length} reminder(s) to send.`);

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

      console.log(`📬 Sending reminder to ${email}`);
      await sgMail.send(msg);
    }

    res.status(200).json({ message: `Sent ${reminders.length} reminders.` });
  } catch (error) {
    console.error("❌ Error:", JSON.stringify(error, null, 2));
    res.status(500).json({
      message: "Something went wrong.",
      name: error.name,
      error: error.message,
      stack: error.stack,
    });
  }
}
