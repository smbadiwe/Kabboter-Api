// Sample client code for survey admin
// Add these:
// <script src="/socket.io/socket.io.js"></script>
// <script src="./general.js"></script>
// <script src="./surveyadmin.ui.js"></script>
// to the page BEFORE importing this js file. That's where io is defined.

// Sockets now
(function(glob) {
  glob.socket = io("/surveyadmin", getSocketOptions());
})(this); // 'this' will be 'window' or 'module' or ... depending on the client

/**
 * Call this function as soon as you can on page load.
 * The URL loading the page MUST pass pin via querystring, with key: 'pin'
 */
function authenticateSurveyAdmin(pin, totalQuestions) {
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
 * The 'Next' button that loads a new question should call this.
 */
function getNextQuestion() {
  emitGetNextQuestionEvent(socket, "survey");
}

socket.on("receive-next-question", onReceiveNextQuestion);

socket.on("when-someone-just-joined", function(data) {
  onWhenSomeoneJustJoined(data, "survey");
});

socket.on("when-someone-just-left", function(data) {
  onWhenSomeoneJustLeft(data, "survey");
});

socket.on("error", callbackOnGameAdminError);

socket.on("disconnect", reason => {
  onAdminDisconnected(socket, reason, "survey");
});

socket.on("player-sumbitted-answer", data => {
  onPlayerSubmittedAnswer(data, "survey");
});
