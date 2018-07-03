/**
 * Called when a game is selected and button clicked.
 * @param {*} e
 */
function startQuizAdmin(e) {
  e.preventDefault();
  const data = { quizId: $("#gamelist").val() };
  if (!data.quizId) {
    $("#result").show();
    $("#result").html("Select quiz");
    return false;
  }
  console.log("calling startQuizAdmin with data: ");
  console.log(data);
  const baseUrl = window.location.origin;
  $.ajax({
    type: "POST",
    url: baseUrl + "/api/user/quizruns/create",
    data: data,
    beforeSend: setAuthToken,
    success: function(result) {
      onGetQuizRunInfo(result);
    },
    error: function(error) {
      console.log("Status: " + error.status + " Message: " + error.statusText);
      console.log(error);
    }
  });
}

function onGetQuizRunInfo(info) {
  // info = { id: <the quizRun id>, quizId: quizId, pin: pin, totalQuestions: totalQuestions,quiztitle: quiztitle, quizdescription: quizdescription };
  console.log("onGetQuizRunInfo - info = ");
  localStorage.setItem("quizruninfo", JSON.stringify(info));
  $("div#step1").hide();
  $("div#step2").show();
  $("#unum").html(info.pin);
  $("#nplayers").html(0);
  $("#quiztitle").html(info.quiztitle);
  $("#quizdescription").html(info.quizdescription);
  $("#gametotalqns").html(info.totalQuestions);
  $("#gametotal").html(info.totalQuestions);

  //  $("#quizinfo").html("PIN: " + info.pin + " Total Questions: " + info.totalQuestions);

  // Finally
  authenticateQuizAdmin(info.pin);
}

// function onGetAdminGameRunInfo(info) {
//   // info = { id: <the quizRun id>, quizId: quizId, pin: pin, totalQuestions: totalQuestions };
//   console.log("onGetQuizRunInfo - info = ");
//   console.log(info);
//   localStorage.setItem("quizruninfo", JSON.stringify(info));

//   $("div#step1").hide();
//   $("div#step2").show();

//   $("#quizinfo").html("PIN: " + info.pin + " Total Questions: " + info.totalQuestions);

//   // Finally
//   authenticateQuizAdmin();

//   // Redirect closes our sockets. So, don't.
//   // window.location.href = "http://localhost:3000/quizadmin";
// }

function onPlayerSubmittedAnswer(data) {
  //data: {
  //     quizQuestionId: data.quizQuestionId,
  //     choice: data.choice
  // }
  // data = { quizQuestionId: quizQuestionId<integer>, choice: <1,2,3,or 4> }
  //TODO: Use this info to update dashboard. That dashboard where you show
  // chart of the different options and how many players chose each.
  console.log("From onPlayerSubmittedAnswer fn:");
  console.log(data);
}

function updateQuizAdminPageOnWhenSomeoneJustJoined(data) {
  // data = { nPlayers: nPlayers, topFive: topFive };
  // You get the total number of players still connecting
  // and a list of the top 5 to display on page.
  console.log("From updateQuizAdminPageOnWhenSomeoneJustJoined fn:");
  console.log(data);
}

function updateQuizAdminPageOnWhenSomeoneJustLeft(data) {
  // data = { nPlayers: nPlayers, topFive: topFive };
  // You get the total number of players still connecting
  // and a list of the top 5 to display on page.
  console.log("From updateQuizAdminPageOnWhenSomeoneJustLeft fn:");
  console.log(data);
}

function callbackOnQuizAdminError(errorMessage) {
  //TODO:  if there are no more questions to display, decide how to handle it.
  // Such error messages will start with '404 - '
  console.log("From /quizadmin callback fn: An error occurred.");
  console.log(errorMessage);
  //TODO: Whatever you want.
  //$("#error").html(errorMessage);
}

$(function() {
  $("#playGameUrl").html(window.location.origin + "/playvote");
  loadGameDropdownList("quizzes");
});
