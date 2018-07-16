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
  validateSurveyAnswerProps,
  validateQuizAnswerProps,
  getRoomNo,
  onPlayerDisconnect,
  getQuestion,
  authenticateGameAdmin,
  authenticateGamePlayer
} from "./socketutils";
import log from "../utils/log";
import { RequestError } from "../utils/ValidationErrors";

function setupQuizSockets(io) {
  const quizAdminIO = io.of("/quizadmin");
  const quizPlayerIO = io.of("/quizplayer");

  quizAdminIO.on("connection", function(socket) {
    socket.authenticated = false;

    //  data = { pin: pin, userInfo: userInfo }; // userInfo as provided during login
    socket.on("authenticate", async (data, onError) => {
      await authenticateGameAdmin(data, socket, quizPlayerIO, "quiz", onError);
    });

    // data = { quizRunId: 2, pin: pin, quizId: 3 }
    socket.on("get-next-question", async (data, answeredQuestionIds, onError) => {
      await getQuestion(
        socket,
        data,
        answeredQuestionIds,
        quizPlayerIO,
        new QuizQuestionService(),
        "quiz",
        onError
      );
    });

    socket.on("end-game", data => {
      try {
        const roomNo = getRoomNo(data.pin, "quiz");
        // Object.keys(quizPlayerIO.sockets.sockets).forEach(function(s) {
        //   quizPlayerIO.sockets.sockets[s].disconnect(true);
        // });
      } catch (e) {}
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

    socket.on("authenticate", async (data, onError) => {
      await authenticateGamePlayer(data, socket, quizPlayerIO, quizAdminIO, "quiz", onError);
    });

    // { pin: 'w323', userId: 3, quizQuestionId: 2, choice: 1, correct: true, bonus: 4, points: 12 }
    socket.on("submit-answer", async (data, onError) => {
      try {
        validateQuizAnswerProps(data);
        await new QuizAnswerService().save(data);
        // quizAdminIO.in(getQuizRoomNo(data.pin))
        quizAdminIO.emit("player-sumbitted-answer", {
          questionId: data.quizQuestionId,
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
      onPlayerDisconnect(socket, quizAdminIO, "quiz");
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
    socket.on("authenticate", async (data, onError) => {
      await authenticateGameAdmin(data, socket, surveyPlayerIO, "survey", onError);
    });

    // data = { surveyRunId: 2, pin: pin, surveyId: 3 }
    socket.on("get-next-question", async (data, answeredQuestionIds, onError) => {
      await getQuestion(
        socket,
        data,
        answeredQuestionIds,
        surveyPlayerIO,
        new SurveyQuestionService(),
        "survey",
        onError
      );
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

    socket.on("authenticate", async (data, onError) => {
      await authenticateGamePlayer(data, socket, surveyPlayerIO, surveyAdminIO, "survey", onError);
    });

    // { pin: 'w323', userId: 3, surveyQuestionId: 2, choice: 1, correct: true, bonus: 4, points: 12 }
    socket.on("submit-answer", async (data, onError) => {
      try {
        validateSurveyAnswerProps(data);
        await new SurveyAnswerService().save(data);
        // surveyAdminIO.in(getSurveyRoomNo(data.pin))
        surveyAdminIO.emit("player-sumbitted-answer", {
          questionId: data.surveyQuestionId,
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
      onPlayerDisconnect(socket, surveyAdminIO, "survey");
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
