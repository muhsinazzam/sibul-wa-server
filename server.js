/**
 * SIBUL OPENWA GATEWAY SERVER (100% GRATIS & RUNS LOCALLY)
 * Implementasi REST API OpenWA menggunakan Baileys Multi-Device Engine
 */

const express = require('express');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, delay } = require('@whiskeysockets/baileys');
const pino = require('pino');
const QRCode = require('qrcode');
const qrcodeTerminal = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 2785;

// Middleware
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// State
let sock = null;
let qrCodeDataUrl = null;
let connectionStatus = 'initializing'; // initializing, qr_ready, ready, disconnected
let connectedPhone = null;

const sessionDir = path.join(__dirname, 'auth_info_baileys');
if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
}

// Inisialisasi WhatsApp Connection
async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

    sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        browser: ['Sibul Gateway', 'Chrome', '1.0.0']
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            connectionStatus = 'qr_ready';
            console.log('\n======================================================');
            console.log('📱 SCAN QR CODE WHATSAPP DI BAWAH INI DENGAN HP ANDA:');
            console.log('======================================================');
            qrcodeTerminal.generate(qr, { small: true });
            console.log('Atau buka browser di: http://localhost:' + PORT);
            console.log('======================================================\n');
            qrCodeDataUrl = await QRCode.toDataURL(qr);
        }

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            connectionStatus = 'disconnected';
            console.log('⚠️ Koneksi WhatsApp terputus. Mencoba menghubungkan kembali:', shouldReconnect);
            if (shouldReconnect) {
                setTimeout(connectToWhatsApp, 5000);
            }
        } else if (connection === 'open') {
            connectionStatus = 'ready';
            qrCodeDataUrl = null;
            connectedPhone = sock.user?.id ? sock.user.id.split(':')[0] : 'Aktif';
            console.log('\n======================================================');
            console.log('🎉 WHATSAPP BERHASIL TERHUBUNG & SIAP DIGUNAKAN!');
            console.log('👤 Nomor Bot Terhubung :', connectedPhone);
            console.log('🚀 Server Sibul Gateway: http://localhost:' + PORT);
            console.log('======================================================\n');
        }
    });
}

// Start WhatsApp
connectToWhatsApp();

// ==========================================
// REST API ROUTES (COMPATIBLE DENGAN OPENWA)
// ==========================================

// Format nomor HP ke WhatsApp JID
function formatJid(chatId) {
    let clean = chatId.trim().replace(/[\s\-\+]/g, '');
    if (clean.startsWith('0')) {
        clean = '62' + clean.slice(1);
    }
    if (!clean.includes('@')) {
        clean = `${clean}@s.whatsapp.net`;
    } else if (clean.endsWith('@c.us')) {
        clean = clean.replace('@c.us', '@s.whatsapp.net');
    }
    return clean;
}

// 1. Dashboard Web UI
app.get('/', (req, res) => {
    const html = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sibul WhatsApp Gateway Dashboard</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0c0d14; color: #fff; text-align: center; padding: 30px; }
            .card { background: #16192b; border: 1px solid #2a2e4a; border-radius: 16px; max-width: 500px; margin: 0 auto; padding: 24px; box-shadow: 0 8px 32px rgba(0,0,0,0.5); }
            h1 { color: #00e5ff; font-size: 24px; margin-bottom: 8px; }
            .badge { display: inline-block; padding: 6px 16px; border-radius: 20px; font-weight: bold; font-size: 14px; margin-bottom: 20px; }
            .ready { background: #2e7d32; color: #fff; }
            .qr_ready { background: #e65100; color: #fff; }
            .disconnected { background: #c62828; color: #fff; }
            .qr-img { background: #fff; padding: 12px; border-radius: 12px; margin: 16px 0; max-width: 260px; }
            .btn { background: #00e5ff; color: #000; font-weight: bold; padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer; text-decoration: none; display: inline-block; margin-top: 12px; }
            p { color: #aaa; font-size: 14px; line-height: 1.6; }
        </style>
    </head>
    <body>
        <div class="card">
            <h1>🛡️ SIBUL WHATSAPP GATEWAY</h1>
            <p>Server Gateway Protokol Hantu untuk Aplikasi Anti-Bullying</p>
            <div class="badge ${connectionStatus}">STATUS: ${connectionStatus.toUpperCase()}</div>
            
            ${connectionStatus === 'qr_ready' && qrCodeDataUrl ? `
                <p>Buka WhatsApp di HP &gt; Perangkat Tertaut &gt; Scan QR di bawah:</p>
                <img class="qr-img" src="${qrCodeDataUrl}" alt="Scan WhatsApp QR" />
                <br>
                <button class="btn" onclick="location.reload()">Refresh Halaman</button>
            ` : ''}

            ${connectionStatus === 'ready' ? `
                <div style="font-size: 60px; margin: 10px 0;">✅</div>
                <h3 style="color: #4caf50;">WhatsApp Siap Mengirim Bukti!</h3>
                <p>Nomor Terhubung: <strong>+${connectedPhone}</strong></p>
                <p style="color: #00e5ff;">Aplikasi Sibul di HP Android siap digunakan.</p>
            ` : ''}

            ${connectionStatus === 'disconnected' || connectionStatus === 'initializing' ? `
                <p>Sedang menghubungkan ke server WhatsApp...</p>
                <button class="btn" onclick="location.reload()">Cek Lagi</button>
            ` : ''}
        </div>
        <script>
            if ('${connectionStatus}' !== 'ready') {
                setTimeout(() => location.reload(), 8000);
            }
        </script>
    </body>
    </html>
    `;
    res.send(html);
});

// 2. Cek Session Status
app.get('/api/sessions/:sessionId', (req, res) => {
    res.json({
        id: req.params.sessionId,
        name: req.params.sessionId,
        status: connectionStatus,
        phone: connectedPhone,
        engineLoaded: true
    });
});

// 3. Kirim Pesan Teks
app.post('/api/sessions/:sessionId/messages/send-text', async (req, res) => {
    try {
        const { chatId, text } = req.body;
        if (!chatId || !text) {
            return res.status(400).json({ statusCode: 400, message: 'chatId dan text wajib diisi' });
        }

        if (connectionStatus !== 'ready' || !sock) {
            return res.status(503).json({ statusCode: 503, message: 'WhatsApp belum terhubung/scan QR' });
        }

        const jid = formatJid(chatId);
        const result = await sock.sendMessage(jid, { text: text });
        res.status(201).json({ messageId: result.key.id, timestamp: Math.floor(Date.now() / 1000) });
    } catch (e) {
        console.error('Error send-text:', e);
        res.status(500).json({ statusCode: 500, message: e.message });
    }
});

// 4. Kirim Audio / Rekaman Suara
app.post('/api/sessions/:sessionId/messages/send-audio', async (req, res) => {
    try {
        const { chatId, base64, mimetype, fileName, filename, caption } = req.body;
        if (!chatId || !base64) {
            return res.status(400).json({ statusCode: 400, message: 'chatId dan base64 audio wajib diisi' });
        }

        if (connectionStatus !== 'ready' || !sock) {
            return res.status(503).json({ statusCode: 503, message: 'WhatsApp belum terhubung/scan QR' });
        }

        const buffer = Buffer.from(base64, 'base64');
        const jid = formatJid(chatId);
        const nameOfFile = filename || fileName || 'bukti_rekaman_suara.3gp';
        const mime = mimetype || 'audio/3gpp';

        console.log(`📡 Menerima pengiriman rekaman suara (${buffer.length} bytes) ke ${jid}...`);

        // Kirim sebagai berkas audio berlabel jelas yang bisa langsung di-play di WhatsApp
        const result = await sock.sendMessage(jid, {
            document: buffer,
            mimetype: mime,
            fileName: nameOfFile,
            caption: caption || '🎙️ *BUKTI REKAMAN SUARA DARURAT SIBUL*'
        });

        console.log(`✅ Rekaman suara (${nameOfFile}) berhasil terkirim ke WhatsApp: ${jid}`);
        res.status(201).json({ messageId: result.key.id, timestamp: Math.floor(Date.now() / 1000) });
    } catch (e) {
        console.error('❌ Error send-audio:', e);
        res.status(500).json({ statusCode: 500, message: e.message });
    }
});

// 5. Kirim Foto / Gambar
app.post('/api/sessions/:sessionId/messages/send-image', async (req, res) => {
    try {
        const { chatId, base64, caption } = req.body;
        if (!chatId || !base64) {
            return res.status(400).json({ statusCode: 400, message: 'chatId dan base64 image wajib diisi' });
        }

        const buffer = Buffer.from(base64, 'base64');
        const jid = formatJid(chatId);

        const result = await sock.sendMessage(jid, {
            image: buffer,
            caption: caption || ''
        });

        res.status(201).json({ messageId: result.key.id, timestamp: Math.floor(Date.now() / 1000) });
    } catch (e) {
        console.error('Error send-image:', e);
        res.status(500).json({ statusCode: 500, message: e.message });
    }
});

// 6. Kirim Dokumen File
app.post('/api/sessions/:sessionId/messages/send-document', async (req, res) => {
    try {
        const { chatId, base64, filename, mimetype } = req.body;
        if (!chatId || !base64) {
            return res.status(400).json({ statusCode: 400, message: 'chatId dan base64 wajib diisi' });
        }

        const buffer = Buffer.from(base64, 'base64');
        const jid = formatJid(chatId);

        const result = await sock.sendMessage(jid, {
            document: buffer,
            mimetype: mimetype || 'application/octet-stream',
            fileName: filename || 'bukti_sibul.bin'
        });

        res.status(201).json({ messageId: result.key.id, timestamp: Math.floor(Date.now() / 1000) });
    } catch (e) {
        console.error('Error send-document:', e);
        res.status(500).json({ statusCode: 500, message: e.message });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 SIBUL OPENWA GATEWAY RUNNING ON: http://localhost:${PORT}`);
    console.log(`🌐 Web Dashboard: http://localhost:${PORT}`);
});
