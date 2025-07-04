import dbConnect from "@/lib/mongodb";
import Reminder from "@/models/Reminder";
import { Resend } from "resend";
import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST requests allowed" });
  }

  const { name, email, hearingDate, aNumber, language } = req.body;

  const updateToken = crypto.randomBytes(16).toString("hex"); // ✅ generate token

  const formattedDate = new Date(hearingDate).toLocaleDateString(
    language === "es" ? "es-ES" : "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const unsubscribeLink = `${baseUrl}/unsubscribe?token=${updateToken}`;
  const updateLink = `${baseUrl}/update-hearing?token=${updateToken}`;

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

¿Desea dejar de recibir recordatorios? Cancele aquí: ${unsubscribeLink}  
¿Necesita cambiar su fecha de audiencia? Por favor cancela su recordatorio inicial y mande uno nuevo aquí: hearing-date-reminder.vercel.app

– Recordatorios de Audiencias de Inmigración`
      : `Hi ${name}, your hearing is set for ${formattedDate}. We will send more reminders in the future until your hearing date arrives.

Please note: Immigration court dates can change without notice. This reminder is provided as a personal aid, but it is not an official court notice.

- Call the EOIR Automated Hotline to confirm: 1-800-898-7180  
- Or check your case online: https://acis.eoir.justice.gov/

Want to stop these reminders? Unsubscribe here: ${unsubscribeLink}  
Need to update your hearing date? Please unsubscribe and submit a new form here: hearing-date-reminder.vercel.app

– Immigration Court Hearing Reminders`;

const resend = new Resend(process.env.RESEND_API_KEY);

  const msg = {
    to: email,
    from: "reinaldogutvill@gmail.com",
    subject,
    text,
  };

  try {
    await dbConnect();

    // ✅ Save the reminder with the token
    await Reminder.create({
      name,
      aNumber,
      hearingDate,
      email,
      language,                      // ✅ included
      monthsReminded: [],
      updateToken,
      isUnsubscribed: false,
    });

    const { error } = await resend.emails.send({
      to: email,
      from: process.env.RESEND_FROM,  // We'll add this next step
      subject,
      text,
      html,
    });
    
    if (error) {
      throw error;
    }
    

    res.status(200).json({ message: "Email sent and saved successfully!" });
  } catch (error) {
    console.error("Send or DB error:", error);
    res.status(500).json({ message: "Something went wrong." });
  }
}