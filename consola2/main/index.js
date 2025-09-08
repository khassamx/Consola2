const { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, Browsers } = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

const { handleConnectionUpdate, handleMessagesUpsert, handleGroupParticipantsUpdate } = require('../src/handlers/events.js');
const { log } = require('../src/utils/logger.js');

async function startConsola2() {
    log('Iniciando Consola 2...');

    const sessionPath = path.join(__dirname, '../data/session');
    if (!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath, { recursive: true });

    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state,
        browser: Browsers.macOS("Desktop"),
        logger: pino({ level: 'silent' })
    });
    global.sock2 = sock;

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on("connection.update", (update) => handleConnectionUpdate(update, sock));
    sock.ev.on("messages.upsert", (messages) => handleMessagesUpsert(messages, sock));
    sock.ev.on("group-participants.update", (groupData) => handleGroupParticipantsUpdate(groupData, sock));
}

startConsola2();