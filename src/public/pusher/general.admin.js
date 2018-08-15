function loadNextQuestion(e, game) {
  e.preventDefault();

  const gameRunInfo = getGameRunInfo(game);
  const answeredQuestionIds = GameAdminData["answeredquestionlist"];
  $.ajax({
    beforeSend: setAuthToken,
    url: `/api/user/${game}runs/getnextquestion`,
    type: "POST",
    data: {
      gameRunInfo: gameRunInfo,
      answeredQuestionIds: answeredQuestionIds
    },
    error: callbackOnGameAdminError
  });
}

/* Socket Stuffs */

/**
 *
 * @param {*} socket
 * @param {*} reason
 * @param {*} game 'quiz' or 'survey'
 */
function onAdminDisconnected(reason, game) {
  clearAdminGameStorages(game);
  // if (reason === "io server disconnect") {
  //   // the disconnection was initiated by the server, you need to reconnect manually
  //   alert(
  //     "Server disconnected you do to authentication failure. We'll try reconnecting. If you're not reconnected, refresh the page to start over."
  //   );
  //   socket.connect();
  // }
  // else the socket will automatically try to reconnect
}

function setupGeneralChannel(game) {
  channel = pusher.subscribe(`${game}-admin`);

  channel.bind("error", callbackOnGameAdminError);

  channel.bind("disconnect", function(reason) {
    onAdminDisconnected(reason, game);
  });
}

/**
 * Call this function as soon as you can on page load.
 * The URL loading the page MUST pass pin via querystring, with key: 'pin'
 *
 * @param {*} pin
 * @param {*} totalQuestions
 * @param {*} game 'quiz' or 'survey'
 */
function authenticateGameAdmin(pin, totalQuestions, game) {
  // Server sends this info on successful login, as a JSON: { token: ..., user: {...} }
  // I'm assuming you saved it somewhere in local storage, with key: userInfo.
  const userInfo = getUserInfo();
  const auth = { pin: pin, totalQuestions: totalQuestions, userInfo: userInfo };
  console.log("sending auth data for auth. data: ");
  console.log(auth);
  $.ajax({
    type: "POST",
    url: `/api/user/${game}runs/authadmin`,
    data: auth,
    beforeSend: setAuthToken,
    error: function(error) {
      alert(error);
    },
    success: function(gameInfo) {
      console.log(`authenticateGameAdmin success. game = '${game}'. gameInfo = `);
      console.log(gameInfo);
      gameChannel = pusher.subscribe(`${game}admin-${pin}`);
      gameChannel.bind("receive-next-question", onReceiveNextQuestion);

      gameChannel.bind("player-sumbitted-answer", function(data) {
        onPlayerSubmittedAnswer(data, game);
      });

      gameChannel.bind("when-someone-just-joined", function(data) {
        onWhenSomeoneJustJoined(data, game);
      });

      gameChannel.bind("when-someone-just-left", function(data) {
        onWhenSomeoneJustLeft(data, game);
      });
    }
  });
}
