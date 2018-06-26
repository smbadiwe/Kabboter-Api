function setQuizQuestionPropsOnPage(quizquestion) {
  // This is a question object as defined in the API doc.
  //TODO: Render fields as you would like it.
  console.log("onReceiveNextQuestion. question = ");
  console.log(quizquestion);
  if (quizquestion) {
    const oldQn = $("#questions").html();
    try {
      $("#questions").html(JSON.stringify(quizquestion));
      $("#error").html("");
      $("#feedback").html("");
      $("#stats").html("");
      $("#dashboard").html("");
    } catch (e) {
      $("#error").html(e);
      $("#questions").html(oldQn);
    }
  } else {
    $("#feedback").html("That's all! Thank you for participating.");
  }
}

function onGetQuizRunInfo(info) {
  // info = { id: <the quizRun id>, quizId: quizId, pin: pin, totalQuestions: totalQuestions };
  console.log("onGetQuizRunInfo - info = ");
  console.log(info);
  localStorage.setItem("quizruninfo", JSON.stringify(info));

  $("div#step1").hide();
  $("div#step2").show();

  $("#quizinfo").html("PIN: " + info.pin + " Total Questions: " + info.totalQuestions);
  // Finally
  authenticateQuizAdmin();

  // Redirect sloses our sockets. So, don't.
  // window.location.href = "http://localhost:3000/quizadmin";
}

function onPlayerSubmittedAnswer(data) {
  //data: {
  //     quizQuestionId: data.quizQuestionId,
  //     choice: data.choice
  // }
  // data = { quizQuestionId: quizQuestionId<integer>, choice: <1,2,3,or 4> }
  //TODO: Use this info to update dashboard. That dashboard where you show
  // chart of the different options and how many players chose each.
  $("#dashboard").html(JSON.stringify(data));
}

function updateQuizAdminPageOnWhenSomeoneJustJoined(data) {
  // data = { nPlayers: nPlayers, topFive: topFive };
  // You get the total number of players still connecting
  // and a list of the top 5 to display on page.
  $("#stats").html(JSON.stringify(data));
}

function updateQuizAdminPageOnWhenSomeoneJustLeft(data) {
  // data = { nPlayers: nPlayers, topFive: topFive };
  // You get the total number of players still connecting
  // and a list of the top 5 to display on page.
  $("#stats").html(JSON.stringify(data));
}

function callbackOnQuizAdminError(errorMessage) {
  //TODO:  if there are no more questions to display, decide how to handle it.
  // Such error messages will start with '404 - '
  console.log("From /quizadmin callback fn: An error occurred.");
  console.log(errorMessage);
  //TODO: Whatever you want.
  $("#error").html(errorMessage);
}
