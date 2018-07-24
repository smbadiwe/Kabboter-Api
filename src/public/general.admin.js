(function(glob) {
  glob.GameAdminData = {};
})(this); // 'this' will be 'window' or 'module' or ... depending on the client

function onPlayerSubmittedAnswer(data, game) {
  //data: {
  //     questionId: data.quizQuestionId,
  //     choice: data.choice
  // }
  // We use this info to update dashboard. That dashboard where you show
  // chart of the different options and how many players chose each.
  data.choice = +data.choice;
  data.questionId = +data.questionId;
  console.log("From " + game + " onPlayerSubmittedAnswer fn. data:");
  console.log(data);
  if (data && data.choice) {
    const tally = GameAdminData[game + "question"];
    console.log(tally);
    if (tally.id === data.questionId) {
      tally["answer" + data.choice] = tally["answer" + data.choice] + 1;
      GameAdminData[game + "question"] = tally;
      console.log(GameAdminData[game + "question"]);
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

    const data = GameAdminData[game + "question"];
    console.log("scoreboard: data for chart = ");
    console.log(data);
    /*
        Appends our questions and options to our views on the SCOREBOARD.HTML file
      */
    $("#scoreboard #option1").html(data.option1);
    $("#scoreboard #option2").html(data.option2);
    $("#scoreboard #option3").html(data.option3);
    $("#scoreboard #option4").html(data.option4);
    $("#scoreboard #question").html(data.question);
    if (game === "quiz") {
      $("#scoreboard #answer").show();
      $("#scoreboard #answer").html(
        `Answer: <strong>${data["option" + data.correctOptions]}</strong>`
      );
    }
    /*
        Displays graph of selected questions or surveys on the users top screen
        ANSWERS ON THE Y-AXIS
        OPTIONS ON THE X-AXIS
    */

    // if(data == null){
    //   alert('data is null')
    // }else{

    var ctx = document.getElementById("graph-div").getContext("2d");
    var chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: [data.option1, data.option2, data.option3, data.option4],
        datasets: [
          {
            data: [data.answer1, data.answer2, data.answer3, data.answer4], //These are tallies showing how many people chose a particular option
            backgroundColor: ["aqua", "red", "palevioletred", "yellow"]
          }
        ]
      },
      options: {
        legend: {
          display: false
        },
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
                stepSize: 1
              }
            }
          ]
        }
      }
    });

    // }
  });
}

function loadNextQuestion(e, game) {
  e.preventDefault();

  const gameRunInfo = getGameRunInfo(game);
  const answeredQuestionIds = GameAdminData["answeredquestionlist"];
  $.ajax({
    beforeSend: setAuthToken,
    url: `/api/user/${game}runs/getnextquestion`,
    type: "POST",
    data: {
      gameRunInfo: gameRunInfo,
      answeredQuestionIds: answeredQuestionIds
    },
    error: callbackOnGameAdminError
  });
}

function showquest(e) {
  e.preventDefault();
  $("#showpin").hide();
  $("#qnShell").show();
  $("#disquest").show();
  $("#loadQuestion").click();
}

/**
 *
 * @param {*} gamequestion
 */
function onReceiveNextQuestion(gamequestion) {
  const game = gamequestion.recordType; //'quiz' or 'survey'
  if (gamequestion) {
    // Use these 'answerX' values to tally how players answered
    gamequestion.answer1 = 0;
    gamequestion.answer2 = 0;
    gamequestion.answer3 = 0;
    gamequestion.answer4 = 0;
    GameAdminData[game + "question"] = gamequestion;
    updateAnsweredQuestionsList(gamequestion.id);
  }
  setGameQuestionPropsOnPage(gamequestion, game);
}

function updateAnsweredQuestionsList(newQuestionId) {
  //TODO: If you so desire, use this to update count or list of answered question.
  // Note that the code commented out is not tested and probably buggy.
  if (newQuestionId) {
    newQuestionId = +newQuestionId;
    let list = GameAdminData["answeredquestionlist"];
    if (list) {
      GameAdminData["answeredquestionlist"].push(newQuestionId);
    } else {
      GameAdminData["answeredquestionlist"] = [newQuestionId];
    }
  }
}

/**
 *
 * @param {*} gamequestion
 * @param {*} game 'quiz' or 'survey'
 */
function setGameQuestionPropsOnPage(gamequestion, game) {
  // This is a question object as defined in the API doc.
  // Render fields as you would like it.
  console.log("setGameQuestionPropsOnPage. gamequestion = ");
  console.log(gamequestion);
  if (gamequestion) {
    // quizRunInfo = { id: <the quizRun id>, quizId: quizId, pin: pin, totalQuestions: totalQuestions };
    let currentQuestionCount = 1 + (parseInt($("#gamenum").html()) || 0);
    $("#gamenum").html(currentQuestionCount);

    $("#quest").html(gamequestion.question);
    $("#opt1").html(gamequestion.option1);
    $("#opt2").html(gamequestion.option2);
    $("#opt3").html(gamequestion.option3);
    $("#opt4").html(gamequestion.option4);

    $("#timeout").hide();
    $("#disquest").show();
    startAdminCountDown(game, gamequestion.timeLimit);
  } else {
    showAdminEndView(game);
  }
}

function showAdminEndView(game) {
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
        $("#loadQuestion").hide();
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

function onAfterLoadingGameList() {
  loadNavBar();
  const id = getUrlParameter("id");
  if (id) {
    console.log("onAfterLoadingGameList: Setting gamelist val to: " + id);
    $("#gamelist").val(id);
    console.log("onAfterLoadingGameList: Done setting gamelist val: " + $("#gamelist").val());
  }
}

/**
 * Shut the whole game down. Should be called by a button at the 'end' page
 * @param {*} game
 */
function endGame(game) {
  clearAdminGameStorages(game);
  // TODO: emit event to close all player sockets
  window.location = "/pages/dashboard.html";
}

/**
 * Clear all storage data associated with game playing.
 * Sync up with the code at src\public\js\app.js
 * @param {*} game 'quiz' or 'survey'
 */
function clearAdminGameStorages(game) {
  GameAdminData[game + "runinfo"] = undefined;
  GameAdminData[game + "question"] = undefined;
  GameAdminData["answeredquestionlist"] = undefined;
  GameAdminData["userData"] = undefined;
}

/**
 *
 * @param {*} payload  = {
 *   nPlayers: nPlayers,
 *   newPlayer: data.userInfo, // the user that joined
 *   pin: data.pin
 * };
 * @param {*} game 'quiz' or 'survey'
 */
function onWhenSomeoneJustJoined(payload, game) {
  console.log("onWhenSomeoneJustJoined. payload = ");
  console.log(payload);

  $("#nplayers").html(payload.nPlayers);
  const gameRunInfo = getGameRunInfo(game);

  const limit = 10;
  const thePlayer = `[${payload.newPlayer.u}] ${payload.newPlayer.f}`;
  if (!gameRunInfo.lastXPlayers) {
    gameRunInfo.lastXPlayers = [thePlayer];
  } else {
    // if it's not in the list
    if (gameRunInfo.lastXPlayers.indexOf(thePlayer) < 0) {
      gameRunInfo.lastXPlayers.unshift(thePlayer); // add to front
    }

    const limitWithBuffer = limit + Math.ceil(limit / 2);
    if (gameRunInfo.lastXPlayers.length > limitWithBuffer) {
      gameRunInfo.lastXPlayers = gameRunInfo.lastXPlayers.slice(0, limitWithBuffer);
    }
  }

  renderPlayerListRows(gameRunInfo.lastXPlayers, limit);

  setGameRunInfo(game, gameRunInfo);
}

/**
 *
 * @param {*} payload  = {
 *   nPlayers: nPlayers,
 *   newPlayer: data.userInfo, // the user that joined
 *   pin: data.pin
 * };
 * @param {*} game 'quiz' or 'survey'
 */
function onWhenSomeoneJustLeft(payload, game) {
  console.log("onWhenSomeoneJustLeft. payload = ");
  console.log(payload);

  $("#nplayers").html(payload.nPlayers);
  const gameRunInfo = getGameRunInfo(game);
  if (gameRunInfo.lastXPlayers) {
    const limit = 10;
    const thePlayer = `[${payload.newPlayer.u}] ${payload.newPlayer.f}`;

    // remove from list
    const index = gameRunInfo.lastXPlayers.indexOf(thePlayer);
    if (index > -1) {
      gameRunInfo.lastXPlayers.splice(index, 1);
    }

    renderPlayerListRows(gameRunInfo.lastXPlayers, limit);

    if (gameRunInfo.lastXPlayers.length === limit) {
      //TODO: Call for more players to store as buffer on client.
    }
  }
}

function renderPlayerListRows(lastXPlayers, limit) {
  console.log("calling renderPlayerListRows. list = ");
  console.log(lastXPlayers);
  let rows = "";
  for (let i = 0; i < lastXPlayers.length; i++) {
    if (i === limit) break;
    rows += `<div class="row d-flex my-card p-1 mt-2 align-items-center">${lastXPlayers[i]}</div>`;
  }

  $("#members").html(rows);
}

/* Socket Stuffs */

/**
 *
 * @param {*} socket
 * @param {*} reason
 * @param {*} game 'quiz' or 'survey'
 */
function onAdminDisconnected(reason, game) {
  clearAdminGameStorages(game);
  // if (reason === "io server disconnect") {
  //   // the disconnection was initiated by the server, you need to reconnect manually
  //   alert(
  //     "Server disconnected you do to authentication failure. We'll try reconnecting. If you're not reconnected, refresh the page to start over."
  //   );
  //   socket.connect();
  // }
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
  setGameRunInfo(game, info);
  $("div#step1").hide();
  $("div#step2").show();
  $("#pin").html(info.pin);
  $("#gamecode").html(info.pin);
  $("#nplayers").html(0);
  $("#gametotal").html(info.totalQuestions);

  $("#gametitle").html(info.gametitle);
  $("#gamedescription").html(info.gamedescription);
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
  const info = GameAdminData[game + "runinfo"];
  if (!info) throw new Error(game + "runinfo not yet created");

  return info;
}

function setGameRunInfo(game, valueAsJson) {
  GameAdminData[game + "runinfo"] = valueAsJson;
}

function callbackOnGameAdminError(errorMessage) {
  if (errorMessage === "Error: websocket error") errorMessage = "Player disconnected.";
  alert(errorMessage);
}

function setupGeneralChannel(game) {
  channel = pusher.subscribe(`${game}-admin`);

  channel.bind("error", callbackOnGameAdminError);

  channel.bind("disconnect", function(reason) {
    onAdminDisconnected(reason, game);
  });
}

/**
 * Call this function as soon as you can on page load.
 * The URL loading the page MUST pass pin via querystring, with key: 'pin'
 *
 * @param {*} pin
 * @param {*} totalQuestions
 * @param {*} game 'quiz' or 'survey'
 */
function authenticateGameAdmin(pin, totalQuestions, game) {
  // Server sends this info on successful login, as a JSON: { token: ..., user: {...} }
  // I'm assuming you saved it somewhere in local storage, with key: userInfo.
  const userInfo = getUserInfo();
  const auth = { pin: pin, totalQuestions: totalQuestions, userInfo: userInfo };
  console.log("sending auth data for auth. data: ");
  console.log(auth);
  $.ajax({
    type: "POST",
    url: `/api/user/${game}runs/authadmin`,
    data: auth,
    beforeSend: setAuthToken,
    error: function(error) {
      alert(error);
    },
    success: function(gameInfo) {
      console.log(`authenticateGameAdmin success. game = '${game}'. gameInfo = `);
      console.log(gameInfo);
      gameChannel = pusher.subscribe(`${game}admin-${pin}`);
      gameChannel.bind("receive-next-question", onReceiveNextQuestion);

      gameChannel.bind("player-sumbitted-answer", function(data) {
        onPlayerSubmittedAnswer(data, game);
      });

      gameChannel.bind("when-someone-just-joined", function(data) {
        onWhenSomeoneJustJoined(data, game);
      });

      gameChannel.bind("when-someone-just-left", function(data) {
        onWhenSomeoneJustLeft(data, game);
      });
    }
  });
}

/**
 * Called when a game is selected and button clicked.
 * @param {*} e
 */
function startGameAdmin(e, game) {
  e.preventDefault();
  const data = { gameId: $("#gamelist").val() };
  if (!data.gameId) {
    $("#result").show();
    $("#result").html(`Select ${game === "quiz" ? "quiz" : "vote"}`);
    return false;
  }
  console.log(`calling startGameAdmin for ${game} with data: `);
  console.log(data);
  const baseUrl = window.location.origin;
  $.ajax({
    type: "POST",
    url: baseUrl + `/api/user/${game}runs/create`,
    data: data,
    beforeSend: setAuthToken,
    success: function(info) {
      //TODO: We don't need a 2nd POST in authenticateQuizAdmin(...) since this is called after quizrun creation. Review
      authenticateGameAdmin(info.pin, info.totalQuestions, game);

      // info = { id: <the quizRun id>, quizId: quizId, pin: pin, totalQuestions: totalQuestions,quiztitle: quiztitle, quizdescription: quizdescription };
      SetGameRunInfoOnPage(info, game);
    },
    error: function(error) {
      console.log("Status: " + error.status + " Message: " + error.statusText);
      console.log(error);
    }
  });
}
