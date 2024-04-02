const app = require("../app");
const http = require("http");
const {logger} = require('../logger');
const config = require("../config");

// set port
const port = config.PORT;
app.set("port", port);

// configure server
const server = http.createServer(app);
server.listen(port);
server.on("error", onError);
server.on("listening", onListening);

function onError(error) {
    if (error.syscall !== "listen") {
        throw error;
    }
    const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;
    // handle specific listen errors with friendly messages
    switch (error.code) {
        case "EACCES":
            logger.error(bind + " requires elevated privileges");
            process.exit(1);
            break;
        case "EADDRINUSE":
            logger.error(bind + " is already in use");
            process.exit(1);
            break;
        default:
            throw error;
    }
}

function onListening() {
    const addr = server.address();
    const bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
    logger.info("Listening on " + bind);
    if (config.DEV_MODE){
        logger.warn("DEVELOPMENT MODE ENABLED! PLEASE DISABLE THIS IF NOT RUNNING IN A DEVELOPMENT ENVIRONMENT");
    }
}
