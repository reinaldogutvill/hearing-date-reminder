// pages/unsubscribe.jsx

import { useEffect } from "react";

export default function UnsubscribePage() {
  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      document.body.innerHTML = "<h1>Invalid unsubscribe link.</h1>";
      return;
    }

    // fetch the HTML response and replace the body
    fetch(`/api/unsubscribe?token=${token}`)
      .then((res) => res.text())
      .then((html) => {
        document.body.innerHTML = html;
      })
      .catch(() => {
        document.body.innerHTML = "<h1>Something went wrong. Please try again.</h1>";
      });
  }, []);

  // while loading, you can show nothing or a spinner
  return null;
}
