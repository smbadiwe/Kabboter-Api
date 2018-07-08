function onPlayerSubmittedAnswer(data, game) {
  //data: {
  //     questionId: data.quizQuestionId,
  //     choice: data.choice
  // }
  // We use this info to update dashboard. That dashboard where you show
  // chart of the different options and how many players chose each.
  console.log("From " + game + " onPlayerSubmittedAnswer fn. data:");
  console.log(data);
  if (data && data.choice && +data.choice) {
    const tally = JSON.parse(localStorage.getItem(game + "question"));
    if (tally.id === data.questionId) {
      tally["answer" + data.choice] = tally["answer" + data.choice] + 1;

      localStorage.setItem(game + "question", JSON.stringify(tally));
    }
  }
}

/**
 * This function displays the list of answers and options to a particular quiz or survey in graphical format...
 * NOTE: function is been used in the scoreboard.html file
 * @param {*} game 'quiz' or 'survey'
 */
function scoreboard(game) {
  $("#scoreboard").load("/pages/game/scoreboard.component.html", function() {
    $("#scoreboard").show();
    const data = JSON.parse(localStorage.getItem(game + "question"));
    /*
        Appends our questions and options to our views on the SCOREBOARD.HTML file
      */
    $("#scoreboard #option1").html(data.option1);
    $("#scoreboard #option2").html(data.option2);
    $("#scoreboard #option3").html(data.option3);
    $("#scoreboard #option4").html(data.option4);
    $("#scoreboard #question").html(data.question);
    /*
        Displays graph of selected questions or surveys on the users top screen
        ANSWERS ON THE Y-AXIS
        OPTIONS ON THE X-AXIS
    */
    var ctx = document.getElementById("graph-div").getContext("2d");
    var chart = new Chart(ctx, {
      type: "bar",

      data: {
        labels: [data.option1, data.option2, data.option3, data.option4],
        datasets: [
          {
            label: data.question,
            data: [data.answer1, data.answer2, data.answer3, data.answer4],
            backgroundColor: ["aqua", "red", "palevioletred", "yellow"]
          }
        ]
      },

      options: {}
    });
  });
}

function loadNextQuestion(e) {
  e.preventDefault();
  getNextQuestion();
  // $("#disquest").hide();
  // $("populate").show();

  // timeOut();
}

function showquest(e) {
  e.preventDefault();
  $("#showpin").hide();
  $("#disquest").show();
  $("#loadQuestion").click();
}

/**
 *
 * @param {*} gamequestion
 * @param {*} game 'quiz' or 'survey'
 */
function onReceiveNextQuestion(gamequestion, game) {
  if (gamequestion) {
    // Use this value to tally how players answered
    gamequestion.answer1 = 0;
    gamequestion.answer2 = 0;
    gamequestion.answer3 = 0;
    gamequestion.answer4 = 0;
    localStorage.setItem(game + "question", JSON.stringify(gamequestion));
    updateAnsweredQuestionsList(gamequestion.id);
  }
  setGameQuestionPropsOnPage(gamequestion, game);
}

function updateAnsweredQuestionsList(newQuestionId) {
  //TODO: If you so desire, use this to update count or list of answered question.
  // Note that the code commented out is not tested and probably buggy.
  let list = sessionStorage.getItem("answeredquestionlist");
  if (list) {
    sessionStorage.setItem("answeredquestionlist", `${list}${newQuestionId},`);
  } else {
    sessionStorage.setItem("answeredquestionlist", `${newQuestionId},`);
  }
}

/**
 *
 * @param {*} gamequestion
 * @param {*} game 'quiz' or 'survey'
 */
function setGameQuestionPropsOnPage(gamequestion, game) {
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
    $("#gamenum").html(currentQuestionCount);

    $("#quest").html(gamequestion.question);
    $("#opt1").html(gamequestion.option1);
    $("#opt2").html(gamequestion.option2);
    $("#opt3").html(gamequestion.option3);
    $("#opt4").html(gamequestion.option4);
    startAdminCountDown(game, gamequestion.timeLimit);
  } else {
    showAdminEndViewAndClearStorage(game);
  }
}

function showAdminEndViewAndClearStorage(game) {
  $("#step1").hide();
  $("#step2").hide();
  $("#end").show();
}

function startAdminCountDown(game, maxCount = 20) {
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
      $("#disquest").hide();
      $("#timeout").show();

      scoreboard(game);
      if ($("#gametotal").html() === $("#gamenum").html()) {
        // it means we've exhausted our list of questions. So...
        setTimeout(function() {
          showAdminEndViewAndClearStorage(game);
        }, 5000);
      }
    }
  }, 1000);
}

/**
 * Call for the relevant list of games (quizzes or surveys) and render result to a dropdownlist.
 * @param {*} recordType "quizzes" or "surveys"
 */
function loadGameDropdownList(recordType) {
  $("#step2").hide();
  $("#disquest").hide();
  $("#scoreboard").hide();
  $("#results").hide();
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

// function setLoginInfo() {
//   const userInfo = JSON.parse(localStorage.getItem("userInfo"));
//   if (!userInfo) {
//     logOut();
//   } else {
//     $("#dis-name").html(`${userInfo.f} ${userInfo.l}`);
//   }
// }

function onAfterLoadingGameList() {
  //setLoginInfo();

  loadNavBar();
  const id = getUrlParameter("id");
  if (id) {
    console.log("onAfterLoadingGameList: Setting gamelist val to: " + id);
    $("#gamelist").val(id);
    console.log("onAfterLoadingGameList: Done setting gamelist val: " + $("#gamelist").val());
  }
}

/**
 * Clear all storage data associated with game playing.
 * Sync up with the code at src\public\js\app.js
 * @param {*} game 'quiz' or 'survey'
 */
function clearAdminGameStorages(game) {
  localStorage.removeItem(game + "runinfo");
  localStorage.removeItem(game + "question");
  sessionStorage.removeItem("answeredquestionlist");
  sessionStorage.removeItem("userData");
}

function onWhenSomeoneJustJoined(payload) {
  console.log("onWhenSomeoneJustJoined. payload = ");
  console.log(payload);
  // payload = {
  //   nPlayers: nPlayers,
  //   topFive: topFive,
  //   newPlayer: data.userInfo,
  //   pin: data.pin
  // };
  // You get the total number of players still connecting
  // and a list of the top 5 to display on page.
  $("#nplayers").html(payload.nPlayers);
}

function onWhenSomeoneJustLeft(payload) {
  console.log("onWhenSomeoneJustLeft. payload = ");
  console.log(payload);
  // payload = {
  //   nPlayers: nPlayers,
  //   topFive: topFive,
  //   newPlayer: data.userInfo,
  //   pin: data.pin
  // };
  // You get the total number of players still connecting
  // and a list of the top 5 to display on page.
  $("#nplayers").html(payload.nPlayers);
}

/* Socket Stuffs */

/**
 *
 * @param {*} socket
 * @param {*} reason
 * @param {*} game 'quiz' or 'survey'
 */
function onAdminDisconnected(socket, reason, game) {
  clearAdminGameStorages(game);
  if (reason === "io server disconnect") {
    // the disconnection was initiated by the server, you need to reconnect manually
    alert(
      "Server disconnected you do to authentication failure. We'll try reconnecting. If you're not reconnected, refresh the page to start over."
    );
    socket.connect();
  }
  // else the socket will automatically try to reconnect
}

/**
 *
 * @param {*} info The data
 * @param {*} game 'quiz' or 'survey'
 */
function SetGameRunInfoOnPage(info, game) {
  clearAdminGameStorages(game);

  // info = { id: <the surveyRun id>, surveyId: surveyId, pin: pin, totalQuestions: totalQuestions,surveytitle: surveytitle, surveydescription: surveydescription };
  console.log("SetGameRunInfoOnPage. Game: " + game + ". info = ");
  console.log(info);
  localStorage.setItem(game + "runinfo", JSON.stringify(info));
  $("div#step1").hide();
  $("div#step2").show();
  $("#unum").html(info.pin);
  $("#nplayers").html(0);
  $("#gametotal").html(info.totalQuestions);

  if (game === "quiz") {
    $("#gametitle").html(info.quiztitle);
    $("#gamedescription").html(info.quizdescription);
  } else {
    $("#gametitle").html(info.surveytitle);
    $("#gamedescription").html(info.surveydescription);
  }
}

/**
 * return data: {
      gameRunId: res,
      gameId: record.quizId,
      gametitle: quiz.title,
      gamedescription: quiz.description,
      pin: pin,
      totalQuestions: totalQuestions
    }

 * @param {*} game 'quiz' or 'survey'
 */
function getGameRunInfo(game) {
  const info = localStorage.getItem(game + "runinfo");
  if (!info) throw new Error(game + "runinfo not yet created");

  return JSON.parse(info);
}

function callbackOnGameAdminError(errorMessage) {
  alert(errorMessage);
}

/**
 * @param {*} socket
 * @param {*} game 'quiz' or 'survey'
 */
function emitGetNextQuestionEvent(socket, game) {
  const gameRunInfo = getGameRunInfo(game);
  let answeredQuestionIds = [];
  const ids = sessionStorage.getItem("answeredquestionlist");
  if (ids) {
    const idsSplit = ids.split(",");
    idsSplit.forEach(i => {
      if (i) {
        answeredQuestionIds.push(+i);
      }
    });
  }
  socket.emit("get-next-question", gameRunInfo, answeredQuestionIds, callbackOnGameAdminError);
}
