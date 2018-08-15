/**
 *
 * @param {*} recordType 'quiz' or 'survey'
 */
function setupGeneralChannel(recordType) {
  channel = pusher.subscribe(`${recordType}-player`);

  channel.bind(`get-${recordType}run-info`, onGetPlayerGameRunInfo);

  channel.bind("error", callbackOnGamePlayerError);

  channel.bind("disconnect", function(reason) {
    onPlayerDisconnect(reason, recordType);
  });
}

/**
 * playerInfo = {
        pin: pin,
        username: username,
        lastname: lastname,
        firstname: firstname,
        email: email,
        phone: phone
    };
 * @param {*} playerInfo 
 * @param {*} recordType 'quiz' or 'survey'
 */
function onGetPlayPin(playerInfo, recordType) {
  $.ajax({
    type: "POST",
    url: `/api/user/${recordType}runs/authplayer`,
    data: playerInfo,
    error: function(error) {
      alert(JSON.stringify(error));
    },
    success: function(gameInfo) {
      localStorage.setItem("token", gameInfo.token);
      gameChannel = pusher.subscribe(`${recordType}player-${gameInfo.userInfo.pin}`);
      gameChannel.bind("receive-next-question", onPlayerReceiveNextQuestion);

      onAuthSuccess(gameInfo, recordType);
    }
  });
}

function onPlayerDisconnect(reason, recordType) {
  console.log(recordType + " onPlayerDisconnect: reason - " + reason);
  GamePlayerData[recordType + "PlayerInfo"] = undefined;
  GamePlayerData[recordType + "question"] = undefined;
  GamePlayerData["moderator"] = undefined;
  // See https://github.com/socketio/socket.io-client/blob/HEAD/docs/API.md#socketdisconnect
  if (reason === "io server disconnect") {
    // the disconnection was initiated by the server. If you need to reconnect manually, call
    // socket.connect();
    alert("Disconnected from server. Refresh page to start afresh and reconnect.");
  }
  // else the socket will automatically try to reconnect
  //TODO: Tell admin that someone just disconnected
}

/**
 * Submit answer to a quiz question via socket.
 * Package the answerInfo object and pass it to this method. Do this when client clicks on an answer button.
 * answerInfo should be a JSON with these keys:
 * { timeCount: 2, choice: 1 }
 * @param {*} answerInfo
 */
function submitAnswer(answerToSubmit, game) {
  $.ajax({
    type: "POST",
    url: `/api/user/${game}runs/submitanswer`,
    data: answerToSubmit,
    beforeSend: setAuthToken,
    error: function(error) {
      console.log(error);
      alert(error);
    },
    success: function(feedback) {
      console.log(feedback);
      // If all went well, 'feedback' will just be a string saying "Submitted".
      //TODO: You decide. You can clear input fields or reset data used for the just-submitted question.
      GamePlayerData[`${game}question`] = undefined;
    }
  });
}
