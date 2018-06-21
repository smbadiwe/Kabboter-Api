// Sample client code for game admin
import io from "socket.io-client";

const socket = io("/quizadmin");

socket.on("get-next-question", question => {
  // This is a question object as defined in the API doc.
  // Render fields as you would like it.
  console.log(question);
});

socket.on("someone-just-joined", payload => {
  // payload = { nPlayers: nPlayers, topFive: topFive };
  // You get the total number of players still connecting
  // and a list of the top 5 to display on page.
  console.log(payload);
});

socket.on("someone-just-left", payload => {
  // payload = { nPlayers: nPlayers, topFive: topFive };
  // You get the total number of players still connecting
  // and a list of the top 5 to display on page.
  console.log(payload);
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
 * Call this function as soon as you can on page load.
 * The URL loading the page MUST pass pin via querystring, with key: 'pin'
 */
export function authenticateAdmin() {
  // Server sends this info on successful login, as a JSON: { token: ..., user: {...} }
  // I'm assuming you saved it somewhere in local storage, with key: userInfo.
  const userInfo = localStorage.getItem("userInfo");
  const pin = getQueryStringParams().pin;
  const auth = { pin: pin, userInfo: userInfo };
  socket.emit("authenticate", auth, error => {
    alert(error);
  });
}

function getQueryStringParams(queryString) {
  if (!queryString) {
    queryString = window.location.search;
  }
  if (!queryString) {
    return {};
  }

  return (/^[?#]/.test(queryString) ? queryString.slice(1) : queryString)
    .split("&")
    .reduce((params, param) => {
      let [key, value] = param.split("=");
      params[key] = value ? decodeURIComponent(value.replace(/\+/g, " ")) : "";
      return params;
    }, {});
}
