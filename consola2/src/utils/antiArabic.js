const { log, error } = require('./logger.js');
const { ARABIC_PREFIXES } = require('../config/settings.js');

const checkAntiArabic = async (sock, groupJid, participantJid) => {
    const countryCode = participantJid.split('@')[0].substring(0, 3);
    const isArabic = ARABIC_PREFIXES.includes(countryCode);

    if (isArabic) {
        try {
            await sock.groupParticipantsUpdate(groupJid, [participantJid], 'remove');
            log(`🚫 Anti-Árabe: Usuario con código '${countryCode}' expulsado de [${groupJid}].`);
            return true;
        } catch (e) {
            error(`Error en Anti-Árabe al expulsar: ${e.message}`);
            return false;
        }
    }
    return false;
};

module.exports = {
    checkAntiArabic
};