(function(glob) {
  glob.GamePlayerData = {};
})(this); // 'this' will be 'window' or 'module' or ... depending on the client

/**
 * Sample callback function to pass to socket. Socket will call it if anything goes wrong with our .emit request.
 * @param {*} errorMessage A string describing the error
 */
function callbackOnGamePlayerError(errorMessage) {
  if (errorMessage === "Error: websocket error") errorMessage = "Player disconnected.";
  alert(errorMessage);
}

/**
 * The method runs when a quiz or survey player clicks Start Game button after PIN is gotten.
 * @param {*} e The button event
 * @param {*} game 'quiz' or 'survey'
 */
function startGamePlay(e, game) {
  e.preventDefault();

  const pin = $("#pin")
    .val()
    .trim();
  if (!pin) {
    alert("Game code not set.");
    return;
  }
  const username = $("#username")
    .val()
    .trim();
  const lastname = $("#lastname")
    .val()
    .trim();
  const firstname = $("#firstname")
    .val()
    .trim();
  const email = $("#email")
    .val()
    .trim();
  const phone = $("#phone")
    .val()
    .trim();
  if (!username) {
    if (!lastname) {
      alert("Last name not set.");
      return;
    }
    if (!firstname) {
      alert("First name not set.");
      return;
    }
    if (!email && !phone) {
      alert(
        "We need at least one way to contact you. So give us either email address or phone number"
      );
      return;
    }
  }

  console.log("calling onGetPlayPin: PIN = " + pin);
  const playerInfo = {
    pin: pin,
    username: username,
    lastname: lastname,
    firstname: firstname,
    email: email,
    phone: phone
  };
  console.log(playerInfo);
  onGetPlayPin(playerInfo, game);
}

//  data = { pin: pin }
function onGetPlayerGameRunInfo(data) {
  console.log("onGetPlayerGameRunInfo: data = ");
  console.log(data);
  // if we're still in the start page, set the pin
  if ($("input#pin").length) {
    $("input#pin").val(data.pin);
  }
}

let answered = false;
/**
 *
 * @param {*} question The question
 */
function onPlayerReceiveNextQuestion(question) {
  const game = question.recordType; //Values: 'quiz' or 'survey'
  // This is a question object as defined in the API doc.
  // Render fields on a page as you would like it. Depending, you may,
  // want to only render the answers. Whatever!
  console.log("onPlayerReceiveNextQuestion. " + game + "question = ");
  console.log(question);
  if (question) {
    try {
      answered = false;
      $("#youranswer").hide();
      $("#timeoutBox").hide();
      $("#optionsBox").show();

      let currentQuestionCount = question.Number;
      if (!currentQuestionCount) currentQuestionCount = 1 + (parseInt($("#gamenum").html()) || 0);
      $("#gamenum").html(currentQuestionCount);

      $("#question").html(question.question);
      if (game === "quiz") $("#qnPoints").html(question.points);

      // Enable the buttons
      $("#option1").prop("disabled", false);
      $("#option2").prop("disabled", false);
      $("#option3").prop("disabled", false);
      $("#option4").prop("disabled", false);

      GamePlayerData[game + "question"] = question;
      startPlayerCountDown(game, question.timeLimit);
    } catch (e) {
      console.log(e);
      if (confirm(e.message + "\nDo you want to refresh and start game afresh?")) {
        reloadPage();
      } else {
        window.location = "/";
      }
    }
  } else {
    showPlayerEndViewAndClearStorage(game);
  }
}

function showPlayerEndViewAndClearStorage(game) {
  $("#login").hide();
  $("#game").hide();
  $("#feedback").show();
  $("#feedbackText").html("That's all! Thank you for participating.");

  GamePlayerData[game + "PlayerInfo"] = undefined;
  GamePlayerData[game + "question"] = undefined;
  GamePlayerData["moderator"] = undefined;
}

function startPlayerCountDown(game, maxCount = 20) {
  $("#timekeeper").show();
  $("#timer").html(maxCount);
  $("#maxTimeCount").html(maxCount);
  const counter = setInterval(function() {
    if (answered || maxCount === 0) {
      clearInterval(counter);
      if ($("#gametotal").html() === $("#gamenum").html()) {
        // it means we've exhausted our list of questions. So...
        showPlayerEndViewAndClearStorage(game);
      } else {
        $("#option1").prop("disabled", true);
        $("#option2").prop("disabled", true);
        $("#option3").prop("disabled", true);
        $("#option4").prop("disabled", true);
        if (maxCount === 0) {
          $("#timer").html("Time up!");

          const qn = GamePlayerData[game + "question"];
          if (game === "quiz") {
            $("#theAns").html(getAnswerChoiceLetter(+qn.correctOptions) || "-");
          }
          $("#optionsBox").hide();
          $("#timeoutBox").show();
        }
      }
    } else {
      $("#timer").html(maxCount);
      maxCount--;
    }
  }, 1000);
}

function getAnswerChoiceLetter(choiceAsNumber) {
  switch (choiceAsNumber) {
    case 1:
      return "A";
    case 2:
      return "B";
    case 3:
      return "C";
    case 4:
      return "D";
  }
  return undefined;
}

function submitAmswerChoice(event) {
  event.preventDefault();
  event.stopPropagation();
  const id = $(this).attr("id") || "option0";
  const choice = parseInt(id.substr(id.length - 1)); // value will be 1,2,3 or 4
  if (!choice) {
    alert("Please select an answer again");
    console.log(
      `We failed to get the user's answer choice. We read ansChosen = ${ansChosen} from btn id = ${id}`
    );
    return false;
  }
  answered = true;
  // Disable the buttons
  $("#option1").prop("disabled", true);
  $("#option2").prop("disabled", true);
  $("#option3").prop("disabled", true);
  $("#option4").prop("disabled", true);

  const maxTimeCount = parseInt($("#maxTimeCount").html()) || 20;
  let timeCount = parseInt($("#timer").html()) || 0;
  timeCount = maxTimeCount - timeCount;

  // hide counter div
  $("#timekeeper").hide();

  const ansChosen = getAnswerChoiceLetter(choice);
  if (!ansChosen) {
    alert("Code Error. So sorry you can't continue playing the game at this time.");
    console.log(
      `We failed to get the user's answer choice. We read ansChosen = ${ansChosen} from btn id = ${id}`
    );
    return false;
  }
  $("#youranswer").show();
  $("#youranswer").html("Your answer: " + ansChosen);
  const answerInfo = {
    timeCount: timeCount,
    choice: choice
  };

  const game = $("#optionsBox").attr("gameType");
  // This method has different implementations, depending on whether we're using pusher or socket.io
  submitAnswer(answerInfo, game);
}

/**
 * @param {*} gameInfo
 * playerInfo: {
 *  pin: xxx,
 *  id: userId,
 *  lastname: xxx,
 *  firstname: xxx,
 *  username: xxx
 * }
 * @param {*} game 'quiz' or 'survey'
 */
function onAuthSuccess(gameInfo, game) {
  // Show the view where user can answer the questions.
  console.log(game + " onAuthSuccess called with feedback: ");
  console.log(gameInfo);

  GamePlayerData[game + "PlayerInfo"] = gameInfo.userInfo;
  GamePlayerData["moderator"] = gameInfo.moderator;

  showAnswerViewOnAuthSuccess(gameInfo);
}

/**
 * userInfo: {
 *  pin: xxx,
 *  i: userId,
 *  l: lastname,
 *  f: firstname,
 *  u: username
 * }
 * @param {*} data
 */
function showAnswerViewOnAuthSuccess(data) {
  // Show the view where user can answer the questions.
  //NB: Redirecting closes the socket. So, don't.
  //$("#register").hide();
  const playerInfo = data.userInfo;
  $("#login").hide();
  $("#game").show();
  $("#timeout").hide();

  $("#nplayers").html(0);
  $("#gametotal").html(data.totalQuestions);
  $("span#pin").html(playerInfo.pin);
  $("span#gameplayer").html(playerInfo.u + " - " + playerInfo.f + " " + playerInfo.l);
}

$(function() {
  $("a#newplayer").click(function(e) {
    e.preventDefault();
    e.stopPropagation();
    $("#enterusername").hide();
    $("#username").val("");

    $("#register").show();
    $("#startgamebtn").show();
  });
  $("a#existingplayer").click(function(e) {
    e.preventDefault();
    e.stopPropagation();
    $("#register").hide();
    $("#firstname").val("");
    $("#lastname").val("");
    $("#email").val("");
    $("#phone").val("");

    $("#enterusername").show();
    $("#startgamebtn").show();
  });

  $("button.question").click(submitAmswerChoice);
});
