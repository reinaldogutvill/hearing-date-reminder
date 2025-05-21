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

    // ------------------ Monthly Reminder Block ------------------
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

      const isSameDay = today.getDate() === hearing.getDate();

      if (monthsLeft > 0 && isSameDay) {
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

    // ------------------ 7-Day Countdown Block ------------------
    const start = new Date(today);
    const end = new Date(today);
    start.setDate(today.getDate() + 1);
    end.setDate(today.getDate() + 7);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const countdownReminders = await Reminder.find({
      hearingDate: {
        $gte: start,
        $lte: end,
      },
    });

    console.log("7-day countdown candidates found:", countdownReminders.length);

    for (const reminder of countdownReminders) {
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
      console.log("✅ Sent 7-day countdown reminder to:", email);
    }

    res.status(200).json({
      message: `Processed ${monthlyReminders.length} monthly and ${countdownReminders.length} 7-day countdown reminders.`,
    });
  } catch (error) {
    console.error("Error sending reminders:", error);
    res.status(500).json({ message: "Something went wrong.", error: error.message });
  }
}
