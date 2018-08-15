function loadNextQuestion(e, game) {
  e.preventDefault();
  const gameRunInfo = getGameRunInfo(game);
  const answeredQuestionIds = GameAdminData["answeredquestionlist"];
  socket.emit("get-next-question", gameRunInfo, answeredQuestionIds, callbackOnGameAdminError);
}

/* Socket Stuffs */

function authenticateGameAdmin(pin, totalQuestions, game) {
  // Server sends this info on successful login, as a JSON: { token: ..., user: {...} }
  // I'm assuming you saved it somewhere in local storage, with key: userInfo.
  const userInfo = getUserInfo();
  const auth = { pin: pin, totalQuestions: totalQuestions, userInfo: userInfo };
  console.log("sending auth data for auth. data: ");
  console.log(auth);
  socket.emit("authenticate", auth, error => {
    alert(error);
  });
}

/**
 *
 * @param {*} socket
 * @param {*} reason
 * @param {*} game 'quiz' or 'survey'
 */
function onAdminDisconnected(socket, reason, game) {
  clearAdminGameStorages(game);
  if (reason === "io server disconnect") {
    // the disconnection was initiated by the server, you need to reconnect manually
    alert(
      "Server disconnected you do to authentication failure. We'll try reconnecting. If you're not reconnected, refresh the page to start over."
    );
    socket.connect();
  }
  // else the socket will automatically try to reconnect
}
