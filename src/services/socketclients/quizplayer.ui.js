function onReceiveNextQuestion(question) {
  //TODO: This is a question object as defined in the API doc.
  // Render fields on a page as you would like it. Depending, you may,
  // want to only render the answers. Whatever!
  localStorage.setItem("quizquestion", JSON.stringify(question));
}

function submitQuizAmswerChoice(event) {
  const id = event.target.id;

  const timeCount = Math.floor(5 + Math.random() * 10); //TODO: Get it where where you have it. We assume value counts from 0 - as in, count up, not count down.
  const choice = id.substr(id.length - 1); //TODO: Get it from the event target or however you want.
  const answerInfo = {
    timeCount: timeCount,
    choice: choice
  };
  submitAnswer(answerInfo);
}

function onAuthSuccess(feedback) {
  // Redirect to the page where user can answer the questions.
  console.log("onAuthSuccess called");
  $("button#startBtn").hide();
  $("input#quizpin").prop("disabled", true);

  $("div#step2").show();

  // Redirecting closes the socket. So, don't.
  // window.location.href = "http://localhost:3000/quizplayer";
}

//  data = { pin: pin, userInfo: userInfo }
function onGetQuizRunInfo(data) {
  console.log("onGetQuizRunInfo: data = ");
  console.log(data);

  // if we're still in the start page, set the pin
  if ($("input#quizpin").length) {
    $("input#quizpin").val(data.pin);
  }
}

function feedbackOnQuizAnswerSubmitted(feedback) {
  // If all went well, 'feedback' will just be a string saying "Submitted".
  //TODO: You decide. You can clear input fields or reset data used for the just-submitted question.
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
