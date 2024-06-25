const pino = require("pino");
const {LOG_LEVEL} = require("./config");

module.exports = {
    logger: pino({
        level: LOG_LEVEL,
        transport: {
            target: 'pino-pretty'
        }
    })
}