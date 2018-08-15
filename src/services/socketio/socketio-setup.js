import {
  leaveRoom,
  onPlayerDisconnect,
  authenticateGameAdmin,
  authenticateGamePlayer
} from "./socketutils";
import log from "../../utils/log";
// const Server = require("socket.io");
// //import Server from "socket.io";
// const io = new Server();
// io.attach(+process.env.PORT || 3000);

/**
 *
 * @param {*} io socket.io instance
 * @param {*} recordType 'quiz' or 'survey'
 */
function setupSocketIO(io, recordType) {
  const adminIO = io.of(`/${recordType}admin`);
  const playerIO = io.of(`/${recordType}player`);

  adminIO.on("connection", function(socket) {
    socket.authenticated = false;

    //  data = { pin: pin, userInfo: userInfo }; // userInfo as provided during login
    socket.on("authenticate", async (data, onError) => {
      await authenticateGameAdmin(data, socket, playerIO, recordType, onError);
    });

    socket.on("disconnect", () => {
      leaveRoom(socket, recordType);
      log.debug(`user ${socket.id} disconnected`);
    });

    socket.on("error", error => {
      log.error(`From server /${recordType}admin. An error occurred`);
      log.error(error);
    });
  });

  playerIO.on("connection", function(socket) {
    socket.authenticated = false;

    socket.on("authenticate", async (data, onError) => {
      await authenticateGamePlayer(data, socket, playerIO, adminIO, recordType, onError);
    });

    socket.on("disconnect", () => {
      onPlayerDisconnect(socket, adminIO, recordType);
    });

    socket.on("error", error => {
      log.error(`From server /${recordType}player. An error occurred`);
      log.error(error);
    });
  });
}

module.exports = setupSocketIO;
