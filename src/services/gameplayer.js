// Sample client code for game player
// Add this:
// <script src="/socket.io/socket.io.js"></script>
// to the page BEFORE importing this js file. That's where io is defined.

const socket = io("/quizplayer");

function onReceiveNextQuestion(question) {
  // This is a question object as defined in the API doc.
  // Render fields as you would like it.Depending, you may,
  // want to only render the answers. Whatever!
}

function onAnswerSubmitted(feedback) {
  // If all went well, 'feedback' will just be a string saying "Submitted".
  //TODO: You decide. You can clear input fields or reset data used for the just-submitted question.
  console.log(feedback);
}

function onGetQuizPin(pin) {
  // Server sent you the user info when you logged in, as a JSON: { token: ..., user: {...} }
  // I'm assuming you saved it somewhere in local storage, with key: userInfo.
  const userInfo = localStorage.getItem("userInfo"); // or geet from wherever you kept it.
  const auth = { pin: pin, userInfo: userInfo };

  //TODO: Set the PIN somewhere the player can see it.

  socket.emit("authenticate", auth, error => {
    alert(error);
  });
}

function onDisconnect(reason) {
  // Tell admin that someone just disconnected
  io.of("/quizadmin").emit("someone-just-left", socket.id, onError);
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
 * { pin: 'w323', userId: 3, quizQuestionId: 2, choice: 1, correct: true,  bonus: 4, points: 12 }
 * @param {*} answerInfo
 */
function submitAnswer(answerInfo) {
  socket.emit("submit-answer", answerInfo, onError);
}

/**
 * Sample callback function to pass to socket. Socket will call it if anything goes wrong with our .emit request.
 * @param {*} errorMessage A string describing the error
 */
function onError(errorMessage) {
  console.log("From /gameplayer callback fn: An error occurred.");
  console.log(errorMessage);

  // Or do whatever you like with the message
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

socket.on("error", onError);

socket.on("disconnect", onDisconnect);
