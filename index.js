const express = require("express");
const app = express();
const path = require("path");
const PORT = process.env.PORT || 4000;
const http = require("http");
const httpServer = http.createServer(app);
const socketio = require("socket.io");
const io = socketio(httpServer);

const { v4: uuidv4 } = require('uuid');

app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.get("/", (req, res) => res.render("pages/index"));
app.get("/chat", (req, res) => res.render("pages/chat"));

/* SOCKET HANDLERS */
/* SOURCE: https://socket.io/docs/v4/server-application-structure/ */

io.on("connect_error", (err) => {
    console.log(`connect_error due to ${err.message}`);
});

const connectionHandlers = require("./connectionHandler");
const socketHelperFunctions = require("./socketHelperFunctions.js");

const onConnection = (socket) => {
    socketHelperFunctions(io, socket, socketObj);
    connectionHandlers(io, socket);
    // chatEventHandlers(io, socket);
};

io.on("connection", onConnection);



/* Fix found at: https://stackoverflow.com/questions/70501638/client-doesnt-find-socket-io-js-file */
httpServer.listen(PORT, () => console.log(`Listening on ${PORT}`));


/* Handling vars and objects for modules */
/* TODO: Move this out of the index.js file */

const socketObj = {};
socketObj.fetchSockets = io.fetchSockets();
socketObj.count = io.engine.clientsCount;
socketObj.count2 = io.of("/").sockets.size;

// export default countObject;

console.log("-------------------------------------");
console.log("io.engine.clientsCount:", socketObj.count);
console.log("socket instances in namespace:", socketObj.count2);
console.log("Sockets:", socketObj.fetchSockets.length, Object.keys(socketObj.fetchSockets).length);
console.log("io.sockets.adapter.rooms:\n", io.sockets.adapter.rooms);
console.log("-------------------------------------");
