import dbConnect from "@/lib/mongodb";
import Reminder from "@/models/Reminder";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ message: "Only GET allowed" });

  try {
    await dbConnect();

    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));

    const oneMonth = new Date(today);
    oneMonth.setMonth(oneMonth.getMonth() + 1);

    const sixMonths = new Date(today);
    sixMonths.setMonth(sixMonths.getMonth() + 6);
    sixMonths.setHours(23, 59, 59, 999);

    const start7 = new Date(today);
    start7.setDate(start7.getDate() + 1);

    const end7 = new Date(today);
    end7.setDate(end7.getDate() + 7);
    end7.setHours(23, 59, 59, 999);

    const monthlyReminders = await Reminder.find({
      hearingDate: { $gte: oneMonth, $lte: sixMonths },
      isUnsubscribed: false,
    });

    const countdownReminders = await Reminder.find({
      hearingDate: { $gte: start7, $lte: end7 },
      isUnsubscribed: false,
      reminderSent: false,
    });

    let monthlyCount = 0;
    let countdownCount = 0;

    for (const r of monthlyReminders) {
      const hearing = new Date(r.hearingDate);
      hearing.setHours(0, 0, 0, 0);

      const monthsLeft =
        hearing.getMonth() -
        today.getMonth() +
        12 * (hearing.getFullYear() - today.getFullYear());

      if (monthsLeft < 1 || monthsLeft > 6) continue;
      if (hearing.getDate() !== today.getDate()) continue;
      if (r.monthsReminded.includes(monthsLeft)) continue;

      const lang = (r.language && r.language.toLowerCase() === "es") ? "es" : "en";
      const formattedDate = hearing.toLocaleDateString(
        lang === "es" ? "es-ES" : "en-US",
        { year: "numeric", month: "long", day: "numeric" }
      );
      const base = process.env.NEXT_PUBLIC_BASE_URL;
      const unsubscribeLink = `${base}/unsubscribe?token=${r.updateToken}`;
      const updateLink = `${base}/update-hearing?token=${r.updateToken}`;

      const subject =
        lang === "es"
          ? `Recordatorio: ${monthsLeft} mes(es) hasta su audiencia`
          : `Reminder: ${monthsLeft} month(s) until your hearing`;

      const text =
        lang === "es"
          ? `Hola ${r.name}, su audiencia está programada para el ${formattedDate}. Faltan ${monthsLeft} mes(es).

Verifique su fecha:
- EOIR Hotline: 1-800-898-7180
- Online: https://acis.eoir.justice.gov/

Cancelar recordatorios: ${unsubscribeLink}
Actualizar fecha: ${updateLink}

– Immigration Court Reminder Tool`
          : `Hi ${r.name}, your hearing is in ${monthsLeft} month(s), scheduled for ${formattedDate}.

Check your hearing date:
- EOIR Hotline: 1-800-898-7180
- Online: https://acis.eoir.justice.gov/

Unsubscribe: ${unsubscribeLink}

— Immigration Court Reminder Tool`;

      const { error } = await resend.emails.send({
        to: r.email,
        from: "reminders@onboarding.resend.dev",
        subject,
        text,
      });
      if (error) throw error;

      console.log(`✅ Sent ${monthsLeft}‑mo (${lang}) to`, r.email);

      await Reminder.updateOne(
        { _id: r._id },
        { $push: { monthsReminded: monthsLeft } }
      );

      monthlyCount++;
    }

    for (const r of countdownReminders) {
      const hearing = new Date(r.hearingDate);
      hearing.setHours(0, 0, 0, 0);

      const diffMs = hearing.getTime() - today.getTime();
      const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      const lang = (r.language && r.language.toLowerCase() === "es") ? "es" : "en";
      const formattedDate = hearing.toLocaleDateString(
        lang === "es" ? "es-ES" : "en-US",
        { year: "numeric", month: "long", day: "numeric" }
      );
      const base = process.env.NEXT_PUBLIC_BASE_URL;
      const unsubscribeLink = `${base}/unsubscribe?token=${r.updateToken}`;
      const updateLink = `${base}/update-hearing?token=${r.updateToken}`;

      const subject =
        lang === "es"
          ? `Recordatorio: Quedan ${daysLeft} día(s) para su audiencia`
          : `Reminder: ${daysLeft} day(s) until your hearing`;

      const text =
        lang === "es"
          ? `Hola ${r.name}, su audiencia es el ${formattedDate} — faltan ${daysLeft} día(s).

Verifique su fecha:
- EOIR Hotline: 1-800-898-7180
- Online: https://acis.eoir.justice.gov/

Cancelar recordatorios: ${unsubscribeLink}
Actualizar fecha: ${updateLink}

– Immigration Court Reminder Tool`
          : `Hi ${r.name}, your hearing is ${formattedDate} — just ${daysLeft} day(s) away.

Please double‑check your hearing date:
- EOIR Hotline: 1-800-898-7180
- Online: https://acis.eoir.justice.gov/

Unsubscribe: ${unsubscribeLink}

— Immigration Court Reminder Tool`;

      const { error } = await resend.emails.send({
        to: r.email,
        from: "reminders@onboarding.resend.dev",
        subject,
        text,
      });
      if (error) throw error;

      console.log(`✅ Sent ${daysLeft}‑day (${lang}) to`, r.email);

      if (daysLeft === 1) {
        await Reminder.updateOne(
          { _id: r._id },
          { $set: { reminderSent: true } }
        );
      }

      countdownCount++;
    }

    return res.status(200).json({
      message: `Sent ${monthlyCount} monthly and ${countdownCount} countdown reminders.`,
    });
  } catch (error) {
    console.error("❌ send7dayCountdownReminder error:", error);
    return res.status(500).json({ message: "Error sending reminders", error: error.message });
  }
}
