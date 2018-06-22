// Sample client code for survey admin
// Add these:
// <script src="/socket.io/socket.io.js"></script>
// <script src="./general.js"></script>
// to the page BEFORE importing this js file. That's where io is defined.

const socket = io("/surveyadmin");

function onReceiveNextQuestion(question) {
  //This is a question object as defined in the API doc.
  //TODO:  Render fields as you would like it.

  localStorage.setItem("surveyquestion", JSON.stringify(question));
  console.log(question);
}

function onGetSurveyRunInfo(info) {
  // data = { id: <the surveyRun id>, surveyId: surveyId, pin: pin };

  localStorage.setItem("surveyruninfo", JSON.stringify(info));
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
  console.log(payload);
}

function onDisconnect(reason) {
  if (reason === "io server disconnect") {
    // the disconnection was initiated by the server, you need to reconnect manually
    socket.connect();
  }
  // else the socket will automatically try to reconnect
}

function onError(errorMessage) {
  console.log("From /surveyadmin callback fn: An error occurred.");
  console.log(errorMessage);
}

/**
 * Call this function as soon as you can on page load.
 * The URL loading the page MUST pass pin via querystring, with key: 'pin'
 */
function authenticateAdmin() {
  // Server sends this info on successful login, as a JSON: { token: ..., user: {...} }
  // I'm assuming you saved it somewhere in local storage, with key: userInfo.
  const userInfo = getUserInfo();
  const pin = getQueryStringParams().pin;
  const auth = { pin: pin, userInfo: userInfo };
  socket.emit("authenticate", auth, error => {
    alert(error);
  });
}

socket.on("get-surveyrun-info", onGetSurveyRunInfo);

socket.on("receive-next-question", onReceiveNextQuestion);

socket.on("when-someone-just-joined", onWhenSomeoneJustJoined);

socket.on("when-someone-just-left", onWhenSomeoneJustLeft);

socket.on("error", onError);

socket.on("disconnect", onDisconnect);
