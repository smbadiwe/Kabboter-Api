/**
 * Called when a game is selected and button clicked.
 * @param {*} e
 */
function startSurveyAdmin(e) {
  e.preventDefault();
  const data = { surveyId: $("#gamelist").val() };
  console.log("calling startSurveyAdmin with data: ");
  console.log(data);
  const baseUrl = window.location.origin;
  $.ajax({
    type: "POST",
    url: baseUrl + "/api/user/surveyruns/create",
    data: data,
    beforeSend: setAuthToken,
    success: function(result) {
      onGetSurveyRunInfo(result);
    },
    error: function(error) {
      console.log("Status: " + error.status + " Message: " + error.statusText);
      console.log(error);
    }
  });
}

function onGetSurveyRunInfo(info) {
  // info = { id: <the surveyRun id>, surveyId: surveyId, pin: pin, totalQuestions: totalQuestions,surveytitle: surveytitle, surveydescription: surveydescription };
  console.log("onGetSurveyRunInfo - info = ");
  localStorage.setItem("surveyruninfo", JSON.stringify(info));
  $("div#step1").hide();
  $("div#step2").show();
  $("#unum").html(info.pin);
  $("#nplayers").html(0);
  $("#surveytitle").html(info.surveytitle);
  $("#surveydescription").html(info.surveydescription);
  $("#gametotalqns").html(info.totalQuestions);
  $("#gametotal").html(info.totalQuestions);

  //  $("#surveyinfo").html("PIN: " + info.pin + " Total Questions: " + info.totalQuestions);

  // Finally
  authenticateSurveyAdmin(info.pin);
}

// function onGetAdminGameRunInfo(info) {
//   // info = { id: <the surveyRun id>, surveyId: surveyId, pin: pin, totalQuestions: totalQuestions };
//   console.log("onGetSurveyRunInfo - info = ");
//   console.log(info);
//   localStorage.setItem("surveyruninfo", JSON.stringify(info));

//   $("div#step1").hide();
//   $("div#step2").show();

//   $("#surveyinfo").html("PIN: " + info.pin + " Total Questions: " + info.totalQuestions);

//   // Finally
//   authenticateSurveyAdmin();

//   // Redirect closes our sockets. So, don't.
//   // window.location.href = "http://localhost:3000/surveyadmin";
// }

function onPlayerSubmittedAnswer(data) {
  //data: {
  //     surveyQuestionId: data.surveyQuestionId,
  //     choice: data.choice
  // }
  // data = { surveyQuestionId: surveyQuestionId<integer>, choice: <1,2,3,or 4> }
  //TODO: Use this info to update dashboard. That dashboard where you show
  // chart of the different options and how many players chose each.
  console.log("From onPlayerSubmittedAnswer fn:");
  console.log(data);
}

function updateSurveyAdminPageOnWhenSomeoneJustJoined(data) {
  // data = { nPlayers: nPlayers, topFive: topFive };
  // You get the total number of players still connecting
  // and a list of the top 5 to display on page.
  console.log("From updateSurveyAdminPageOnWhenSomeoneJustJoined fn:");
  console.log(data);
}

function updateSurveyAdminPageOnWhenSomeoneJustLeft(data) {
  // data = { nPlayers: nPlayers, topFive: topFive };
  // You get the total number of players still connecting
  // and a list of the top 5 to display on page.
  console.log("From updateSurveyAdminPageOnWhenSomeoneJustLeft fn:");
  console.log(data);
}

function callbackOnSurveyAdminError(errorMessage) {
  //TODO:  if there are no more questions to display, decide how to handle it.
  // Such error messages will start with '404 - '
  console.log("From /surveyadmin callback fn: An error occurred.");
  console.log(errorMessage);
  //TODO: Whatever you want.
  //$("#error").html(errorMessage);
}

$(function() {
  loadGameDropdownList("/api/user/surveys");
});
