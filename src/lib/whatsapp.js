export async function sendWhatsAppMessage({
    phone,
    message,
}) {
    try {
        // URL'yi bir değişkene alıyoruz. 
        // Geliştirme aşamasında localhost, canlıda ise kendi API adresini kullanır.
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

        const response = await fetch(
            `${API_URL}/send-whatsapp`,
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

        if (data.success) {
            console.log("WhatsApp mesajı başarıyla sıraya alındı ✅");
            return { success: true };
        } else {
            console.error("WhatsApp gönderilemedi: ", data.error);
            return { success: false, error: data.error };
        }

    } catch (err) {
        console.error("WhatsApp API Hatası:", err);
        return { success: false, error: err.message };
    }
}