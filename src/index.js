const dotenv = require("dotenv");
dotenv.load();

const app = require("./app");
const http = require("http");

const server = http.createServer(app.callback());
if (process.env.USE_SOCKET_IO === "true") {
  // init socket
  const SocketServer = require("socket.io");
  //import Server from "socket.io";
  const io = SocketServer(server);

  const setupSocketIO = require("./services/socketio/socketio-setup");
  setupSocketIO(io, "quiz");
  setupSocketIO(io, "survey");
}
const PORT = process.env.PORT;
server.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
