// Sample client code for game player
// Add this:
// <script src="/socket.io/socket.io.js"></script>
// to the page BEFORE importing this js file. That's where io is defined.

function onAnswerSubmitted(feedback) {
  console.log(feedback);
  // If all went well, 'feedback' will just be a string saying "Submitted".
  //TODO: You decide. You can clear input fields or reset data used for the just-submitted question.
  GamePlayerData["surveyquestion"] = undefined;
  refreshFieldsAfterAnswerIsSubmitted();
}

(function(glob) {
  glob.socket = io("/surveyplayer", getSocketOptions());
})(this); // 'this' will be 'window' or 'module' or ... depending on the client

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
 */
function onGetPlayPin(playerInfo) {
  socket.emit("authenticate", playerInfo, error => {
    alert(error);
    return false;
  });
}

/**
 * Calculate the bonus score to award player when answer is correct.
 * @param {*} maxBonus Max bonus to be awarded a player for answering correctly.
 * @param {*} maxTimeCount Max time count alloted to question. It's usually in seconds.
 * @param {*} timeCount Time count when player submitted an answer. We assume count goes from 0mto maxTimeCount.
 * @param {*} answeredCorrectly True if player answered correctly. False otherwise.
 */
function getBonus(maxBonus, maxTimeCount, timeCount, answeredCorrectly = true) {
  if (!answeredCorrectly || maxTimeCount < 1 || maxBonus < 1) return 0;
  /*
      Let max bonus be B, with values, b, going from 0 to B.
      Let max time count be T, with values, t, going from 0 to T.
      The rule is that as t increases, b decreases - such that
      when t = T, b = 0; and when t = 0, b = B.
  
      Now, for any arbitrary t, compute the value of b.
  
      The relation between them is given by:
      (t-0)/(T-0) = (b-B)/(0-B).
  
      Therefore, b = B(1 - t/T);
      */
  const bonus = maxBonus * (1 - timeCount / maxTimeCount);
  //TODO: bonus will often be a floating point number. Is it OK to convert to integer?
  // If yes, do we round it up or down, or do we use the normal math way?
  // Confirm with Project Manager.
  return Math.ceil(bonus);
}

// DO NOT change the signature of this method. It needs to be in sync with
// what is called in /general.player.js | 256 or thereabout
function submitAnswer(answerToSubmit, game) {
  socket.emit("submit-answer", answerToSubmit, callbackOnGamePlayerError);
}

socket.on("get-surveyrun-info", onGetPlayerGameRunInfo);

socket.on("error", callbackOnGamePlayerError);

socket.on("disconnect", function(reason) {
  onPlayerDisconnect(socket, reason, "survey");
});

socket.on("auth-success", function(gameInfo) {
  socket.on("receive-next-question", onPlayerReceiveNextQuestion);

  socket.on("answer-submitted", onAnswerSubmitted);

  onAuthSuccess(gameInfo, "survey");
});
