const { log, error } = require('./logger.js');
const { CREATOR_JID } = require('../config/settings.js');

const isCreator = (jid) => jid.includes(CREATOR_JID);

const checkAntiLink = async (sock, m) => {
    const senderJid = m.key.remoteJid;
    const isGroup = senderJid.endsWith('@g.us');
    const messageText = m.message?.conversation || m.message?.extendedTextMessage?.text || '';
    const linkRegex = /(https?:\/\/|www\.)[^\s]+/gi;
    const senderParticipant = m.key.participant || m.key.remoteJid;

    if (!isGroup || isCreator(senderParticipant) || !messageText.match(linkRegex)) {
        return false;
    }

    try {
        const groupMetadata = await sock.groupMetadata(senderJid);
        const senderIsAdmin = groupMetadata.participants.find(p => p.id === senderParticipant)?.admin !== null;

        if (!senderIsAdmin) {
            await sock.sendMessage(senderJid, { delete: m.key });
            await sock.groupParticipantsUpdate(senderJid, [senderParticipant], 'remove');
            await sock.sendMessage(senderJid, { text: '❌ Enlace detectado. El usuario ha sido expulsado por enviar un link.' });
            log(`🚫 Anti-Link: Usuario expulsado en [${senderJid}].`);
            return true;
        } else {
            log(`ℹ️ Anti-Link: Enlace ignorado, el remitente es un administrador.`);
            return false;
        }
    } catch (e) {
        error('Error en Anti-Link: ' + e.message);
        return false;
    }
};

module.exports = {
    checkAntiLink
};