/**
 *
 * @param {*} actionType 'unpublish' or 'publish'
 * @param {*} recordType 'quiz' or 'vote'
 */
function setupGame(actionType, recordType) {
  if (confirm(`Are you sure you want to ${actionType} this quiz?`)) {
    var token = localStorage.getItem("token");
    const id = getUrlParameter("id"); // quiz/survey id
    const isQuiz = recordType === "quiz";
    const myUrl =
      window.location.origin + `/api/user/${isQuiz ? "quizzes" : "surveys"}/${actionType}`;

    $.ajax({
      headers: {
        Authorization: "Bearer " + token
      },
      url: myUrl,
      type: "POST",
      data: {
        id: id
      },
      error: function(data) {
        console.log(data);
        $("#result").append("Error - " + data.statusText);
      },
      success: function(data) {
        alert(`${isQuiz ? "Quiz" : "Vote"} successfully ${actionType}ed`);
        setTimeout(function() {
          window.location.reload(true);
        });
      }
    });
  }
}

/**
 * Delete record
 * @param {*} questionId
 * @param {*} recordType Should be "quiz" or ("vote" or "survey")
 */
function deleteId(questionId, recordType) {
  if (confirm("Are you sure you want to delete this question?")) {
    const token = localStorage.getItem("token");
    const isQuiz = recordType === "quiz";
    const myUrl =
      window.location.origin +
      `/api/user/${isQuiz ? "quiz" : "survey"}questions/delete/${questionId}`;

    $.ajax({
      headers: {
        Authorization: "Bearer " + token
      },
      url: myUrl,
      type: "post",
      error: function(data) {
        $("#result").show();
        $("#result").html("Error deleting record. " + data.statusText);
      },
      success: function(data) {
        alert("Question deleted successfully");
        setTimeout(function() {
          window.location.reload(true);
        });
      }
    });
  }
}

function loadGameRecord(recordType, idParam = "id") {
  var id = getUrlParameter(idParam);
  if (id > 0) {
    const isQuiz = recordType === "quiz";
    id = +id;
    var myUrl = window.location.origin + `/api/user/${isQuiz ? "quizzes" : "surveys"}/${id}`;

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
  var myUrl = window.location.origin + `/api/user/${isQuiz ? "quizzes" : "surveys"}/create`;

  var id = getUrlParameter("id");
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
    type: "POST",
    data: postData,
    error: function(data) {
      console.log(data);
      $("#result").show();
      $("#result").html(data.responseText);
    },
    success: function(data) {
      //NB: 'id' querystring key refers to the quiz/survey id; NOT the question id
      window.location = `addeditquestions.html?id=${data.id}&title=${data.title}&desc=${data.description}`;
    }
  });
}
