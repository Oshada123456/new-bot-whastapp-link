const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth(), // මේකෙන් තමයි ඔයාගේ login එක මතක තබා ගන්නේ
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// Terminal එකේ QR Code එක පෙන්වීමට
client.on('qr', (qr) => {
    console.log('පහත QR Code එක Scan කරන්න:');
    qrcode.generate(qr, { small: true });
});

// සාර්ථකව සම්බන්ධ වූ පසු
client.on('ready', () => {
    console.log('නියමයි! WhatsApp සම්බන්ධ වුණා.');
});

client.initialize();
