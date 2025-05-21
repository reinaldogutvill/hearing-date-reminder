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
    const oneMonthFromNow = new Date(today);
    const sixMonthsFromNow = new Date(today);
    oneMonthFromNow.setMonth(today.getMonth() + 1);
    sixMonthsFromNow.setMonth(today.getMonth() + 6);
    oneMonthFromNow.setHours(0, 0, 0, 0);
    sixMonthsFromNow.setHours(23, 59, 59, 999);

    const monthlyReminders = await Reminder.find({
      hearingDate: {
        $gte: oneMonthFromNow,
        $lte: sixMonthsFromNow,
      },
    });

    console.log("Monthly candidates found:", monthlyReminders.length);

    for (const reminder of monthlyReminders) {
      const { name, email, hearingDate } = reminder;
      const hearing = new Date(hearingDate);

      hearing.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      const monthsLeft =
        hearing.getMonth() -
        today.getMonth() +
        12 * (hearing.getFullYear() - today.getFullYear());

      console.log({
        name,
        email,
        hearing: hearing.toDateString(),
        today: today.toDateString(),
        monthsLeft,
        sameDay: today.getDate() === hearing.getDate(),
      });

      if (monthsLeft > 0 && today.getDate() === hearing.getDate()) {
        const formattedDate = hearing.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        const msg = {
          to: email,
          from: "reinaldogutvill@gmail.com",
          subject: `Reminder: ${monthsLeft} month(s) until your immigration hearing`,
          text: `Hi ${name}, just a reminder that your immigration court hearing is in ${monthsLeft} month(s), scheduled for ${formattedDate}.

Double-check your hearing date:
EOIR Hotline: 1-800-898-7180  
Or visit: https://acis.eoir.justice.gov/

— Immigration Court Hearing Reminder Tool`,
        };

        await sgMail.send(msg);
        console.log("✅ Sent monthly reminder to:", email);
      }
    }

    res.status(200).json({
      message: `Processed ${monthlyReminders.length} monthly reminder candidates.`,
    });
  } catch (error) {
    console.error("Error sending monthly reminders:", error);
    res.status(500).json({ message: "Something went wrong.", error: error.message });
  }
}
