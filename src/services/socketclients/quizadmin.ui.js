function setQuizQuestionsOnPage(question) {
  // question: as defined in doc
  // TODO: Set question to the corresponding UI controls
}

function updateQuizAdminPageOnWhenSomeoneJustJoined(data) {
  // data = { nPlayers: nPlayers, topFive: topFive };
  // You get the total number of players still connecting
  // and a list of the top 5 to display on page.
}

function updateQuizDashboardOnPlayerSubmittedAnswer() {
  // data = { quizQuestionId: quizQuestionId<integer>, choice: <1,2,3,or 4> }
  //TODO: Use this info to update dashboard. That dashboard where you show
  // chart of the different options and how many players chose each.
}

function callbackOnQuizAdminError(errorMessage) {
  //TODO: Whatever you want.
  console.log("From /quizadmin callback fn: An error occurred.");
  console.log(errorMessage);
}
