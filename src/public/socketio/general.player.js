function onPlayerDisconnect(socket, reason, recordType) {
  console.log(recordType + " onPlayerDisconnect: reason - " + reason);
  GamePlayerData[recordType + "PlayerInfo"] = undefined;
  GamePlayerData[recordType + "question"] = undefined;
  GamePlayerData["moderator"] = undefined;
  // See https://github.com/socketio/socket.io-client/blob/HEAD/docs/API.md#socketdisconnect
  if (reason === "io server disconnect") {
    // the disconnection was initiated by the server. If you need to reconnect manually, call
    // socket.connect();
    alert("Disconnected from server. Refresh page to start afresh and reconnect.");
  }
  // else the socket will automatically try to reconnect
  //TODO: Tell admin that someone just disconnected
}
