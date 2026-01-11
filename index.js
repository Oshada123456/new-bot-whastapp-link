const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
        executablePath: '/usr/bin/chromium'
    }
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('QR එක Scan කරන්න (Koyeb Logs වල බලන්න)');
});

client.on('ready', () => {
    console.log('Bot එක සාර්ථකව වැඩ!');
});

client.on('message', async (msg) => {
    // උදාහරණයක් ලෙස: .dl [URL] ලෙස message එක එවන්න
    if (msg.body.startsWith('.dl ')) {
        const url = msg.body.split(' ')[1];
        const fileName = `movie_${Date.now()}.mp4`;
        const filePath = path.join(__dirname, fileName);

        try {
            await msg.reply('Downloading... කරුණාකර රැඳී සිටින්න.');

            // File එක Stream කරලා download කිරීම (RAM ඉතිරි කරගන්න)
            const response = await axios({
                method: 'get',
                url: url,
                responseType: 'stream'
            });

            const writer = fs.createWriteStream(filePath);
            response.data.pipe(writer);

            writer.on('finish', async () => {
                try {
                    const media = MessageMedia.fromFilePath(filePath);
                    await client.sendMessage(msg.from, media, { sendMediaAsDocument: true });
                    await msg.reply('සාර්ථකව එවන ලදී!');
                } catch (err) {
                    msg.reply('Error: File එක යැවීමේදී ගැටලුවක් මතු විය.');
                } finally {
                    // File එක යැව්වාට පසු අනිවාර්යයෙන් මැකීම
                    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                }
            });

        } catch (error) {
            msg.reply('Error: URL එක වැරදියි හෝ download කරගත නොහැක.');
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
    }
});

client.initialize();
