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

function getUserInfo() {
  // Server sent you the user info when you logged in, as a JSON: { token: ..., user: {...} }
  // I'm assuming you saved it somewhere in local storage, with key: userInfo.
  const userInfo = localStorage.getItem("userInfo"); //TODO: Get it from wherever you kept it.
  if (!userInfo) throw new Error("userInfo not yet created. Please logout and login again");

  return JSON.parse(userInfo);
}

function getAuthToken() {
  return localStorage.getItem("token");
}

function getSocketOptions() {
  // See https://github.com/socketio/socket.io-client/issues/1097 for explanations
  return {
    // [1] Important as fuck
    reconnectionDelay: 1000,
    reconnection: true,
    reconnectionAttempts: 10,
    transports: ["websocket", "polling"],
    agent: false,
    upgrade: false,
    rejectUnauthorized: false
  }; // [2] Please don't set this to true
}
