// Sample client code for quiz admin
// Add these:
// <script src="/socket.io/socket.io.js"></script>
// <script src="./general.js"></script>
// <script src="./quizadmin.ui.js"></script>
// to the page BEFORE importing this js file. That's where io is defined.

const socket = io("/quizadmin");

function onReceiveNextQuestion(question) {
  // This is a question object as defined in the API doc.
  //TODO: Render fields as you would like it.
  setQuizQuestionsOnPage(question);
  localStorage.setItem("quizquestion", JSON.stringify(question));
}

function onGetQuizRunInfo(info) {
  // info = { id: <the quizRun id>, quizId: quizId, pin: pin, totalQuestions: totalQuestions };

  localStorage.setItem("quizruninfo", JSON.stringify(info));
}

function onWhenSomeoneJustJoined(payload) {
  // payload = { nPlayers: nPlayers, topFive: topFive };
  // You get the total number of players still connecting
  // and a list of the top 5 to display on page.
  console.log(payload);
}

function onWhenSomeoneJustLeft(payload) {
  // payload = { nPlayers: nPlayers, topFive: topFive };
  // You get the total number of players still connecting
  // and a list of the top 5 to display on page.
  updateQuizAdminPageOnWhenSomeoneJustJoined;
  payload;
}

function onDisconnect(reason) {
  if (reason === "io server disconnect") {
    // the disconnection was initiated by the server, you need to reconnect manually
    socket.connect();
  }
  // else the socket will automatically try to reconnect
}

function onPlayerSubmittedAnswer(data) {
  updateQuizDashboardOnPlayerSubmittedAnswer(data);
}

/**
 * Call this function as soon as you can on page load.
 * The URL loading the page MUST pass pin via querystring, with key: 'pin'
 */
function authenticateQuizAdmin() {
  // Server sends this info on successful login, as a JSON: { token: ..., user: {...} }
  // I'm assuming you saved it somewhere in local storage, with key: userInfo.
  const userInfo = getUserInfo();
  const pin = getQueryStringParams().pin;
  const auth = { pin: pin, userInfo: userInfo };
  socket.emit("authenticate", auth, error => {
    alert(error);
  });
}

/**
 * The 'Next' button that loads a new question should call this.
 */
function getNextQuestion() {
  const quizRunInfo = JSON.parse(localStorage.setItem("quizruninfo"));
  var data = { quizRunId: quizRunInfo.Id, quizId: quizRunInfo.quizId };
  socket.emit("get-next-question", data, callbackOnQuizAdminError);
}

socket.on("get-quizrun-info", onGetQuizRunInfo);

socket.on("receive-next-question", onReceiveNextQuestion);

socket.on("when-someone-just-joined", onWhenSomeoneJustJoined);

socket.on("when-someone-just-left", onWhenSomeoneJustLeft);

socket.on("error", callbackOnQuizAdminError);

socket.on("disconnect", onDisconnect);

adminIO.on("player-sumbitted-answer", onPlayerSubmittedAnswer);
