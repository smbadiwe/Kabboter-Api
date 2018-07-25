const dotenv = require("dotenv");
dotenv.load();

const app = require("./app");
const http = require("http");

const server = http.createServer(app.callback());

if (process.env.USE_SOCKET_IO === "true") {
  const socketio = require("socket.io");
  const io = socketio(server);

  const socketSetup = require("./services/socketio/socketsetup");
  socketSetup.setupQuizSockets(io);
  socketSetup.setupSurveySockets(io);
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
