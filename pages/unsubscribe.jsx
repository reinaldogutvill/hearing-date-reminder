import { useEffect, useState } from "react";

export default function UnsubscribePage() {
  const [status, setStatus] = useState("Processing...");

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");

    if (!token) {
      setStatus("Invalid unsubscribe link.");
      return;
    }

    fetch(`/api/unsubscribe?token=${token}`)
      .then((res) => res.json())
      .then((data) => setStatus(data.message))
      .catch(() => setStatus("Something went wrong. Please try again."));
  }, []);

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>{status}</h1>
    </div>
  );
}