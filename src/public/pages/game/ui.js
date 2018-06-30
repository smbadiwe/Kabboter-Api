function setQuizQuestionPropsOnPage(quizquestion) {
  //This is a question object as defined in the API doc.
  //TODO: Render fields as you would like it.
  console.log("onReceiveNextQuestion. question = ");
  console.log(quizquestion);
  if (quizquestion) {
    const oldQn = $("#questions").html();
    try {
      //      $("#questions").html(JSON.stringify(quizquestion));
      $("#quest").html(JSON.stringify(quizquestion.question));
      $("#opt1").html(JSON.stringify(quizquestion.option1));
      $("#opt2").html(JSON.stringify(quizquestion.option2));
      $("#opt3").html(JSON.stringify(quizquestion.option3));
      $("#opt4").html(JSON.stringify(quizquestion.option4));
      $("#timeLimit").html(JSON.stringify(quizquestion.timeLimit));
      localStorage.setItem(quizquestion.timeLimit);
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
  //  localStorage.setItem("quizruninfo", JSON.stringify(info));
  localStorage.setItem("quiztitle", JSON.stringify(info.quiztitle));
  localStorage.setItem("quizdescription", JSON.stringify(info.quizdescription));
  localStorage.setItem("quizid", JSON.stringify(info.id));
  localStorage.setItem("quizpin", JSON.stringify(info.pin));
  localStorage.setItem("quiztotal", JSON.stringify(info.totalQuestions));
  $("#unum").html(info.pin);
  $("#quiztitle").html(info.quiztitle);
  $("#quizdescription").html(info.quizdescription);
  $("#quizid").html(info.id);
  $("#quiztotal").html(info.totalQuestions);
  $("div#step1").hide();
  $("div#step2").show();

  //  $("#quizinfo").html("PIN: " + info.pin + " Total Questions: " + info.totalQuestions);

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
  $("#nplayers").html(JSON.stringify(data.nPlayers));
}

function updateQuizAdminPageOnWhenSomeoneJustLeft(data) {
  // data = { nPlayers: nPlayers, topFive: topFive };
  // You get the total number of players still connecting
  // and a list of the top 5 to display on page.
  $("#stats").html(JSON.stringify(data));
  $("#nplayers").html(JSON.stringify(data.nPlayers));
}

function callbackOnQuizAdminError(errorMessage) {
  //TODO:  if there are no more questions to display, decide how to handle it.
  // Such error messages will start with '404 - '
  console.log("From /quizadmin callback fn: An error occurred.");
  console.log(errorMessage);
  //TODO: Whatever you want.
  $("#error").html(errorMessage);
}
