export async function sendWhatsAppMessage({
  phone,
  message,
}) {
  try {
    const response = await fetch(
      "http://localhost:3001/send-whatsapp",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone,
          message,
        }),
      }
    );

    const data = await response.json();

    console.log(data);

    console.log("WhatsApp gönderildi ✅");
  } catch (err) {
    console.log(err);
  }
}