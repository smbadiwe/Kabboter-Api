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
  SetGameRunInfoOnPage(info, "quiz");
  // Finally
  authenticateQuizAdmin(info.pin, info.totalQuestions);
}

$(function() {
  $("#playGameUrl").html(window.location.origin + "/playquiz");
  loadGameDropdownList("quizzes");
});
