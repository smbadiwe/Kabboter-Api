// Sample client code for survey admin
// Add these:
// <script src="/socket.io/socket.io.js"></script>
// <script src="./general.js"></script>
// <script src="./surveyadmin.ui.js"></script>
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
  updateSurveyAdminPageOnWhenSomeoneJustJoined(payload);
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
  updateSurveyAdminPageOnWhenSomeoneJustLeft(payload);
}

/**
 * return data: {
      surveyRunId: res,
      surveyId: record.surveyId,
      pin: pin,
      totalQuestions: totalQuestions,
      surveytitle: survey.title,
      surveydescription: survey.description
    }
 */
function getSurveyRunInfo() {
  const info = localStorage.getItem("surveyruninfo");
  if (!info) throw new Error("surveyruninfo not yet created");

  return JSON.parse(info);
}

// Sockets now
const socket = io("/surveyadmin", getSocketOptions());

function onDisconnect(reason) {
  localStorage.removeItem("surveyruninfo");
  localStorage.removeItem("surveyquestion");
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
function authenticateSurveyAdmin(pin) {
  // Server sends this info on successful login, as a JSON: { token: ..., user: {...} }
  // I'm assuming you saved it somewhere in local storage, with key: userInfo.
  const userInfo = getUserInfo();
  const auth = { pin: pin, userInfo: userInfo };
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
  const surveyRunInfo = getSurveyRunInfo();
  let answeredQuestionIds = [];
  const ids = sessionStorage.getItem("answeredquestionlist");
  if (ids) {
    const idsSplit = ids.split(",");
    idsSplit.forEach(i => {
      if (i) {
        answeredQuestionIds.push(+i);
      }
    });
  }
  socket.emit("get-next-question", surveyRunInfo, answeredQuestionIds, callbackOnSurveyAdminError);
}

// socket.on("get-surveyrun-info", onGetSurveyRunInfo);

socket.on("receive-next-question", onReceiveNextQuestion);

socket.on("when-someone-just-joined", onWhenSomeoneJustJoined);

socket.on("when-someone-just-left", onWhenSomeoneJustLeft);

socket.on("error", callbackOnSurveyAdminError);

socket.on("disconnect", onDisconnect);

socket.on("player-sumbitted-answer", onPlayerSubmittedAnswer);
