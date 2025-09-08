const { DisconnectReason } = require('@whiskeysockets/baileys');
const { log } = require('../../../src/utils/logger.js');
const { checkAntiLink } = require('../utils/antiLink.js');
const { checkAntiArabic } = require('../utils/antiArabic.js');
const { CREATOR_JID } = require('../config/settings.js');

const isCreator = (jid) => jid.includes(CREATOR_JID);

const handleConnectionUpdate = async (update, sock) => {
    const { connection, qr, lastDisconnect } = update;
    if (qr) {
        log("📌 Escanea este QR para la Consola 2:");
        require('qrcode-terminal').generate(qr, { small: true });
    }
    if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        log(`Consola 2 - Conexión cerrada. Razón: ${statusCode}`);
        if (statusCode !== DisconnectReason.loggedOut) {
            log('Consola 2 - Reconectando...');
            require('../main/index.js').startConsola2();
        } else {
            log('Consola 2 - Sesión cerrada.');
        }
    } else if (connection === "open") {
        log("✅ Consola 2 conectada a WhatsApp");
    }
};

const handleMessagesUpsert = async ({ messages }, sock) => {
    const m = messages[0];
    if (!m.key.fromMe) {
        const messageText = m.message?.conversation || m.message?.extendedTextMessage?.text || '';
        const senderJid = m.key.remoteJid;
        const isGroup = senderJid.endsWith('@g.us');

        if (isGroup) {
            // Lógica Anti-link
            if (await checkAntiLink(sock, m)) return;

            // Lógica para el comando .kick manual
            if (isCreator(m.key.participant || m.key.remoteJid) && messageText.startsWith('.kick')) {
                try {
                    const groupJid = m.key.remoteJid;
                    const targetJid = m.message.extendedTextMessage.contextInfo.mentionedJid[0];
                    if (!targetJid) {
                         await sock.sendMessage(groupJid, { text: '❌ Por favor, menciona a un usuario para expulsarlo.' });
                         return;
                    }
                    await sock.groupParticipantsUpdate(groupJid, [targetJid], 'remove');
                    await sock.sendMessage(groupJid, { text: `✅ Usuario @${targetJid.split('@')[0]} ha sido expulsado.` });
                    log(`Comando .kick ejecutado en ${groupJid}`);
                } catch (e) {
                    log('❌ Error al expulsar al usuario: ' + e.message);
                    await sock.sendMessage(m.key.remoteJid, { text: '❌ No pude expulsar al usuario. Asegúrate de que tengo los permisos necesarios.' });
                }
            }
        }
    }
};

module.exports = {
    handleConnectionUpdate,
    handleMessagesUpsert
};