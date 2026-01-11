const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const http = require('http');

// Render එකේ Web Service එකක් පණ ගැන්වීමට අවශ්‍යයි
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot is running...');
});
server.listen(process.env.PORT || 3000);

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/google-chrome-stable'
    }
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('QR Code එක ලැබුණා. කරුණාකර Scan කරන්න.');
});

client.on('ready', () => {
    console.log('WhatsApp Bot එක සාර්ථකව සම්බන්ධ වුණා!');
});

client.on('message', async (msg) => {
    if (msg.body.startsWith('http')) {
        const url = msg.body;
        const fileName = `file_${Date.now()}.mkv`;
        const filePath = path.join(__dirname, fileName);

        try {
            msg.reply('බාගත වෙමින් පවතී... ⏳');
            const response = await axios({ method: 'get', url, responseType: 'stream' });
            const writer = fs.createWriteStream(filePath);
            response.data.pipe(writer);

            writer.on('finish', async () => {
                const media = MessageMedia.fromFilePath(filePath);
                await client.sendMessage(msg.from, media, { sendMediaAsDocument: true });
                await fs.remove(filePath);
            });
        } catch (e) {
            msg.reply('Error: Link එකෙන් බාගත කළ නොහැක.');
        }
    }
});

client.initialize();
