// Sample client code for survey player
// Add this:
// <script src="/socket.io/socket.io.js"></script>
// to the page BEFORE importing this js file. That's where io is defined.

const socket = io("/surveyplayer");

function onReceiveNextQuestion(question) {
  setSurveyQuestionsOnPage(question);
  localStorage.setItem("surveyquestion", JSON.stringify(question));
}

function onAnswerSubmitted(feedback) {
  feedbackOnSurveyAnswerSubmitted(feedback);
  localStorage.removeItem("surveyquestion");
}

function onGetSurveyPin(pin) {
  const userInfo = getUserInfo();
  const auth = { pin: pin, userInfo: userInfo };

  // Set the PIN somewhere the player can see it.
  localStorage.setItem("surveypin", pin);

  socket.emit("authenticate", auth, error => {
    alert(error);
  });
}

function onDisconnect(reason) {
  // Tell admin that someone just disconnected
  io.of("/surveyadmin").emit("someone-just-left", socket.id, callbackOnSurveyError);
  localStorage.removeItem("surveypin");
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
 *
 * @param {*} answerInfo { timeCount: <integer>, choice: <integer> }
 */
function submitAnswer(answerInfo) {
  const pin = localStorage.getItem("surveypin");
  const quizquestion = JSON.parse(localStorage.getItem("surveyquestion"));
  const userInfo = getUserInfo();
  const userId = userInfo.i;
  const answerToSubmit = {
    pin: pin,
    quizId: quizQuestionId.quizId,
    quizQuestionId: quizquestion.id,
    points: quizquestion.points,
    userId: userId
  };
  const isCorrect = false;
  answerToSubmit.bonus = getBonus(
    quizquestion.maxBonus,
    quizquestion.timeLimit,
    answerInfo.timeCount,
    isCorrect
  );
  socket.emit("submit-answer", answerToSubmit, callbackOnSurveyError);
}

/**
 * Calculate the bonus score to award player when answer is correct.
 * @param {*} maxBonus Max bonus to be awarded a player for answering correctly.
 * @param {*} maxTimeCount Max time count alloted to question. It's usually in seconds.
 * @param {*} timeCount Time count when player submitted an answer. We assume count goes from 0mto maxTimeCount.
 * @param {*} answeredCorrectly True if player answered correctly. False otherwise.
 */
function getBonus(maxBonus, maxTimeCount, timeCount, answeredCorrectly = true) {
  if (!answeredCorrectly) return 0;
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
  return bonus;
}

socket.on("receive-next-question", onReceiveNextQuestion);

socket.on("answer-submitted", onAnswerSubmitted);

socket.on("get-survey-pin", onGetSurveyPin);

socket.on("error", callbackOnSurveyError);

socket.on("disconnect", onDisconnect);
