const dotenv = require("dotenv");
dotenv.load();

const app = require("./app");
const socketio = require("socket.io");
const http = require("http");

const server = http.createServer(app.callback());

const io = socketio(server);

const socketSetup = require("./services/socketsetup");
socketSetup.setupQuizSockets(io);
socketSetup.setupSurveySockets(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
