import { validateInteger } from "../utils/ValidationErrors";
import log from "../utils/log";

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
  if (recordType === "quiz") {
    const members = quizRooms[roomNo];
    if (members) {
      quizRooms[roomNo].push(socket.id);
    } else {
      quizRooms[roomNo] = [socket.id];
    }
  } else {
    const members = surveyRooms[roomNo];
    if (members) {
      surveyRooms[roomNo].push(socket.id);
    } else {
      surveyRooms[roomNo] = [socket.id];
    }
  }
  log.debug("Player socket %s [%o] joined %s room %s", socket.id, socket.user, recordType, roomNo);

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
    const members = quizRooms[roomNo];
    if (members) {
      const index = quizRooms[roomNo].indexOf(socket.id);
      if (index !== -1) quizRooms[roomNo].splice(index, 1);
    }
  } else {
    const members = surveyRooms[roomNo];
    if (members) {
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
    const room = recordType === "quiz" ? quizRooms[roomNo] : surveyRooms[roomNo];
    const totalPlayers = room.length - 1; // minus the moderator
    const topFive = room.slice(1, 6);
    const payload = {
      nPlayers: totalPlayers,
      topFive: topFive,
      newPlayer: data.userInfo,
      pin: data.pin
    };
    adminIO.in(roomNo).emit("when-someone-just-joined", payload);
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
 * @param {*} data  data = { pin: pin, userInfo: userInfo }; // userInfo as provided during login
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
 * @param {*} socket The admin socket
 * @param {*} adminIO
 * @param {*} playerIO
 * @param {*} recordType 'quiz' or 'survey'
 * @param {*} onError callback from client on error occurring
 */
export async function authenticateGamePlayer(data, socket, adminIO, playerIO, recordType, onError) {
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
      joinRoom(socket, roomNo, recordType);

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
