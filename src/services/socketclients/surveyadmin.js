// Sample client code for survey admin
// Add these:
// <script src="/socket.io/socket.io.js"></script>
// <script src="./general.js"></script>
// <script src="./surveyadmin.ui.js"></script>
// to the page BEFORE importing this js file. That's where io is defined.

import io from "socket.io-client";
const socket = io("/surveyadmin");

function onReceiveNextQuestion(question) {
  //This is a question object as defined in the API doc.
  //TODO:  Render fields as you would like it.
  setSurveyQuestionsOnPage(question);
  localStorage.setItem("surveyquestion", JSON.stringify(question));
}

function onGetSurveyRunInfo(info) {
  // info = { id: <the surveyRun id>, surveyId: surveyId, pin: pin, totalQuestions: totalQuestions };

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

function onPlayerSubmittedAnswer(data) {
  // data = { surveyQuestionId: surveyQuestionId<integer>, choice: <1,2,3,or 4> }
  //TODO: Use this info to update dashboard. That dashboard where you show
  // chart of the different options and how many players chose each.
}

/**
 * Call this function as soon as you can on page load.
 * The URL loading the page MUST pass pin via querystring, with key: 'pin'
 */
function authenticateSurveyAdmin() {
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

socket.on("error", callbackOnSurveyError);

socket.on("disconnect", onDisconnect);

adminIO.on("player-sumbitted-answer", onPlayerSubmittedAnswer);
