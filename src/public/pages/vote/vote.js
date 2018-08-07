function saveQuestion(e, refreshPage) {
  e.preventDefault();
  var surveyId = getUrlParameter("id");
  if (!surveyId) {
    window.location = "/pages/dashboard.html";
    return false;
  }
  var title = $("#question-title").val();
  if (!title) {
    $("#result").show();
    $("#result").html("Question is required");
    return false;
  }
  var time = $("#time").val();
  var option1 = $("#option1").val();
  if (!option1) {
    $("#result").show();
    $("#result").html("Option 2 is required");
    return false;
  }
  var option2 = $("#option2").val();
  if (!option2) {
    $("#result").show();
    $("#result").html("Option 1 is required");
    return false;
  }
  var option3 = $("#option3").val();
  var option4 = $("#option4").val();

  const token = localStorage.getItem("token");

  const questionId = getUrlParameter("questionId");
  const myUrl =
    window.location.origin + `/api/user/surveyquestions/${questionId ? "update" : "create"}`;

  $.ajax({
    headers: {
      Authorization: "Bearer " + token
    },
    url: myUrl,
    type: "post",
    data: {
      id: questionId,
      question: title,
      timeLimit: time,
      surveyId: surveyId,
      option1: option1,
      option2: option2,
      option3: option3,
      option4: option4
    },
    error: function(data) {
      console.log(data);
      $("#result").show();
      $("#result").html(data.statusText);
    },
    success: function(data) {
      if (refreshPage) {
        setTimeout(function() {
          window.location.reload(true);
        });
      } else {
        window.location = "details.html?id=" + surveyId;
      }
    }
  });
}

function initAddEditQuestions() {
  var surveyId = getUrlParameter("id");
  if (!surveyId) {
    window.location = "/pages/dashboard.html";
  } else {
    loadNavBar();
    $("#game-title").html(getUrlParameter("title"));
    $("#game-description").html(getUrlParameter("desc"));

    const questionId = getUrlParameter("questionId");
    if (questionId) {
      // means'we're editing question
      $("#actionType").html("Edit");
      const token = localStorage.getItem("token");
      $.ajax({
        headers: {
          Authorization: "Bearer " + token
        },
        url: window.location.origin + `/api/user/surveyquestions/${questionId}`,
        type: "GET",
        error: function(data) {
          console.log(data);
          alert(data.statusText);
          window.location = `details.html?id=${surveyId}`;
        },
        success: function(data) {
          //START HERE: set fields. Code below is VERY buggy
          $("#question-title").val(data.question);
          $("#time").val(data.timeLimit);
          $("#option1").val(data.option1);
          $("#option2").val(data.option2);
          $("#option3").val(data.option3);
          $("#option4").val(data.option4);
        }
      });
    } else {
      $("#actionType").html("Create");
      $("#saveAndAdd").show();
    }
  }
}

function editId(val) {
  window.location = `addedit.html?id=${val}`;
}

function loadData(page = 1) {
  var token = localStorage.getItem("token");
  var myUrl = window.location.origin + "/api/user/surveys/my";

  const queryData = {
    title: $("#search").val(),
    perPage: $("#perPage").val(),
    page: page
  };
  $.ajax({
    headers: {
      Authorization: "Bearer " + token
    },
    url: myUrl,
    type: "get",
    data: queryData,
    error: function(data) {
      console.log(data);
      $("#result").append("Error fetching votes");
    },
    success: function(data) {
      var rows = "";
      $.each(data.data, function(key, val) {
        const sno = data.pagination.from + key;

        let btnLink = val.published
          ? `<a href="/surveyadmin/surveyadmin.html?id=${
              val.id
            }" class="btn btn-success btn-block btn-sm">Play game</a>`
          : `<a href="details.html?id=${
              val.id
            }" class="btn btn-success btn-block btn-sm">Publish</a>`;
        rows += `<tr>
                            <td scope="row">${sno}</td>
                            <td>${val.title}</td>
                            <td>${val.description}</td>
                            <td>${
                              val.published
                                ? "<span style='font-weight: bold; color: green;'>Yes</span>"
                                : "<span style='font-weight: bold; color: red;'>No</span>"
                            }</td>
                            <td>${btnLink}</td>
                            <td><a href="details.html?id=${
                              val.id
                            }" class="btn btn-danger btn-block btn-sm">View details</a></td>
                        </tr>`;
      });
      $("table tbody").html(rows);

      // set paging narrative and nav buttons
      setPagingInfo(data.pagination);
    }
  });
}

function initVote() {
  loadNavBar();
  loadGridFooter();
  loadData();
  $("#search").on("input", function() {
    loadData();
  });
  $("#perPage").on("change", function() {
    loadData();
  });
  $("li.paginate_button").on("click", function() {
    if (!$(this).hasClass("disabled")) loadData(parseInt($(this).attr("pgInd")));
  });
}
