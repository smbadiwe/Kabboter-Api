// Sample client code for game player
const socket = io("/quizplayer");

socket.on("get-next-question", async question => {
  // This is a question object as defined in the API doc.
  // Render fields as you would like it.
});

socket.on("submit-answer", data => {
  // If all went well, 'data' will just be a string saying "Submitted".
  console.log(data);
});

socket.on("get-quiz-pin", pin => {
  // Server sends this info on successful login, as a JSON: { token: ..., user: {...} }
  // I'm assuming you saved it somewhere in local storage, with key: userInfo.
  const userInfo = localStorage.getItem("userInfo");
  const auth = { pin: pin, userInfo: userInfo };
  socket.emit("authenticate", auth, error => {
    alert(error);
  });
  //TODO: Set the PIN somewhere the player can see it
});

socket.on("error", error => {
  console.log(`From client: An error occurred`);
  console.log(error);
});

socket.on("disconnect", reason => {
  if (reason === "io server disconnect") {
    // the disconnection was initiated by the server, you need to reconnect manually
    socket.connect();
  }
  // else the socket will automatically try to reconnect
});

/**
 * Submit answer to a quiz question.
 *
 * answerInfo should be a JSON with these keys:
 * { pin: 'w323', userId: 3, quizQuestionId: 2, choice: 1, correct: true,  bonus: 4, points: 12 }
 * @param {*} answerInfo
 */
function submitAnswer(answerInfo) {
  socket.emit("submit-answer", answerInfo, onError);
}

function onError(errorMessage) {
  console.log(`From callback fn: An error occurred`);
  console.log(errorMessage);

  // Or do whatever you like with the message
}
