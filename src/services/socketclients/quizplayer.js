// Sample client code for game player
// Add this:
// <script src="/socket.io/socket.io.js"></script>
// to the page BEFORE importing this js file. That's where io is defined.

import io from "socket.io-client";
const socket = io("/quizplayer");

function onReceiveNextQuestion(question) {
  //TODO: This is a question object as defined in the API doc.
  // Render fields on a page as you would like it. Depending, you may,
  // want to only render the answers. Whatever!
  localStorage.setItem("quizquestion", JSON.stringify(question));
}

function onAnswerSubmitted(feedback) {
  // If all went well, 'feedback' will just be a string saying "Submitted".
  //TODO: You decide. You can clear input fields or reset data used for the just-submitted question.
  localStorage.removeItem("quizquestion");
  console.log(feedback);
}

function onGetQuizPin(pin) {
  const userInfo = getUserInfo();
  const auth = { pin: pin, userInfo: userInfo };

  // Set the PIN somewhere the player can see it.
  localStorage.setItem("quizpin", pin);

  socket.emit("authenticate", auth, error => {
    alert(error);
  });
}

function onDisconnect(reason) {
  // Tell admin that someone just disconnected
  io.of("/quizadmin").emit("someone-just-left", socket.id, callbackOnQuizPlayerError);
  localStorage.removeItem("quizpin");
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
  const pin = localStorage.getItem("quizpin");
  const quizquestion = JSON.parse(localStorage.getItem("quizquestion"));
  const isCorrect = quizquestion.correctOptions.indexOf(answerInfo.choice);
  //TODO: get the user info server sent you at login wherever you kept it.
  //const userInfo = localStorage.getItem("userInfo");
  const userId = userInfo.i;
  const answerToSubmit = {
    pin: pin,
    quizId: quizQuestionId.quizId,
    quizQuestionId: quizquestion.id,
    points: quizquestion.points,
    userId: userId,
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

socket.on("get-quiz-pin", onGetQuizPin);

socket.on("error", callbackOnQuizPlayerError);

socket.on("disconnect", onDisconnect);
