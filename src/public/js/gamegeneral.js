function loadGameRecord(recordType, idParam = "id") {
  var id = getUrlParameter(idParam);
  if (id > 0) {
    const isQuiz = recordType === "quiz";
    id = +id;
    var myUrl = window.location.origin + `/api/user/${isQuiz ? "quizzes" : "votes"}/${id}`;

    $("#pageHeading").html(`Update ${isQuiz ? "Quiz" : "Vote"} record`);
    var token = localStorage.getItem("token");
    $.ajax({
      headers: {
        Authorization: "Bearer " + token
      },
      url: myUrl,
      type: "get",
      error: function(data) {
        console.log(data);
        $("#result").show();
        $("#result").html("Error retrieving record");
      },
      success: function(data) {
        $("#title").val(data.title);
        $("#description").val(data.description);
        $("#introLink").val(data.introLink);
        $("#credits").val(data.creditResources);
        $("#audience").val(data.audience);
        $("#visibleTo").val(data.visibleTo);
      }
    });
  } else {
    $("#importLink").show();
  }
}

/**
 *
 * @param {*} e The event
 * @param {*} recordType "quiz" or "vote"
 */
function saveOrUpdateGame(e, recordType) {
  e.preventDefault();
  var title = $("#title").val();
  var description = $("#description").val();
  var introLink = $("#introLink").val();
  var creditResources = $("#creditResources").val();
  var audience = $("#audience").val();
  var visibleTo = $("#visibleTo").val();
  const postData = {
    title: title,
    description: description,
    creditResources: creditResources,
    introLink: introLink,
    visibleTo: visibleTo,
    audience: audience
  };
  const isQuiz = recordType === "quiz";
  var myUrl = window.location.origin + `/api/user/${isQuiz ? "quizzes" : "votes"}/create`;

  if (id > 0) {
    postData.id = id;
    myUrl = myUrl.replace("create", "update");
  }

  const token = localStorage.getItem("token");
  $.ajax({
    headers: {
      Authorization: "Bearer " + token
    },
    url: myUrl,
    type: "post",
    data: postData,
    error: function(data) {
      console.log(data);
      $("#result").show();
      $("#result").html(data.responseText);
    },
    success: function(data) {
      window.location = `questions.html?${isQuiz ? "quiz" : "vote"}Id=${data.id}`;
    }
  });
}
