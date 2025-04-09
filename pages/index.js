import { useState } from "react";

export default function Home() {
  const [formData, setFormData] = useState({
    name: "",
    aNumber: "",
    hearingDate: "",
    email: "",
    language: "en",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/sendEmail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      console.log(result.message);
      setSubmitted(true);
    } catch (error) {
      console.error("Failed to send email:", error);
    }
  };

  return (
    <main style={{ padding: "2rem" }}>
      <div style={{ marginBottom: "1rem" }}>
        <button
          type="button"
          onClick={() =>
            setFormData({ ...formData, language: "en" })
          }
          disabled={formData.language === "en"}
        >
          English
        </button>
        <button
          type="button"
          onClick={() =>
            setFormData({ ...formData, language: "es" })
          }
          disabled={formData.language === "es"}
        >
          Español
        </button>
      </div>

      <h1>
        {formData.language === "es"
          ? "Recordatorio de Audiencia"
          : "Immigration Court Hearing Reminder"}
      </h1>

      {!submitted ? (
        <form onSubmit={handleSubmit}>
          <label>
            {formData.language === "es" ? "Nombre:" : "Name:"}
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </label>
          <br />

          <label>
            {formData.language === "es" ? "Número A:" : "A-Number:"}
            <input
              type="text"
              name="aNumber"
              value={formData.aNumber}
              onChange={handleChange}
              required
            />
          </label>
          <br />

          <label>
            {formData.language === "es"
              ? "Fecha de Audiencia:"
              : "Hearing Date:"}
            <input
              type="date"
              name="hearingDate"
              value={formData.hearingDate}
              onChange={handleChange}
              required
            />
          </label>
          <br />

          <label>
            {formData.language === "es" ? "Correo Electrónico:" : "Email:"}
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </label>
          <br />

          <button type="submit">
            {formData.language === "es"
              ? "Establecer Recordatorio"
              : "Set Reminder"}
          </button>
        </form>
      ) : (
        <p>
          {formData.language === "es"
            ? "¡Recordatorio establecido!"
            : "Reminder set!"}
        </p>
      )}
    </main>
  );
}
