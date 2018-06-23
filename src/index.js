const dotenv = require("dotenv");
dotenv.load();

const app = require("./app");
const socketio = require("socket.io");
const http = require("http");

const server = http.createServer(app.callback());

const io = socketio(server);

const socketSetup = require("./services/socketsetup");
socketSetup.setupQuizSockets(io);

const surveyAdminIO = io.of(`/surveyadmin`);
const surveyPlayerIO = io.of(`/surveyplayer`);

surveyAdminIO.on("connection", function(socket) {
  socket.authenticated = false;

  //  data = { pin: pin, userInfo: userInfo }; // userInfo as provided during login
  socket.on("authenticate", (data, onError) => {
    try {
      //const token = data.token

      // You'll probably want to log the username or ID here instead. I don't
      // use socket.id at all myself.
      log.debug(`authenticated socket ID "${socket.id}"`);

      socket.authenticated = true;

      // Join the room playing the game
      log.debug("Socket %s joining room %s", socket.id, roomNo);
      socket.join(roomNo);
    } catch (e) {
      log.error("Server Socket: Error on 'authenticate' for socket %s: %O", socket.id, e.message);
      if (onError) {
        onError(e.message);
      }
    }
  });

  // { pin: 'w323', surveyId: 3, questionId: 2, answer: 1, bonus: 4, points:
  socket.on("get-next-question", async (data, onError) => {
    try {
      const question = await new SurveyRunService().getNextQuestionToBeAnswered(
        data.pin,
        data.surveyId
      );
      io.in(roomNo).emit("receive-next-question", question);
    } catch (e) {
      log.error(
        "Server Socket: Error on 'get-next-question' for socket %s: %s",
        socket.id,
        e.message
      );
      if (onError) {
        onError(e.message);
      }
    }
  });

  socket.on("someone-just-joined", player => {
    try {
      surveyPlayerIO.in(roomNo).clients((err, clients) => {
        if (!err) {
          const nPlayers = clients.length;
          const topFive = clients.slice(0, 5);
          // Inform admin so she can display on UI
          const payload = { nPlayers: nPlayers, topFive: topFive };
          surveyAdminIO.in(roomNo).emit("when-someone-just-joined", payload);
        } else {
          log.error(
            "Server Socket: Error on 'someone-just-joined' trying to get clients in room. Socket: %s: %s",
            socket.id,
            err.message
          );
        }
      });
    } catch (e) {
      log.error(
        "Server Socket: Error on 'someone-just-joined' for socket %s: %s",
        socket.id,
        e.message
      );
    }
  });

  // data = { pin: pin, socketId }
  socket.on("someone-just-left", socketId => {
    try {
      const roomNo = getQuizRoomNo(data.pin);
      surveyPlayerIO.in(roomNo).clients((err, clients) => {
        if (!err) {
          const nPlayers = clients.length;
          const topFive = clients.slice(0, 5);
          // Inform admin so she can display on UI
          const payload = { nPlayers: nPlayers, topFive: topFive };
          surveyAdminIO.in(roomNo).emit("when-someone-just-left", payload);
        } else {
          log.error(
            "Server Socket: Error on 'someone-just-left' trying to get clients in room. Socket: %s: %s",
            socket.id,
            err.message
          );
        }
      });
    } catch (e) {
      log.error(
        "Server Socket: Error on 'someone-just-left' for socket %s: %s",
        socket.id,
        e.message
      );
    }
  });

  socket.on("disconnect", () => {
    socket.leave(roomNo);
    log.debug(`user ${socket.id} disconnected`);
  });

  socket.on("error", error => {
    console.log(`From server /surveyadmin. An error occurred`);
    console.log(error);
  });
});

surveyPlayerIO.on("connection", function(socket) {
  socket.authenticated = false;
  socket.emit("get-survey-pin", `${surveyRunInfo.pin}`);

  //  data = { pin: pin, userInfo: userInfo }; // userInfo as provided during login
  socket.on("authenticate", (data, onError) => {
    try {
      //const token = data.token
      if (data.pin === surveyRunInfo.pin) {
        // You'll probably want to log the username or ID here instead. I don't
        // use socket.id at all myself.
        log.debug(`authenticated socket ID "${socket.id}"`);

        socket.authenticated = true;
        socket.user = data.userInfo;

        // Join the room playing the game
        log.debug("Socket %s joining room %s", socket.id, roomNo);
        socket.join(roomNo);

        // Tell server someone just connected
        surveyAdminIO.emit("someone-just-joined", data.userInfo);
      } else {
        socket.disconnect(true);
        if (onError) {
          onError("Invalid credentials. Failed to authenticate.");
        }
      }
    } catch (e) {
      log.error(
        "Server Socket: Error on 'get-next-question' for socket %s: %s",
        socket.id,
        e.message
      );
      if (onError) {
        onError(e.message);
      }
    }
  });

  // { pin: 'w323', userId: 3, surveyQuestionId: 2, choice: 1, correct: true, bonus: 4, points: 12 }
  socket.on("submit-answer", async (data, onError) => {
    try {
      validateSurveyAnswerProps(data);
      await new SurveyAnswerService().save(data);
      surveyAdminIO.emit("player-sumbitted-answer", {
        surveyQuestionId: data.surveyQuestionId,
        choice: data.choice
      });
      socket.emit("answer-submitted", "Submitted");
    } catch (e) {
      log.error("Server Socket: Error on 'submit-answer' for socket %s: %s", socket.id, e.message);
      if (onError) {
        onError(e.message);
      }
    }
  });

  socket.on("disconnect", () => {
    socket.leave(roomNo);
    surveyAdminIO.emit("someone-just-left", socket.user);
    log.debug("user %s: $o disconnected", socket.id, socket.user);
  });

  socket.on("error", error => {
    console.log(`From server /surveyplayer. An error occurred`);
    console.log(error);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
