const log = (message) => {
    const timestamp = new Date().toLocaleString();
    console.log(`[${timestamp}] INFO: ${message}`);
};

const logError = (message) => {
    const timestamp = new Date().toLocaleString();
    console.error(`[${timestamp}] ERROR: ${message}`);
};

module.exports = {
    log,
    logError
};