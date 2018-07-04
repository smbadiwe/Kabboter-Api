function loadNextQuestion(e) {
  e.preventDefault();
  getNextQuestion();
  // $("#disquest").hide();
  // $("populate").show();

  // timeOut();
}

function showquest(e) {
  e.preventDefault();
  $("div#showpin").hide();
  $("div#disquest").show();
}

function setGameQuestionPropsOnPage(gamequestion) {
  // This is a question object as defined in the API doc.
  //TODO: Render fields as you would like it.
  console.log("setGameQuestionPropsOnPage. gamequestion = ");
  console.log(gamequestion);
  if (gamequestion) {
    $("#timeout").hide();
    $("div#youranswer").hide();
    $("#disquest").show();
    // quizRunInfo = { id: <the quizRun id>, quizId: quizId, pin: pin, totalQuestions: totalQuestions };
    let currentQuestionCount = 1 + (parseInt($("#gamenum").html()) || 0);
    // console.log("currentQuestionCount = " + currentQuestionCount + ". quizquestion: ");
    // console.log(quizquestion);
    $("#gamenum").html(currentQuestionCount);
    $("#gametotal").html($("#gametotalqns").html());

    $("#quest").html(gamequestion.question);
    $("#opt1").html(gamequestion.option1);
    $("#opt2").html(gamequestion.option2);
    $("#opt3").html(gamequestion.option3);
    $("#opt4").html(gamequestion.option4);
    startAdminCountDown(gamequestion.timeLimit);
  } else {
    $("#step1").hide();
    $("#step2").hide();
    $("#end").show();
  }
}

function startAdminCountDown(maxCount = 20) {
  $("#timekeeper").show();
  $("#timer").html(maxCount);
  $("#maxTimeCount").html(maxCount);
  const counter = setInterval(function() {
    if (maxCount > 0) {
      $("#timer").html(maxCount);
      maxCount--;
    } else {
      clearInterval(counter);
      $("#timer").html("Time up!");

      $("div#disquest").hide();
      $("div#timeout").show();
    }
  }, 1000);
}

/**
 * Call for the relevant list of games (quizzes or surveys) and render result to a dropdownlist.
 * @param {*} recordType "quizzes" or "surveys"
 */
function loadGameDropdownList(recordType) {
  $("div#step2").hide();
  $("div#disquest").hide();
  $("div#scoreboard").hide();
  $("div#results").hide();
  const baseUrl = window.location.origin;
  const url = baseUrl + `/api/user/${recordType}/published`;
  $.ajax({
    type: "GET",
    url: url,
    beforeSend: setAuthToken,
    success: function(result) {
      if (result && result.length) {
        console.log("Number of items gotten from " + url);
        console.log(result.length);
        let options = "";
        result.forEach(function(r) {
          options += '<option value="' + r.id + '">' + r.title + "</option>";
        });
        $("#gamelist").html(options);
      } else {
        const quizOrVote = recordType === "quizzes" ? "quiz" : "vote";
        alert(`No published ${recordType} yet. You will need to publish a few.`);
        window.location = `/pages/${quizOrVote}/${quizOrVote}.html`;
      }
    },
    error: function(error) {
      console.log(error);
      $("#result").show();
      $("#result").html(error.statusText);
    },
    complete: function(data) {
      onAfterLoadingGameList();
    }
  });
}

function setLoginInfo() {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  if (!userInfo) {
    logOut();
  } else {
    $("#dis-name").html(`${userInfo.f} ${userInfo.l}`);
  }
}

function logOut(e) {
  e.preventDefault();
  e.stopPropagation();
  localStorage.removeItem("token");
  localStorage.removeItem("userInfo");
  window.location.href = `${window.location.origin}/login.html`;
}

function onAfterLoadingGameList() {
  setLoginInfo();

  loadNavBar();
  const id = getUrlParameter("id");
  if (id) {
    console.log("onAfterLoadingGameList: Setting gamelist val to: " + id);
    $("#gamelist").val(id);
    console.log("onAfterLoadingGameList: Done setting gamelist val: " + $("#gamelist").val());
  }
}
