import Koa from "koa";
import Router from "koa-router";
import { QuizRunService, QuizAnswerService } from "../../services";
import { validateQuizRunProps } from "./quizruns.validate";
import log from "../../utils/log";

const router = new Router({ prefix: "/api/user/quizruns" });

router.post("/create", async ctx => {
  try {
    validateQuizRunProps(ctx.request.body);
    log.debug("Creating quiz run...");
    const res = await new QuizRunService().save(ctx.request.body);
    log.debug("Done creating quiz run...");

    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

router.get("/start", async ctx => {
  try {
    validateQuizRunProps(ctx.request.body);

    // const res = await new QuizRunService().save(ctx.request.body);

    // launchSocketIO(res);
    // ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

function launchSocketIO(quizRunInfo) {
  const app = new Koa();
  const server = require("http").createServer(app.callback());

  const roomNo = `quiz-${quizRunInfo.pin}`;
  const io = require("socket.io")(server);
  const quizAdmindminIO = io.of(`/quizadmin`);
  const quizPlayerIO = io.of(`/quizplayer`);
  quizAdmindminIO.on("connection", function(socket) {
    socket.authenticated = false;

    //  data = { pin: pin, userInfo: userInfo }; // userInfo as provided during login
    socket.on("authenticate", (data, onError) => {
      try {
        log.debug(`authenticated socket ID "${socket.id}"`);

        socket.authenticated = true;

        // Join the room playing the game
        socket.join(roomNo);
        log.debug("Socket %s joined room %s", socket.id, roomNo);

        socket.emit("get-quizrun-info", quizRunInfo);
      } catch (e) {
        log.error("Server Socket: Error on 'authenticate' for socket %s: %O", socket.id, e.message);
        if (onError) {
          onError(e.message);
        }
      }
    });

    // data = { quizRunId: 2, quizId: 3 }
    socket.on("get-next-question", async (data, answeredQuestionIds, onError) => {
      try {
        const question = await new QuizRunService().getNextQuestionToBeAnswered(
          data.quizRunId,
          data.quizId
        );
        // send question to both moderators and players
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
        quizPlayerIO.in(roomNo).clients((err, clients) => {
          if (!err) {
            const nPlayers = clients.length;
            const topFive = clients.slice(0, 5);
            // Inform admin so she can display on UI
            const payload = {
              nPlayers: nPlayers,
              topFive: topFive
            };
            quizAdmindminIO.in(roomNo).emit("when-someone-just-joined", payload);
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

    socket.on("someone-just-left", socketId => {
      try {
        quizPlayerIO.in(roomNo).clients((err, clients) => {
          if (!err) {
            const nPlayers = clients.length;
            const topFive = clients.slice(0, 5);
            // Inform admin so she can display on UI
            const payload = {
              nPlayers: nPlayers,
              topFive: topFive
            };
            quizAdmindminIO.in(roomNo).emit("when-someone-just-left", payload);
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
      console.log(`From server /quizadmin. An error occurred`);
      console.log(error);
    });
  });

  quizPlayerIO.on("connection", function(socket) {
    socket.authenticated = false;
    socket.emit("get-quiz-pin", `${quizRunInfo.pin}`);

    //  data = { pin: pin, userInfo: userInfo }; // userInfo as provided during login
    socket.on("authenticate", (data, onError) => {
      try {
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
          quizAdmindminIO.emit("someone-just-joined", data.userInfo);
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

    // { pin: 'w323', userId: 3, quizQuestionId: 2, choice: 1, correct: true, bonus: 4, points: 12 }
    socket.on("submit-answer", async (data, onError) => {
      try {
        validateQuizAnswerProps(data);
        await new QuizAnswerService().save(data);
        quizAdmindminIO.emit("player-sumbitted-answer", {
          quizQuestionId: data.quizQuestionId,
          choice: data.choice
        });
        socket.emit("answer-submitted", "Submitted");
      } catch (e) {
        log.error(
          "Server Socket: Error on 'submit-answer' for socket %s: %s",
          socket.id,
          e.message
        );
        if (onError) {
          onError(e.message);
        }
      }
    });

    socket.on("disconnect", () => {
      socket.leave(roomNo);
      quizAdmindminIO.emit("someone-just-left", socket.user);
      log.debug("user %s: $o disconnected", socket.id, socket.user);
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
