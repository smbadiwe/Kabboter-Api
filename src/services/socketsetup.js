import {
  QuizRunService,
  QuizAnswerService,
  UserService,
  SurveyRunService,
  SurveyAnswerService,
  QuizQuestionService,
  SurveyQuestionService
} from "./";
import {
  joinRoom,
  leaveRoom,
  tellAdminThatSomeoneJustJoined,
  validateQuizAnswerProps,
  getRoomNo,
  quizRooms,
  surveyRooms
} from "./socketutils";
import log from "../utils/log";

function setupQuizSockets(io) {
  const quizAdminIO = io.of("/quizadmin");
  const quizPlayerIO = io.of("/quizplayer");

  quizAdminIO.on("connection", function(socket) {
    socket.authenticated = false;

    //  data = { pin: pin, userInfo: userInfo }; // userInfo as provided during login
    socket.on("authenticate", (data, onError) => {
      try {
        const roomNo = joinRoom(socket, data.pin, "quiz");
        socket.authenticated = true;
        log.debug(`authenticated admin socket %s and added it to room %s`, socket.id, roomNo);
        quizPlayerIO.emit("get-quizrun-info", data);
      } catch (e) {
        log.error("Server Socket: Error on 'authenticate' for socket %s: %s", socket.id, e.message);
        if (onError) {
          onError(e.message);
        }
      }
    });

    // //NOT USED: data = { quizId: quidId, pin: pin, totalQuestions: totalQuestions }
    // // When quizrun is created, admin at the client will emit this event.
    // socket.on("share-quizrun-info", data => {
    //   // share to all players so they can join room too.
    //   quizPlayerIO.emit("get-quizrun-info", data);
    // });

    // data = { quizRunId: 2, pin: pin, quizId: 3 }
    socket.on("get-next-question", async (data, answeredQuestionIds, onError) => {
      try {
        log.debug(`admin socket.on("get-next-question" called. data = %o`, data);
        const question = await new QuizQuestionService().getOneUnansweredQuestion(
          data.quizId,
          answeredQuestionIds
        );
        // send question to both moderators and players
        log.debug(`send question to both moderators and players. data = %o`, question);
        socket.emit("receive-next-question", question, "quiz");
        quizPlayerIO.emit("receive-next-question", question, "quiz");
        // const roomNo = getQuizRoomNo(data.pin);
        //io.in(roomNo).emit("receive-next-question", question);
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

    // data = { pin: pin, socketId: socketId }
    socket.on("someone-just-left", data => {
      try {
        const roomNo = getRoomNo(data.pin, "quiz");
        quizPlayerIO.in(roomNo).clients((err, clients) => {
          if (!err) {
            const nPlayers = clients.length;
            const topFive = clients.slice(0, 5);
            // Inform admin so she can display on UI
            const payload = {
              nPlayers: nPlayers,
              topFive: topFive
            };
            quizAdminIO.in(roomNo).emit("when-someone-just-left", data);
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

    // data = { quizQuestionId: quizQuestionId, choice: choice }
    socket.on("player-sumbitted-answer", data => {
      //TODO: Emit to client to display in chart.
    });

    socket.on("disconnect", () => {
      leaveRoom(socket, "quiz");
      log.debug(`user ${socket.id} disconnected`);
    });

    socket.on("error", error => {
      console.log(`From server /quizadmin. An error occurred`);
      console.log(error);
    });
  });

  quizPlayerIO.on("connection", function(socket) {
    socket.authenticated = false;

    /**
    //  data =  {
    //   pin: pin,
    //     username: username,
    //       lastname: lastname,
    //         firstname: firstname,
    //           email: email,
    //             phone: phone
    // };
     */
    socket.on("authenticate", async (data, onError) => {
      try {
        //const token = data.token
        const roomNo = getRoomNo(data.pin, "quiz");
        log.debug(`rooms (set on Server): %o`, quizRooms);
        log.debug(
          `authenticating player socket - ID "${
            socket.id
          }". Searching for room ${roomNo} in room list %O`,
          quizRooms
        );

        if (quizRooms[roomNo]) {
          socket.authenticated = true;

          // create user
          log.debug("Creating player record for player: %o", data);
          const userInfo = await new UserService().processPlayerRegistration(data);
          userInfo.pin = data.pin; // the quiz pin. Not part of player record, so, not set in 'processPlayerRegistration'

          socket.user = userInfo;
          log.debug(
            `authenticated player socket - ID "${socket.id}" (${userInfo.firstname} ${
              userInfo.lastname
            })`
          );

          // Join the room playing the game
          joinRoom(socket, roomNo, "quiz");

          // tell client auth is OK, hand it the user info
          socket.emit("auth-success", userInfo);
          // Tell admin someone just connected
          tellAdminThatSomeoneJustJoined(quizAdminIO, quizPlayerIO, userInfo, roomNo);
          log.debug(
            `authenticated OK forplayer socket - ID "${socket.id}". Admin informed of new arrival`
          );
        } else {
          log.debug(
            `Auth failure - invalid PIN from player socket - ID "${
              socket.id
            }. Disconnecting socket..."`
          );
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
        // quizAdminIO.in(getQuizRoomNo(data.pin))
        quizAdminIO.emit("player-sumbitted-answer", {
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
      if (socket.roomNo) leaveRoom(socket, "quiz");

      quizAdminIO.emit("someone-just-left", socket.user);
      log.debug("user %s: $o disconnected", socket.id, socket.user);
    });

    socket.on("error", error => {
      console.log(`From server /quizplayer. An error occurred`);
      console.log(error);
    });
  });
}

function setupSurveySockets(io) {
  const surveyAdminIO = io.of("/surveyadmin");
  const surveyPlayerIO = io.of("/surveyplayer");

  surveyAdminIO.on("connection", function(socket) {
    socket.authenticated = false;

    //  data = { pin: pin, userInfo: userInfo }; // userInfo as provided during login
    socket.on("authenticate", (data, onError) => {
      try {
        const roomNo = joinRoom(socket, data.pin, "survey");
        socket.authenticated = true;
        log.debug(`authenticated admin socket %s and added it to room %s`, socket.id, roomNo);
        surveyPlayerIO.emit("get-surveyrun-info", data);
      } catch (e) {
        log.error("Server Socket: Error on 'authenticate' for socket %s: %O", socket.id, e.message);
        if (onError) {
          onError(e.message);
        }
      }
    });

    // //NOT USED: data = { surveyId: quidId, pin: pin, totalQuestions: totalQuestions }
    // // When surveyrun is created, admin at the client will emit this event.
    // socket.on("share-surveyrun-info", data => {
    //   // share to all players so they can join room too.
    //   surveyPlayerIO.emit("get-surveyrun-info", data);
    // });

    // data = { surveyRunId: 2, pin: pin, surveyId: 3 }
    socket.on("get-next-question", async (data, answeredQuestionIds, onError) => {
      try {
        log.debug(`admin socket.on("get-next-question" called. data = %o`, data);
        const question = await new SurveyQuestionService().getOneUnansweredQuestion(
          data.surveyId,
          answeredQuestionIds
        );
        // send question to both moderators and players
        log.debug(`send question to both moderators and players. data = %o`, question);
        socket.emit("receive-next-question", question, "survey");
        surveyPlayerIO.emit("receive-next-question", question, "survey");
        // const roomNo = getSurveyRoomNo(data.pin);
        //io.in(roomNo).emit("receive-next-question", question);
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

    // data = { pin: pin, socketId: socketId }
    socket.on("someone-just-left", data => {
      try {
        const roomNo = getRoomNo(data.pin, "survey");
        surveyPlayerIO.in(roomNo).clients((err, clients) => {
          if (!err) {
            const nPlayers = clients.length;
            const topFive = clients.slice(0, 5);
            // Inform admin so she can display on UI
            const payload = {
              nPlayers: nPlayers,
              topFive: topFive
            };
            surveyAdminIO.in(roomNo).emit("when-someone-just-left", data);
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

    // data = { surveyQuestionId: surveyQuestionId, choice: choice }
    socket.on("player-sumbitted-answer", data => {
      //TODO: Emit to client to display in chart.
    });

    socket.on("disconnect", () => {
      leaveRoom(socket, "survey");
      log.debug(`user ${socket.id} disconnected`);
    });

    socket.on("error", error => {
      console.log(`From server /surveyadmin. An error occurred`);
      console.log(error);
    });
  });

  surveyPlayerIO.on("connection", function(socket) {
    socket.authenticated = false;

    /**
    //  data =  {
    //   pin: pin,
    //     username: username,
    //       lastname: lastname,
    //         firstname: firstname,
    //           email: email,
    //             phone: phone
    // };
     */
    socket.on("authenticate", async (data, onError) => {
      try {
        //const token = data.token
        const roomNo = getRoomNo(data.pin, "survey");
        log.debug(`rooms (set on Server): %o`, surveyRooms);
        log.debug(
          `authenticating player socket - ID "${
            socket.id
          }". Searching for room ${roomNo} in room list %O`,
          surveyRooms
        );

        if (surveyRooms[roomNo]) {
          socket.authenticated = true;

          // create user
          log.debug("Creating player record for player: %o", data);
          const userInfo = await new UserService().processPlayerRegistration(data);
          userInfo.pin = data.pin; // the survey pin. Not part of player record, so, not set in 'processPlayerRegistration'

          socket.user = userInfo;
          log.debug(
            `authenticated player socket - ID "${socket.id}" (${userInfo.firstname} ${
              userInfo.lastname
            })`
          );

          // Join the room playing the game
          joinRoom(socket, roomNo, "survey");

          // tell client auth is OK, hand it the user info
          socket.emit("auth-success", userInfo);
          // Tell admin someone just connected
          tellAdminThatSomeoneJustJoined(surveyAdminIO, surveyPlayerIO, userInfo, roomNo);
          log.debug(
            `authenticated OK forplayer socket - ID "${socket.id}". Admin informed of new arrival`
          );
        } else {
          log.debug(
            `Auth failure - invalid PIN from player socket - ID "${
              socket.id
            }. Disconnecting socket..."`
          );
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
        // surveyAdminIO.in(getSurveyRoomNo(data.pin))
        surveyAdminIO.emit("player-sumbitted-answer", {
          surveyQuestionId: data.surveyQuestionId,
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
      if (socket.roomNo) leaveRoom(socket, "survey");

      surveyAdminIO.emit("someone-just-left", socket.user);
      log.debug("user %s: $o disconnected", socket.id, socket.user);
    });

    socket.on("error", error => {
      console.log(`From server /surveyplayer. An error occurred`);
      console.log(error);
    });
  });
}

module.exports = {
  setupQuizSockets,
  setupSurveySockets
};
