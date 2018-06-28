// Sample client code for game player
// Add this:
// <script src="/socket.io/socket.io.js"></script>
// to the page BEFORE importing this js file. That's where io is defined.

function onAnswerSubmitted(feedback) {
  console.log(feedback);
  // If all went well, 'feedback' will just be a string saying "Submitted".
  //TODO: You decide. You can clear input fields or reset data used for the just-submitted question.
  localStorage.removeItem("quizquestion");
  refreshFieldsAfterAnswerIsSubmitted();
}

const socket = io("/quizplayer", getSocketOptions());

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
 * playerInfo: {
 *  pin: xxx,
 *  id: userId,
 *  lastname: xxx,
 *  firstname: xxx,
 *  username: xxx
 * }
 * @param {*} playerInfo
 */
function onAuthSuccess(playerInfo) {
  // Show the view where user can answer the questions.
  console.log("onAuthSuccess called with feedback: ");
  console.log(playerInfo);

  localStorage.setItem("quizPlayerInfo", JSON.stringify(playerInfo));
  showAnswerQuizViewOnnAuthSuccess(playerInfo);
}

function onDisconnect(reason) {
  console.log("onDisconnect: reason - " + reason);
  localStorage.removeItem("quizPlayerInfo");
  localStorage.removeItem("quizquestion");
  // Tell admin that someone just disconnected
  // io.of("/quizadmin").emit("someone-just-left", socket.id, callbackOnQuizPlayerError);
  // localStorage.removeItem("quizpin");
  if (reason === "io server disconnect") {
    // the disconnection was initiated by the server, you need to reconnect manually
    socket.connect();
  }
  // else the socket will automatically try to reconnect
}

/**
 * Submit answer to a quiz question via socket.
 * TODO: package the answerInfo object and pass it to this method. Do this when client clicks on an answer button.
 * answerInfo should be a JSON with these keys:
 * { timeCount: 2, choice: 1 }
 * @param {*} answerInfo
 */
function submitAnswer(answerInfo) {
  const quizPlayerInfo = JSON.parse(localStorage.getItem("quizPlayerInfo"));
  const quizquestion = JSON.parse(localStorage.getItem("quizquestion"));
  const isCorrect = quizquestion.correctOptions.indexOf(answerInfo.choice);

  const answerToSubmit = {
    userId: quizPlayerInfo.id,
    pin: quizPlayerInfo.pin,
    quizId: quizquestion.quizId,
    quizQuestionId: quizquestion.id,
    points: quizquestion.points,
    choice: answerInfo.choice,
    correct: isCorrect
  };
  answerToSubmit.bonus = getBonus(
    quizquestion.maxBonus,
    quizquestion.timeLimit,
    answerInfo.timeCount,
    isCorrect
  );
  socket.emit("submit-answer", answerToSubmit, callbackOnQuizPlayerError);
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

socket.on("receive-next-question", onPlayerReceiveNextQuestion);

socket.on("answer-submitted", onAnswerSubmitted);

socket.on("get-quizrun-info", onGetPlayerGameRunInfo);

socket.on("error", callbackOnQuizPlayerError);

socket.on("disconnect", onDisconnect);

socket.on("auth-success", onAuthSuccess);
