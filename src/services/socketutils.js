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
  log.debug("Player socket %s joined %s room %s", socket.id, recordType, roomNo);

  return roomNo;
}

/**
 *
 * @param {*} socket
 * @param {*} recordType 'quiz' or 'survey'
 */
export function leaveRoom(socket, recordType) {
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
 * @param {*} playerIO
 * @param {*} data { pin: pin, userInfo: userInfo }
 * @param {*} roomNo
 */
export function tellAdminThatSomeoneJustJoined(adminIO, playerIO, data, roomNo) {
  try {
    playerIO.in(roomNo).clients((err, clients) => {
      if (!err) {
        const nPlayers = clients.length;
        const topFive = clients.slice(0, 5);
        // Inform admin so she can display on UI
        const payload = {
          nPlayers: nPlayers,
          topFive: topFive,
          newPlayer: data.userInfo,
          pin: data.pin
        };
        adminIO.in(roomNo).emit("when-someone-just-joined", payload);
      } else {
        log.error(
          "Server Socket: Error on 'someone-just-joined' trying to get clients in room. Socket: %o: %s",
          userInfo,
          err.message
        );
      }
    });
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
