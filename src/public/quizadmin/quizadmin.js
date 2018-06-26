// Sample client code for quiz admin
// Add these:
// <script src="/socket.io/socket.io.js"></script>
// <script src="./general.js"></script>
// <script src="./quizadmin.ui.js"></script>
// to the page BEFORE importing this js file. That's where io is defined.

function onWhenSomeoneJustJoined(payload) {
  // payload = {
  //   nPlayers: nPlayers,
  //   topFive: topFive,
  //   newPlayer: data.userInfo,
  //   pin: data.pin
  // };
  // You get the total number of players still connecting
  // and a list of the top 5 to display on page.
  updateQuizAdminPageOnWhenSomeoneJustJoined(payload);
}

function onWhenSomeoneJustLeft(payload) {
  // payload = {
  //   nPlayers: nPlayers,
  //   topFive: topFive,
  //   newPlayer: data.userInfo,
  //   pin: data.pin
  // };
  // You get the total number of players still connecting
  // and a list of the top 5 to display on page.
  updateQuizAdminPageOnWhenSomeoneJustLeft(payload);
}

function getQuizRunInfo() {
  const info = localStorage.getItem("quizruninfo");
  if (!info) throw new Error("quizruninfo not yet created");

  return JSON.parse(info);
}

function updateAnsweredQuestionsList(newQuestionId) {
  let list = localStorage.getItem("answeredquestionlist");
  if (list) {
    localStorage.setItem("answeredquestionlist", `${list}${newQuestionId},`);
  } else {
    localStorage.setItem("answeredquestionlist", `${newQuestionId},`);
  }
}

function onReceiveNextQuestion(quizquestion) {
  if (quizquestion) {
    localStorage.setItem("quizquestion", JSON.stringify(quizquestion));
    updateAnsweredQuestionsList(quizquestion.id);
  }
  setQuizQuestionPropsOnPage(quizquestion);
}

// Sockets now
const socket = io("/quizadmin", getSocketOptions());

function onDisconnect(reason) {
  localStorage.removeItem("quizruninfo");
  localStorage.removeItem("quizquestion");
  if (reason === "io server disconnect") {
    // the disconnection was initiated by the server, you need to reconnect manually
    console.log("Server disconnected you do to auth fail");
    socket.connect();
  }
  // else the socket will automatically try to reconnect
}

/**
 * Call this function as soon as you can on page load.
 * The URL loading the page MUST pass pin via querystring, with key: 'pin'
 */
function authenticateQuizAdmin() {
  // Server sends this info on successful login, as a JSON: { token: ..., user: {...} }
  // I'm assuming you saved it somewhere in local storage, with key: userInfo.
  const userInfo = getUserInfo();
  const quizRunInfo = getQuizRunInfo();
  const auth = { pin: quizRunInfo.pin, userInfo: userInfo };
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
  const quizRunInfo = getQuizRunInfo();
  socket.emit("get-next-question", quizRunInfo, callbackOnQuizAdminError);
}

// socket.on("get-quizrun-info", onGetQuizRunInfo);

socket.on("receive-next-question", onReceiveNextQuestion);

socket.on("when-someone-just-joined", onWhenSomeoneJustJoined);

socket.on("when-someone-just-left", onWhenSomeoneJustLeft);

socket.on("error", callbackOnQuizAdminError);

socket.on("disconnect", onDisconnect);

socket.on("player-sumbitted-answer", onPlayerSubmittedAnswer);
