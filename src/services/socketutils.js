import { validateInteger, RequestError } from "../utils/ValidationErrors";
import log from "../utils/log";
import { UserService } from "./";

log.setNamespace("socketutils");

export const quizRooms = {};
export const surveyRooms = {};

/**
 *
 * @param {*} socket
 * @param {*} pin
 * @param {*} recordType 'quiz' or 'survey'
 */
export function joinRoom(socket, pin, recordType) {
  const roomNo = getRoomNo(pin, recordType);
  socket.roomNo = roomNo;
  socket.join(roomNo);

  const socketDataForRoom = {
    socketId: socket.id,
    userId: socket.user.i,
    username: socket.user.u,
    isAdmin: socket.user.isAdmin
  };
  if (recordType === "quiz") {
    const members = quizRooms[roomNo];
    if (members) {
      quizRooms[roomNo].push(socketDataForRoom);
    } else {
      quizRooms[roomNo] = [socketDataForRoom];
    }
  } else {
    const members = surveyRooms[roomNo];
    if (members) {
      surveyRooms[roomNo].push(socketDataForRoom);
    } else {
      surveyRooms[roomNo] = [socketDataForRoom];
    }
  }
  log.debug(
    "Player socket %s [%o] joined %s room %s",
    socket.id,
    socketDataForRoom,
    recordType,
    roomNo
  );
  log.debug("%s room: %O", recordType, recordType === "quiz" ? quizRooms : surveyRooms);
  return roomNo;
}

/**
 *
 * @param {*} socket
 * @param {*} recordType 'quiz' or 'survey'
 */
export function leaveRoom(socket, recordType) {
  log.debug("Player socket %o leaving room...", {
    id: socket.id,
    roomNo: socket.roomNo,
    user: socket.user
  });
  const roomNo = socket.roomNo;
  socket.leave(roomNo);
  if (recordType === "quiz") {
    if (quizRooms[roomNo]) {
      const index = quizRooms[roomNo].findIndex(item => item.socketId === socket.id);
      if (index !== -1) quizRooms[roomNo].splice(index, 1);
    }
  } else {
    if (surveyRooms[roomNo]) {
      const index = surveyRooms[roomNo].indexOf(socket.id);
      if (index !== -1) surveyRooms[roomNo].splice(index, 1);
    }
  }
  log.debug("Player socket %s left %s room %s", socket.id, recordType, roomNo);

  return roomNo;
}

/**
 *
 * @param {*} adminIO
 * @param {*} data { pin: pin, userInfo: userInfo }
 * @param {*} roomNo
 * @param {*} recordType 'quiz' or 'survey'
 */
export function tellAdminThatSomeoneJustJoined(adminIO, data, roomNo, recordType) {
  try {
    let room = recordType === "quiz" ? quizRooms[roomNo] : surveyRooms[roomNo];
    room = room.filter(item => !item.isAdmin);
    const totalPlayers = room.length; // minus the moderator
    const topFive = room.slice(0, 5);
    const payload = {
      nPlayers: totalPlayers,
      topFive: topFive,
      newPlayer: data.userInfo,
      pin: data.pin
    };
    adminIO.emit("when-someone-just-joined", payload);
  } catch (e) {
    log.error(
      "Server Socket: Error on 'someone-just-joined' for socket %o: %s",
      userInfo,
      e.message
    );
  }
}

export function validateQuizAnswerProps(data) {
  validateInteger(data.quizId, "quizId", true);
  validateInteger(data.quizQuestionId, "quizQuestionId", true);
  validateInteger(data.points, "points");
  validateInteger(data.userId, "userId", true);
  validateInteger(data.bonus, "bonus");
}

export function validateSurveyAnswerProps(data) {
  validateInteger(data.surveyId, "surveyId", true);
  validateInteger(data.surveyQuestionId, "surveyQuestionId", true);
  validateInteger(data.userId, "userId", true);
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
 * @param {*} socket The admin socket
 * @param {*} playerIO
 * @param {*} recordType 'quiz' or 'survey'
 * @param {*} onError callback from client on error occurring
 */
export async function authenticateGameAdmin(data, socket, playerIO, recordType, onError) {
  try {
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
    socket.user = data.userInfo;

    const roomNo = joinRoom(socket, data.pin, recordType);
    socket.authenticated = true;

    log.debug(
      `authenticated admin socket %s and added it to %s room %s`,
      socket.id,
      recordType,
      roomNo
    );
    playerIO.emit(`get-${recordType}run-info`, data);
  } catch (e) {
    log.error(
      "Server Socket: Error on %s 'authenticate' for socket %s: %s",
      recordType,
      socket.id,
      e.message
    );
    if (onError) {
      onError(e.message);
    }
  }
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
 * @param {*} adminIO
 * @param {*} recordType 'quiz' or 'survey'
 * @param {*} onError callback from client on error occurring
 */
export async function authenticateGamePlayer(data, socket, adminIO, recordType, onError) {
  try {
    if (!data.pin) throw new RequestError("No game code received.");

    //const token = data.token
    const roomNo = getRoomNo(data.pin, recordType);
    log.debug(
      `authenticating player socket - ID "${socket.id}". Searching for room ${roomNo} in room list`
    );

    const room = recordType === "quiz" ? quizRooms[roomNo] : surveyRooms[roomNo];
    if (room) {
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
      joinRoom(socket, data.pin, recordType);

      socket.authenticated = true;

      // tell client auth is OK, hand it the user info
      socket.emit("auth-success", userInfo);
      // Tell admin someone just connected
      tellAdminThatSomeoneJustJoined(adminIO, userInfo, roomNo, recordType);
      log.debug(
        `authenticated OK for player socket - ID "${socket.id}". Admin informed of new arrival`
      );
    } else {
      log.debug(
        `Auth failure - invalid PIN from player socket - ID "${socket.id}. Disconnecting socket..."`
      );
      socket.disconnect(true);
      if (onError) {
        onError("Invalid credentials. Failed to authenticate.");
      }
    }
  } catch (e) {
    log.error(
      "Server Socket: Error on %s 'authenticate' for socket %s: %s",
      recordType,
      socket.id,
      e.message
    );
    if (onError) {
      onError(e.message);
    }
  }
}

export function onPlayerDisconnect(socket, adminIO, recordType) {
  if (socket.roomNo) leaveRoom(socket, recordType);

  adminIO.emit("someone-just-left", socket.user);
  log.debug("user %s: $o disconnected", socket.id, socket.user);
}

/**
 *
 * @param {*} socket The admin socket
 * @param {*} data
 * @param {*} answeredQuestionIds
 * @param {*} playerIO
 * @param {*} recordType 'quiz' or 'survey'
 * @param {*} onError callback from client on error occurring
 */
export async function getQuestion(
  socket,
  data,
  answeredQuestionIds,
  playerIO,
  questionService,
  recordType,
  onError
) {
  try {
    log.debug(`%s admin socket.on("get-next-question" called. data = %o`, recordType, data);
    const question = await questionService.getOneUnansweredQuestion(
      data.gameId,
      answeredQuestionIds
    );
    // send question to both moderators and players
    log.debug(`send %s question to both moderators and players. data = %o`, recordType, question);
    socket.emit("receive-next-question", question, recordType);
    // TODO: Look into this issue of not broadcasting to room.
    // const roomNo = getRoomNo(data.pin, recordType);
    // playerIO.in(roomNo).emit("receive-next-question", question, recordType);
    playerIO.emit("receive-next-question", question, recordType);
  } catch (e) {
    log.error(
      "Server Socket: %s Error on 'get-next-question' for socket %s: %s",
      recordType,
      socket.id,
      e.message
    );
    if (onError) {
      onError(e.message);
    }
  }
}
