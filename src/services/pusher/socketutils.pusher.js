import { validateInteger, RequestError } from "../../utils/ValidationErrors";
import log from "../../utils/log";
import { UserService, QuizRunService, SurveyRunService } from "../";
import { sign } from "jsonwebtoken";
import pusher from "./pusher-setup";

log.setNamespace("socketutils");

export const quizRooms = {};
export const surveyRooms = {};

function addToRoom(rooms, roomNo, item) {
  if (rooms[roomNo]) {
    rooms[roomNo].push(item);
  } else {
    rooms[roomNo] = [item];
  }
}

/**
 *
 * @param {*} socket
 * @param {*} pin
 * @param {*} recordType 'quiz' or 'survey'
 */
function joinRoom(socket, pin, recordType) {
  const roomNo = getRoomNo(pin, recordType);
  socket.roomNo = roomNo;
  socket.join(roomNo);

  const socketDataForRoom = {
    socketId: socket.id,
    userId: socket.user.i,
    username: socket.user.u,
    isAdmin: socket.user.isAdmin
  };
  // if (recordType === "quiz") {
  //   addToRoom(quizRooms, roomNo, socketDataForRoom);
  // } else {
  //   addToRoom(surveyRooms, roomNo, socketDataForRoom);
  // }
  log.debug(
    "Player socket %s [%o] joined %s room %s",
    socket.id,
    socketDataForRoom,
    recordType,
    roomNo
  );
  //log.debug("%s room: %O", recordType, recordType === "quiz" ? quizRooms : surveyRooms);
  return roomNo;
}

/**
 *
 * @param {*} socket
 * @param {*} recordType 'quiz' or 'survey'
 */
function leaveRoom(socket, recordType) {
  log.debug("Player socket %o leaving room...", {
    id: socket.id,
    roomNo: socket.roomNo,
    user: socket.user
  });
  const roomNo = socket.roomNo;
  try {
    socket.leave(roomNo);
  } catch (e) {
    log.debug(
      "Non-show-stopping error when Player socket %s tried to leave %s room %s. %O",
      socket.id,
      recordType,
      roomNo,
      e
    );
  }

  log.debug("Player socket %s left %s room %s", socket.id, recordType, roomNo);

  return roomNo;
}

/**
 *
 * @param {*} userInfo { pin: pin, ...userInfo }
 * @param {*} recordType
 */
function tellAdminThatSomeoneJustJoined(userInfo, recordType) {
  // query players channel
  const playerChannel = `${recordType}player-${userInfo.pin}`;
  log.debug("Querying pusher for num of subscriptions in %s", playerChannel);
  pusher.get(
    { path: `/channels/${playerChannel}`, params: { info: "subscription_count" } },
    function(error, request, response) {
      if (response.statusCode === 200) {
        const result = JSON.parse(response.body);
        const totalPlayers = result.subscription_count;
        const payload = {
          nPlayers: totalPlayers,
          newPlayer: userInfo
        };
        log.debug(
          "Informing admin that %o just joined channel %s. Total players now: %s",
          payload.newPlayer,
          playerChannel,
          totalPlayers
        );
        const adminChannel = `${recordType}admin-${userInfo.pin}`;
        pusher.trigger(adminChannel, "when-someone-just-joined", payload);
      }
    }
  );
}

export function validateAnswerProps(data, recordType) {
  const id = `${recordType}Id`;
  validateInteger(data[id], id, true);
  const qnid = `${recordType}QuestionId`;
  validateInteger(data[qnid], qnid, true);
  validateInteger(data.userId, "userId", true);
  if (recordType === "quiz") {
    validateInteger(data.points, "points");
    validateInteger(data.bonus, "bonus");
    data.correct = data.correct === "true";
  }
}

/**
 *
 * @param {*} pin
 * @param {*} recordType 'quiz' or 'survey'
 */
export function getRoomNo(pin, recordType) {
  return `${recordType}-${pin}`;
}

/**
 *
 * @param {*} data  data = { pin: pin, totalQuestions: totalQuestions, userInfo: userInfo }; // userInfo as provided during login
 * @param {*} recordType 'quiz' or 'survey'
 */
export async function authenticateGameAdmin(data, recordType) {
  // data.userInfo eg. = {i: 1, u: "djt", f: "Donald", l: "Trump", r: "Super Admin"}
  if (!data || !data.userInfo || !data.userInfo.i)
    throw new RequestError(
      "Invalid user trying to authenticate. Try logging out and logging in again before proceeding."
    );

  if (!data.pin) throw new RequestError("No game code received.");

  const user = await new UserService().getById(data.userInfo.i);
  if (!user) throw new RequestError("User info does not match any existing record.");

  data.userInfo.e = user.email;
  data.userInfo.p = user.phone;
  data.userInfo.isAdmin = true;

  //TODO: figure out how to attach this user object to the admin socket connection.

  // Send player the PIN [pin]
  pusher.trigger("quiz-player", `get-${recordType}run-info`, { pin: data.pin });
}

/**
 *
 * @param {*} data  data = {
    //   pin: pin,
    //     username: username,
    //       lastname: lastname,
    //         firstname: firstname,
    //           email: email,
    //             phone: phone
    // };
 * @param {*} socket The player socket
 * @param {*} playerIO
 * @param {*} adminIO
 * @param {*} recordType 'quiz' or 'survey'
 * @param {*} onError callback from client on error occurring
 */
export async function authenticateGamePlayer(data, recordType) {
  if (!data.pin) throw new RequestError("No game code received.");
  let gameRunInfo =
    recordType === "quiz"
      ? await new QuizRunService().getFirst({ pin: data.pin })
      : await new SurveyRunService().getFirst({ pin: data.pin });
  if (!gameRunInfo)
    throw new RequestError(
      "Game code does not exist yet. You may need to wait till the moderator starts the game."
    ); // this should never happen.

  if (!gameRunInfo.moderatorId)
    throw new RequestError("Contact moderator to start the game afresh with new game code.");

  const userService = new UserService();

  const moderator = await userService.getById(gameRunInfo.moderatorId);
  if (!moderator)
    throw new RequestError(
      "Moderator info not found. Contact moderator to start the game afresh with new game code."
    );

  if (
    (data.phone && moderator.p === data.phone) ||
    (data.email && moderator.e === data.email) ||
    (data.username && moderator.u === data.username)
  ) {
    throw new RequestError("No cheating. You can't play in a game that you're also the moderator");
  }
  log.debug("Creating player record for player: %o", data);
  const userInfo = await userService.processPlayerRegistration(data);

  userInfo.pin = data.pin; // the quiz pin. Not part of player record, so, not set in 'processPlayerRegistration'

  // socket.user = userInfo;
  // log.debug(
  //   "authenticated player socket - ID %s (%s %s)",
  //   socket.id,
  //   userInfo.firstname,
  //   userInfo.lastname
  // );

  // // Join the room playing the game
  // joinRoom(socket, data.pin, recordType);

  // socket.authenticated = true;

  // Tell admin someone just connected
  tellAdminThatSomeoneJustJoined(userInfo, recordType);
  log.debug(
    "authenticated OK for player socket - ID %s. Admin informed of new arrival",
    "[socket-id]"
  );

  // tell client auth is OK, hand it the user info and the moderator info
  const token = sign(userInfo, process.env.APP_SECRET, {
    expiresIn: "3h"
  });
  const moderatorInfo = {
    i: moderator.id,
    f: moderator.firstname,
    l: moderator.lastname,
    r: moderator.roles,
    u: moderator.username,
    p: moderator.phone,
    e: moderator.email
  };

  return {
    token: token,
    userInfo: userInfo,
    moderator: moderatorInfo,
    totalQuestions: gameRunInfo.totalQuestions
  };
}

export async function onPlayerSubmitAnswer(data, answerService, recordType) {
  validateAnswerProps(data, recordType);
  await answerService.save(data);
  // Tell admin that someone just submitted answer
  pusher.trigger(`${recordType}admin-${data.pin}`, "player-sumbitted-answer", {
    questionId: data[`${recordType}QuestionId`],
    choice: data.choice
  });
  return "Submitted";
}

export function onPlayerDisconnect(socket, adminIO, recordType) {
  // if (socket.roomNo) leaveRoom(socket, recordType);
  // adminIO.emit("someone-just-left", socket.user);
  // log.debug("user %s: $o disconnected", socket.id, socket.user);
}

/**
 *
 * @param {*} data
 * @param {*} questionService
 * @param {*} recordType 'quiz' or 'survey'
 */
export async function getQuestion(data, questionService, recordType) {
  // data: {
  //   gameRunInfo: gameRunInfo,
  //   answeredQuestionIds: answeredQuestionIds
  // }
  const answeredQuestionIds = data.answeredQuestionIds;
  log.debug(`%s admin socket.on("get-next-question" called. data = %o`, recordType, data);
  const question = await questionService.getOneUnansweredQuestion(
    data.gameRunInfo.gameId,
    answeredQuestionIds
  );
  if (question) {
    question.Number = !answeredQuestionIds ? 1 : answeredQuestionIds.length + 1;
    question.recordType = recordType;
  }
  // send question to both moderators and players
  //NB: We could have sent to players by socket and to this admin as HTTP POST result;
  // but since we can't guarantee they will arrive at (about) the same time, we send everything
  // through sockets.
  log.debug(`send %s question to both moderators and players. data = %o`, recordType, question);

  pusher.trigger(
    [`${recordType}admin-${data.gameRunInfo.pin}`, `${recordType}player-${data.gameRunInfo.pin}`],
    "receive-next-question",
    question
  );
}
