function setSurveyQuestionsOnPage(question) {
  // question: as defined in doc
  // TODO: Set question to the corresponding UI controls
}

function submitSurveyAmswerChoice(event) {
  const timeCount = 0; //TODO: Get it where where you have it. We assume value counts from 0 - as in, count up, not count down.
  const choice = 0; //::TODO: Get it from the event target or however you want.
  const answerInfo = {
    timeCount: timeCount,
    choice: choice
  };
  submitAnswer(answerInfo);
}

function feedbackOnSurveyAnswerSubmitted(feedback) {
  // If all went well, 'feedback' will just be a string saying "Submitted".
  //TODO: You decide. You can clear input fields or reset data used for the just-submitted question.
}

/**
 * Sample callback function to pass to socket. Socket will call it if anything goes wrong with our .emit request.
 * @param {*} errorMessage A string describing the error
 */
function callbackOnSurveyPlayerError(errorMessage) {
  //TODO: whatever you like with the message
  console.log("From /surveyplayer callback fn: An error occurred.");
  console.log(errorMessage);
}
