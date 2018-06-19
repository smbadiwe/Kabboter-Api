// Sample client code for game admin
const socket = io("/quizadmin");

socket.on("get-next-question", question => {
  // This is a question object as defined in the API doc.
  // Render fields as you would like it.
});

socket.on("someone-just-joined", player => {
  playerIO.in(roomNo).clients((err, clients) => {
    console.log(clients); // an array containing socket ids in 'room3'
  });
});

socket.on("someone-just-left", player => {
  playerIO.in(roomNo).clients((err, clients) => {
    console.log(clients); // an array containing socket ids in 'room3'
  });
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
 * Call this function as soon as you can on page load
 */
function authenticateAdmin() {
  const userInfo = localStorage.getItem("userInfo");
  const auth = { userInfo: userInfo };
  socket.emit("authenticate", auth, error => {
    alert(error);
  });
}

authenticateAdmin();
