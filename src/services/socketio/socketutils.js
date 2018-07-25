import { validateInteger, RequestError } from "../../utils/ValidationErrors";
import log from "../../utils/log";
import { UserService, QuizRunService, SurveyRunService } from "../";

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

function closeSocketsInRoom(rooms, roomNo) {
  // finally
  // delete rooms[roomNo];
}

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
 * Socket from a moderaturending the game. This method removes the room
 * @param {*} socket
 * @param {*} pin
 * @param {*} recordType 'quiz' or 'survey'
 */
function destroyRoom(socket, pin, recordType) {
  const roomNo = getRoomNo(pin, recordType);
  if (recordType === "quiz") {
    closeSocketsInRoom(quizRooms, roomNo);
  } else {
    closeSocketsInRoom(surveyRooms, roomNo);
  }
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
  // if (recordType === "quiz") {
  //   if (quizRooms[roomNo]) {
  //     const index = quizRooms[roomNo].findIndex(item => item.socketId === socket.id);
  //     if (index !== -1) quizRooms[roomNo].splice(index, 1);
  //   }
  // } else {
  //   if (surveyRooms[roomNo]) {
  //     const index = surveyRooms[roomNo].indexOf(socket.id);
  //     if (index !== -1) surveyRooms[roomNo].splice(index, 1);
  //   }
  // }
  log.debug("Player socket %s left %s room %s", socket.id, recordType, roomNo);

  return roomNo;
}

/**
 *
 * @param {*} adminIO
 * @param {*} playerIO
 * @param {*} userInfo { pin: pin, ...userInfo }
 * @param {*} roomNo
 */
export function tellAdminThatSomeoneJustJoined(adminIO, playerIO, userInfo, roomNo) {
  try {
    //log.debug("Players in room %s: %O", roomNo, playerIO.in(roomNo).sockets);
    const totalPlayers = Object.keys(playerIO.in(roomNo).sockets).length;
    // log.debug("Players in the game at the moment: ");
    // Object.keys(playerIO.in(roomNo).sockets).forEach(key => {
    //   log.debug("%s - %o", key, playerIO.in(roomNo).sockets[key].user);
    // });
    const payload = {
      nPlayers: totalPlayers,
      newPlayer: userInfo
    };
    log.debug(
      "Informing admin that %o just joined room %s. Total players now: %s",
      payload.newPlayer,
      roomNo,
      totalPlayers
    );
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
    // Send player the PIN [pin]
    playerIO.emit(`get-${recordType}run-info`, { pin: data.pin });
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
 * @param {*} playerIO
 * @param {*} adminIO
 * @param {*} recordType 'quiz' or 'survey'
 * @param {*} onError callback from client on error occurring
 */
export async function authenticateGamePlayer(data, socket, playerIO, adminIO, recordType, onError) {
  try {
    if (!data.pin) throw new RequestError("No game code received.");

    //const token = data.token
    const roomNo = getRoomNo(data.pin, recordType);
    log.debug(
      "authenticating player socket - ID %s. Searching for room %s in room list",
      socket.id,
      roomNo
    );
    const rooms = Object.keys(adminIO.adapter.rooms);
    // Note that we're checking room in adminIO, not playerIO.
    // This is how it's supposed to be, since we created the room at the admin first.

    const roomExists = rooms.indexOf(roomNo) >= 0; // recordType === "quiz" ? quizRooms[roomNo] : surveyRooms[roomNo];
    if (roomExists) {
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
        throw new RequestError(
          "No cheating. You can't play in a game that you're also the moderator"
        );
      }

      // create user
      log.debug("Creating player record for player: %o", data);
      const userInfo = await userService.processPlayerRegistration(data);

      userInfo.pin = data.pin; // the quiz pin. Not part of player record, so, not set in 'processPlayerRegistration'

      socket.user = userInfo;
      log.debug(
        "authenticated player socket - ID %s (%s %s)",
        socket.id,
        userInfo.firstname,
        userInfo.lastname
      );

      // Join the room playing the game
      joinRoom(socket, data.pin, recordType);

      socket.authenticated = true;

      const moderatorInfo = {
        i: moderator.id,
        f: moderator.firstname,
        l: moderator.lastname,
        r: moderator.roles,
        u: moderator.username,
        p: moderator.phone,
        e: moderator.email
      };
      // tell client auth is OK, hand it the user info and the moderator info
      socket.emit("auth-success", {
        userInfo: userInfo,
        moderator: moderatorInfo,
        totalQuestions: gameRunInfo.totalQuestions
      });
      // Tell admin someone just connected
      tellAdminThatSomeoneJustJoined(adminIO, playerIO, userInfo, roomNo);
      log.debug(
        "authenticated OK for player socket - ID %s. Admin informed of new arrival",
        socket.id
      );
    } else {
      log.debug(
        "Auth failure - invalid game code from player socket - ID %s. Disconnecting socket...",
        socket.id
      );
      if (onError) {
        onError("Invalid game code. Failed to authenticate.");
      }
      socket.disconnect(true); // I may remove this if client can't see that auth failed.
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
    if (question) {
      question.Number = !answeredQuestionIds ? 1 : answeredQuestionIds.length + 1;
    }
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
