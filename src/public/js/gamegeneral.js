/**
 * Used on quiz and vote details page
 * @param {*} recordType 'quiz' or 'vote'
 */
function loadGameDetailsPageData(recordType) {
  loadNavBar();

  const isQuiz = recordType === "quiz";
  var token = localStorage.getItem("token");
  var id = getUrlParameter("id");
  var myUrl = window.location.origin + `/api/user/${isQuiz ? "quizzes" : "surveys"}/${id}?wq=y`;

  $.ajax({
    headers: {
      Authorization: "Bearer " + token
    },
    url: myUrl,
    type: "GET",
    error: function(data) {
      console.log(data);
      $("#result").show();
      $("#result").html("Error fetching data");
    },
    success: function(data) {
      console.log(data);
      $("#title").html(data.title);
      $("#description").html(data.description);
      $("#introLink").html(data.introLink || "-");
      $("#credits").html(data.creditResources || "-");
      const audience = {
        1: "Social",
        2: "School"
      };
      const visibleTo = {
        1: "Everyone",
        2: "OnlyMe"
      };
      $("#audience").html(audience[data.audience]);
      $("#visibleTo").html(visibleTo[data.visibleTo]);

      const quizOrVote = isQuiz ? "Quiz" : "Vote";
      $("#add-questions").html(
        `<a href="addeditquestions.html?id=${data.id}&title=${data.title}&desc=${
          data.description
        }" id="add-questions" role="button" class="btn btn-dark px-4">Add Question to ${quizOrVote}</a>`
      );

      if (data.published) {
        const quizOrSurvey = isQuiz ? "quiz" : "survey";
        $("#actionDiv").html(`
                          <a role="button" href='/${quizOrSurvey}admin/${quizOrSurvey}admin.html?id=${
          data.id
        }' style="float: center;" class="btn btn-success btn-inline">Launch ${quizOrVote}</a>
                          <a role="button" href='' style="float: center;" onclick="setupGame('unpublish', '${recordType}');" class="btn btn-brand-light btn-inline">Unpublish ${quizOrVote}</a>
                        `);
      } else if (data.questions && data.questions.length > 0) {
        $("#actionDiv").html(
          `<a role="button" href='' style="float: center;" onclick="setupGame('publish', '${recordType}');" class="btn btn-brand-light btn-block">Publish ${quizOrVote}</a>`
        );
      }

      if (data.questions && data.questions.length) {
        let rows = isQuiz ? getQuizRows(data) : getVoteRows(data);
        $("#ls").append(rows);
      }
    }
  });
}

/**
 * Designed for internal use. Use externally at your own risk
 * @param {*} data
 */
function getVoteRows(data) {
  //var qid = 1;
  let rows = `<div class="col-md-12 my-card p-1 mt-2">
                <div class="row">
                    <div class="col-12">
                        <div class="row d-flex align-items-center">
                            <div class="col-1">
                                <span class="font-small text-secondary" style="font-weight: bold">#</span>
                            </div>
                            <div class="col-6">
                                <span class="font-small text-secondary" style="font-weight: bold">Vote Question</span>
                            </div>
                            <div class="col-2">
                                <span class="font-small text-secondary" style="font-weight: bold">Time Limit</span>
                            </div>
                            <div class="col-2"></div>
                            <div class="col-1"></div>
                        </div>
                    </div>
                </div>
            </div>`;
  $.each(data.questions, function(key, val) {
    rows += `
        <div class="col-md-12 my-card p-3 mt-2">
            <div class="row">
                <div class="col-12">
                    <div class="row d-flex align-items-center">
                        <div class="col-1">
                            <h5>${key + 1}</h5>
                        </div>
                        <div class="col-6">
                            <h5>${val.question}</h5>
                        </div>
                        <div class="col-1 text-right">
                            <span class="font-small text-secondary">${
                              val.timeLimit
                            } sec<br /></span>
                        </div>
                        <div class="col-2">
                            <button class="btn btn-danger btn-sm btn-block" onclick="deleteId(${
                              val.id
                            }, 'vote');">Delete</button>
                        </div>
                        <div class="col-2">
                            <a role="button" class="btn btn-info btn-sm btn-block" href="addeditquestions.html?questionId=${
                              val.id
                            }&title=${data.title}&desc=${data.description}&id=${data.id}">Edit</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
  });

  return rows;
}

/**
 * Designed for internal use. Use externally at your own risk
 * @param {*} data
 */
function getQuizRows(data) {
  //let qid = 1;
  let rows = `<div class="col-md-12 my-card p-1 mt-2">
                <div class="row">
                    <div class="col-12">
                        <div class="row d-flex align-items-center">
                            <div class="col-1">
                                <span class="font-small text-secondary" style="font-weight: bold">#</span>
                            </div>
                            <div class="col-4">
                                <span class="font-small text-secondary" style="font-weight: bold">Quiz Question</span>
                            </div>
                            <div class="col-2 text-right">
                                <span class="font-small text-secondary" style="font-weight: bold">Time Limit</span>
                            </div>
                            <div class="col-2">
                                <span class="font-small text-secondary" style="font-weight: bold">Correct Option</span>
                            </div>
                            <div class="col-2"></div>
                            <div class="col-1"></div>
                        </div>
                    </div>
                </div>
            </div>`;
  $.each(data.questions, function(key, val) {
    rows += `
        <div class="col-md-12 my-card p-3 mt-2">
            <div class="row">
                <div class="col-12">
                    <div class="row d-flex align-items-center">
                        <div class="col-1">
                            <h5>${key + 1}</h5>
                        </div>
                        <div class="col-5">
                            <h5>${val.question}</h5>
                        </div>
                        <div class="col-1 text-right">
                            <span class="font-small text-secondary">${
                              val.timeLimit
                            } sec<br /></span>
                        </div>
                        <div class="col-1">
                            <span class="font-small text-secondary">Option ${
                              val.correctOptions
                            }</span>
                        </div>
                        <div class="col-2">
                            <button class="btn btn-danger btn-sm btn-block" onclick="deleteId(${
                              val.id
                            }, 'quiz');">Delete</button>
                        </div>
                        <div class="col-2">
                            <a role="button" class="btn btn-info btn-sm btn-block" href="addeditquestions.html?questionId=${
                              val.id
                            }&title=${data.title}&desc=${data.description}&id=${data.id}">Edit</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
  });

  return rows;
}

/**
 *
 * @param {*} actionType 'unpublish' or 'publish'
 * @param {*} recordType 'quiz' or 'vote'
 */
function setupGame(actionType, recordType) {
  if (confirm(`Are you sure you want to ${actionType} this ${recordType}?`)) {
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
        $("#result").show();
        $("#result").html("Error - " + data.statusText);
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
      $("#result").html(data.statusText);
    },
    success: function(data) {
      //NB: 'id' querystring key refers to the quiz/survey id; NOT the question id
      window.location = `details.html?id=${data.id}`;
    }
  });
}
