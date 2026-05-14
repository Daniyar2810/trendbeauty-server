import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import admin from "firebase-admin";
import { createClient } from "@supabase/supabase-js";
import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;
import qrcode from "qrcode-terminal";
import axios from "axios";

const app = express();
app.use(cors());
app.use(express.json());

// --- 1. KURULUMLAR (FIREBASE & SUPABASE) ---
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

// --- 2. WHATSAPP İSTEMCİSİ ---
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    }
});

client.on("qr", (qr) => {
    console.log("WHATSAPP QR KODU (Telefonuna okut):");
    qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
    console.log("WhatsApp bağlantısı hazır! ✅");
});

client.initialize();

// --- 3. ENDPOINTLER ---

// A. Token Kaydetme
app.post("/save-token", async (req, res) => {
    try {
        const { token, role } = req.body; // role: 'admin' veya 'customer'
        const { data, error } = await supabase
            .from("fcm_tokens")
            .upsert([{ token, role }], { onConflict: "token" })
            .select();

        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// B. Push Bildirim Gönderme (Hata Temizleme Özellikli)
app.post("/send-push", async (req, res) => {
    try {
        const { title, body, targetRole } = req.body;

        // DB'den hedef role göre tokenları çek
        let query = supabase.from("fcm_tokens").select("token");
        if (targetRole) query = query.eq("role", targetRole);

        const { data, error } = await query;
        if (error) throw error;

        const tokens = data.map(item => item.token);
        if (tokens.length === 0) return res.json({ success: true, message: "Kayıtlı cihaz yok." });

        const message = {
            notification: { title, body },
            android: { priority: "high" },
            tokens: tokens
        };

        const response = await admin.messaging().sendEachForMulticast(message);

        // Geçersiz tokenları temizle
        const expiredTokens = [];
        response.responses.forEach((resp, idx) => {
            if (!resp.success) {
                if (resp.error.code === 'messaging/registration-token-not-registered' ||
                    resp.error.code === 'messaging/invalid-registration-token') {
                    expiredTokens.push(tokens[idx]);
                }
            }
        });

        if (expiredTokens.length > 0) {
            await supabase.from("fcm_tokens").delete().in("token", expiredTokens);
            console.log(`${expiredTokens.length} adet geçersiz token temizlendi.`);
        }

        res.json({ success: true, sentCount: response.successCount });
    } catch (err) {
        console.error("Push Hatası:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// C. WhatsApp Mesaj Gönderme
app.post("/send-whatsapp", async (req, res) => {
    try {
        const { phone, message } = req.body;
        // Telefon numarasını formatla (Örn: 905xxxxxxxxx)
        const formattedPhone = `${phone.replace(/\D/g, "")}@c.us`;

        await client.sendMessage(formattedPhone, message);
        res.json({ success: true });
    } catch (err) {
        console.error("WhatsApp Hatası:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// D. Sunucuyu Uyanık Tutma (Ping)
app.get("/ping", (req, res) => res.send("pong 🏓"));

// Render uyku moduna geçmesin diye 5 dakikada bir kendine istek atar
setInterval(() => {
    // BURAYI KENDİ RENDER URL'İNLE DEĞİŞTİR
    axios.get('https://senin-proje-adin.onrender.com/ping')
        .then(() => console.log("Self-ping: Canlıyım!"))
        .catch(() => console.log("Self-ping hatası."));
}, 300000);

// --- 4. SERVER BAŞLAT ---
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Server ${PORT} portunda çalışıyor...`);

    // --- RENDER CANLI TUTMA (SELF-PING) ---
    // Sunucu başladıktan sonra her 10 dakikada bir çalışır
    setInterval(async () => {
        try {
            // NOT: Buradaki URL'nin başına 'https://' koymayı ve 
            // kendi render adresini doğru yazmayı unutma!
            const myUrl = "https://senin-proje-adin.onrender.com/ping";
            await axios.get(myUrl);
            console.log("Self-ping: Sunucu uyandırıldı! 🚀");
        } catch (err) {
            console.log("Self-ping hatası: Uygulama henüz hazır değil veya URL yanlış.");
        }
    }, 600000); // 10 dakika (600.000 ms) - 15 dakikadan önce olması yeterli
});