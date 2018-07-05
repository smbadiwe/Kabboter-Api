/**
 * Called when a game is selected and button clicked.
 * @param {*} e
 */
function startSurveyAdmin(e) {
  e.preventDefault();
  const data = { surveyId: $("#gamelist").val() };
  if (!data.surveyId) {
    $("#result").show();
    $("#result").html("Select vote");
    return false;
  }
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
  SetGameRunInfoOnPage(info, "survey");
  // Finally
  authenticateSurveyAdmin(info.pin);
}

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

$(function() {
  $("#playGameUrl").html(window.location.origin + "/playvote");
  loadGameDropdownList("surveys");
});
