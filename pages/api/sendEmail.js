import dbConnect from "@/lib/mongodb";
import Reminder from "@/models/Reminder";
import sgMail from "@sendgrid/mail";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST requests allowed" });
  }

  const { name, email, hearingDate, aNumber, language } = req.body;

  const formattedDate = new Date(hearingDate).toLocaleDateString(
    language === "es" ? "es-ES" : "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  const subject =
    language === "es"
      ? "Confirmación de Recordatorio de Audiencia"
      : "Hearing Reminder Confirmed";

  const text =
    language === "es"
      ? `Hola ${name}, su audiencia está programada para el ${formattedDate}. Enviaremos más recordatorios en el futuro.

Tenga en cuenta que las fechas de audiencia pueden cambiar sin previo aviso. Este recordatorio es solo un apoyo personal, no un aviso oficial del tribunal.

  - Llame a la línea automatizada de EOIR: 1-800-898-7180  
  - Verifica su caso en línea: https://acis.eoir.justice.gov/

– Recordatorios de Audiencias de Inmigración`
      : `Hi ${name}, your hearing is set for ${formattedDate}. We will send more reminders in the future until your hearing date arrives.

Please note: Immigration court dates can change without notice. This reminder is provided as a personal aid, but it is not an official court notice.

  - Call the EOIR Automated Hotline to confirm: 1-800-898-7180  
  - Or check your case online: https://acis.eoir.justice.gov/

– Immigration Court Hearing Reminders`;

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const msg = {
    to: email,
    from: "reinaldogutvill@gmail.com",
    subject,
    text,
  };

  try {
    await dbConnect();
    await Reminder.create({ name, aNumber, hearingDate, email, monthsReminded: [] });
    await sgMail.send(msg);

    res.status(200).json({ message: "Email sent and saved successfully!" });
  } catch (error) {
    console.error("Send or DB error:", error);
    res.status(500).json({ message: "Something went wrong." });
  }
}