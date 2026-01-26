const { Client, RemoteAuth } = require('whatsapp-web.js');
const { MongoStore } = require('wwebjs-mongo');
const mongoose = require('mongoose');
const qrcode = require('qrcode-terminal');
const express = require('express');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

// Render එක Sleep වීම වැළැක්වීමට (Self-Ping)
app.get('/', (req, res) => res.send('Bot is Running!'));
app.listen(port, () => console.log(`Server listening on port ${port}`));

// පසුව Repo 2 (Downloader) එකේ URL එක මෙතනට දාන්න ඕනේ
const DOWNLOADER_URL = "https://your-downloader-repo-2.onrender.com/download";

const MONGO_URI = process.env.MONGO_URI; // අපි මේක Render එකේදී ලබා දෙමු

mongoose.connect(MONGO_URI).then(() => {
    const store = new MongoStore({ mongoose: mongoose });
    const client = new Client({
        authStrategy: new RemoteAuth({
            store: store,
            backupSyncIntervalMs: 300000
        }),
        puppeteer: {
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        }
    });

    client.on('qr', (qr) => {
        console.log('QR Code received, scan it in logs:');
        qrcode.generate(qr, {small: true});
    });

    client.on('ready', () => console.log('WhatsApp Bot is ready!'));

    client.on('message', async (msg) => {
        // TikTok/FB Link එකක්දැයි බැලීම
        if (msg.body.includes('tiktok.com') || msg.body.includes('facebook.com')) {
            msg.reply('වීඩියෝ එක සකසමින් පවතියි, මොහොතක් රැඳී සිටින්න...');
            
            try {
                // Repo 2 (Downloader) එකට Request එක යැවීම
                const response = await axios.get(`${DOWNLOADER_URL}?url=${encodeURIComponent(msg.body)}`);
                if (response.data.video_url) {
                    // වීඩියෝ එක ලැබුණාම User ට යැවීම
                    // (මෙතැනදී MediaMessage පාවිච්චි කරන්න පුළුවන්)
                    msg.reply(`මෙන්න ඔයාගේ වීඩියෝ එක: ${response.data.video_url}`);
                }
            } catch (error) {
                msg.reply('කණගාටුයි, වීඩියෝ එක ලබා ගැනීමට නොහැකි වුණා.');
            }
        }
    });

    client.initialize();
});
