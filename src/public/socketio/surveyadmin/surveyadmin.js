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
