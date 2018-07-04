function refreshFieldsAfterAnswerIsSubmitted() {
  // $("#questions").html("");
  // $("#error").html("");
  // $("#feedback").html("");
  // $("#stats").html("");
  // $("#dashboard").html("");
}

/**
 * Sample callback function to pass to socket. Socket will call it if anything goes wrong with our .emit request.
 * @param {*} errorMessage A string describing the error
 */
function callbackOnQuizPlayerError(errorMessage) {
  //TODO: whatever you like with the message
  console.log("From /quizplayer callback fn: An error occurred.");
  console.log(errorMessage);
}

/**
 * Sample callback function to pass to socket. Socket will call it if anything goes wrong with our .emit request.
 * @param {*} errorMessage A string describing the error
 */
function callbackOnQuizPlayerError(errorMessage) {
  //TODO: whatever you like with the message
  console.log("From /quizplayer callback fn: An error occurred.");
  console.log(errorMessage);
}
