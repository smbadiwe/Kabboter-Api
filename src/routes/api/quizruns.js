import Koa from "koa";
import Router from "koa-router";
import { QuizRunService, QuizAnswerService } from "../../services";
import { validateQuizRunProps } from "./quizruns.validate";
import log from "../../utils/log";

const router = new Router({ prefix: "/api/user/quizruns" });

router.post("/create", async ctx => {
  try {
    validateQuizRunProps(ctx.request.body);

    const res = await new QuizRunService().save(ctx.request.body);

    launchSocketIO(res);
    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

function launchSocketIO(quizRunInfo) {
  const app = new Koa();
  const server = require("http").createServer(app.callback());

  const roomNo = `quiz-${quizRunInfo.pin}`;
  const io = require("socket.io")(server);
  const adminIO = io.of(`/quizadmin`);
  const playerIO = io.of(`/quizplayer`);
  adminIO.on("connection", function(socket) {
    socket.authenticated = false;

    //  data = { pin: pin, userInfo: userInfo }; // userInfo as provided during login
    socket.on("authenticate", data => {
      //const token = data.token

      // You'll probably want to log the username or ID here instead. I don't
      // use socket.id at all myself.
      console.log(`authenticated socket ID "${socket.id}"`);

      socket.authenticated = true;

      // Join the room playing the game
      log.debug("Socket %s joining room %s", socket.id, roomNo);
      socket.join(roomNo);
    });

    // { pin: 'w323', quizId: 3, questionId: 2, answer: 1, bonus: 4, points:
    socket.on("get-next-question", async data => {
      const question = await new QuizRunService().getNextQuestionToBeAnswered(
        data.pin,
        data.quizId
      );
      io.in(roomNo).emit("get-next-question", question);
    });

    socket.on("someone-just-joined", player => {
      playerIO.in(roomNo).clients((err, clients) => {
        const nPlayers = clients.length;
        const topFive = clients.slice(0, 5);
        // Inform admin so she can display on UI
        const payload = { nPlayers: nPlayers, topFive: topFive };
        adminIO.in(roomNo).emit("someone-just-joined", payload);
      });
    });

    socket.on("someone-just-left", (socketId, onError) => {
      playerIO.in(roomNo).clients((err, clients) => {
        const nPlayers = clients.length;
        const topFive = clients.slice(0, 5);
        // Inform admin so she can display on UI
        const payload = { nPlayers: nPlayers, topFive: topFive };
        adminIO.in(roomNo).emit("someone-just-left", payload);
      });
    });

    socket.on("disconnect", () => {
      socket.leave(roomNo);
      log.debug(`user ${socket.id} disconnected`);
    });

    socket.on("error", error => {
      console.log(`From server /quizadmin. An error occurred`);
      console.log(error);
    });
  });

  playerIO.on("connection", function(socket) {
    socket.authenticated = false;
    socket.emit("get-quiz-pin", `${quizRunInfo.pin}`);

    //  data = { pin: pin, userInfo: userInfo }; // userInfo as provided during login
    socket.on("authenticate", (data, onError) => {
      //const token = data.token
      if (data.pin === quizRunInfo.pin) {
        // You'll probably want to log the username or ID here instead. I don't
        // use socket.id at all myself.
        log.debug(`authenticated socket ID "${socket.id}"`);

        socket.authenticated = true;
        socket.user = data.userInfo;

        // Join the room playing the game
        log.debug("Socket %s joining room %s", socket.id, roomNo);
        socket.join(roomNo);

        // Tell server someone just connected
        adminIO.emit("someone-just-joined", data.userInfo);
      } else {
        socket.disconnect(true);
        if (onError) {
          onError("Invalid credentials. Failed to authenticate.");
        }
      }
    });

    // { pin: 'w323', userId: 3, quizQuestionId: 2, choice: 1, correct: true, bonus: 4, points: 12 }
    socket.on("submit-answer", async data => {
      validateQuizAnswerProps(data);
      await new QuizAnswerService().save(data);
      socket.emit("submit-answer", "Submitted");
    });

    socket.on("disconnect", () => {
      socket.leave(roomNo);
      adminIO.emit("someone-just-left", socket.user);
      log.debug(`user ${socket.id} disconnected`);
    });

    socket.on("error", error => {
      console.log(`From server /quizplayer. An error occurred`);
      console.log(error);
    });
  });

  server.listen(process.env.PORT, () => {
    log.debug("Socket.IO listening on *:%d", process.env.PORT);
  });
}

// console.log(router.stack.map(i => i));
// Don't change this to ES6 style. We use 'require' to auto-register routes
// See src/app.js
module.exports = router;
