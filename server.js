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
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

// --- 2. WHATSAPP İSTEMCİSİ ---
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        // Render/Linux için kritik sandbox ayarları
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-accelerated-2d-canvas",
            "--no-first-run",
            "--no-zygote",
            "--disable-gpu"
        ],
    }
});

client.on("qr", (qr) => {
    console.log("---------------------------------------");
    console.log("WHATSAPP QR KODU (Telefonuna okut):");
    qrcode.generate(qr, { small: true });
    console.log("---------------------------------------");
});

client.on("ready", () => {
    console.log("WhatsApp bağlantısı hazır! ✅");
});

client.on("auth_failure", msg => {
    console.error("WhatsApp Kimlik Doğrulama Hatası: ", msg);
});

client.initialize();

// --- 3. ENDPOINTLER ---

// A. Token Kaydetme
app.post("/save-token", async (req, res) => {
    try {
        const { token, role } = req.body;
        const { data, error } = await supabase
            .from("fcm_tokens")
            .upsert([{ token, role }], { onConflict: "token" });

        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// B. Push Bildirim Gönderme
app.post("/send-push", async (req, res) => {
    try {
        const { title, body, targetRole } = req.body;

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
        }

        res.json({ success: true, sentCount: response.successCount });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// C. WhatsApp Mesaj Gönderme (Geliştirilmiş Formatlama)
app.post("/send-whatsapp", async (req, res) => {
    try {
        let { phone, message } = req.body;

        // Telefon numarasını temizle ve formatla
        let cleanedPhone = phone.replace(/\D/g, ""); // Sadece rakamlar

        // Türkiye için: Eğer 05xx ile başlıyorsa 90 ekle, 5xx ile başlıyorsa 90 ekle
        if (cleanedPhone.startsWith("0")) {
            cleanedPhone = "90" + cleanedPhone.substring(1);
        } else if (cleanedPhone.length === 10 && cleanedPhone.startsWith("5")) {
            cleanedPhone = "90" + cleanedPhone;
        }

        const chatId = `${cleanedPhone}@c.us`;

        // Mesajı gönder
        await client.sendMessage(chatId, message);
        console.log(`WhatsApp mesajı gönderildi: ${chatId}`);

        res.json({ success: true });
    } catch (err) {
        console.error("WhatsApp Hatası:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// D. Sunucuyu Uyanık Tutma (Ping)
app.get("/ping", (req, res) => res.send("pong 🏓"));

// --- 4. SERVER BAŞLAT ---
const PORT = process.env.PORT || 3001;
const MY_RENDER_URL = process.env.MY_RENDER_URL || "https://senin-proje-adin.onrender.com";

app.listen(PORT, () => {
    console.log(`Server ${PORT} portunda çalışıyor...`);

    // Self-ping mekanizması (Her 10 dakikada bir)
    setInterval(async () => {
        try {
            await axios.get(`${MY_RENDER_URL}/ping`);
            console.log("Self-ping: Sistem uyanık. 🚀");
        } catch (err) {
            console.log("Self-ping: Uyarı, URL erişilemez durumda.");
        }
    }, 600000);
});