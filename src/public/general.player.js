/**
 * The method runs when a quiz or survey player clicks Start Game button after PIN is gotten.
 * @param {*} e The button event
 */
function startGamePlay(e) {
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
  onGetPlayPin(playerInfo);
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

function onPlayerDisconnect(socket, reason, recordType) {
  console.log(recordType + " onPlayerDisconnect: reason - " + reason);
  localStorage.removeItem(recordType + "PlayerInfo");
  localStorage.removeItem(recordType + "question");
  localStorage.removeItem("moderator");
  // See https://github.com/socketio/socket.io-client/blob/HEAD/docs/API.md#socketdisconnect
  if (reason === "io server disconnect") {
    // the disconnection was initiated by the server. If you need to reconnect manually, call
    // socket.connect();
    alert("Disconnected from server. Refresh page to start afresh and reconnect.");
  }
  // else the socket will automatically try to reconnect
  //TODO: Tell admin that someone just disconnected
}

let answered = false;
/**
 *
 * @param {*} question The question
 * @param {*} game Values: 'quiz' or 'survey'
 */
function onPlayerReceiveNextQuestion(question, game) {
  // This is a question object as defined in the API doc.
  // Render fields on a page as you would like it. Depending, you may,
  // want to only render the answers. Whatever!
  console.log("onPlayerReceiveNextQuestion. " + game + "question = ");
  console.log(question);
  if (question) {
    try {
      answered = false;
      $("#youranswer").hide();

      let currentQuestionCount = question.Number;
      if (!currentQuestionCount) currentQuestionCount = 1 + (parseInt($("#gamenum").html()) || 0);
      $("#gamenum").html(currentQuestionCount);

      $("#question").html(question.question);
      $("#qnPoints").html(question.points);
      // Enable the buttons
      $("#option1").prop("disabled", false);
      $("#option2").prop("disabled", false);
      $("#option3").prop("disabled", false);
      $("#option4").prop("disabled", false);

      localStorage.setItem(game + "question", JSON.stringify(question));
      startPlayerCountDown(game, question.timeLimit);
    } catch (e) {
      console.log(e);
      $("#error").html(e);
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
  localStorage.removeItem(game + "question");
  localStorage.removeItem(game + "PlayerInfo");
  localStorage.removeItem(game + "pin");
  localStorage.removeItem("token");
  localStorage.removeItem("userInfo");
  localStorage.removeItem("moderator");
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
          alert("Time up!");
          $("#timer").html("Time up!");
        }
      }
    } else {
      $("#timer").html(maxCount);
      maxCount--;
    }
  }, 1000);
}

function submitAmswerChoice(event) {
  answered = true;
  event.preventDefault();
  event.stopPropagation();
  const id = event.target.id;

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

  const choice = parseInt(id.substr(id.length - 1)); // value will be 1,2,3 or 4

  let ansChosen;
  switch (choice) {
    case 1:
      ansChosen = "A";
      break;
    case 2:
      ansChosen = "B";
      break;
    case 3:
      ansChosen = "C";
      break;
    case 4:
      ansChosen = "D";
      break;
  }
  $("#youranswer").show();
  $("#youranswer").html("Your answer: " + ansChosen);
  const answerInfo = {
    timeCount: timeCount,
    choice: choice
  };
  submitAnswer(answerInfo);
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

  localStorage.setItem(game + "PlayerInfo", JSON.stringify(gameInfo.userInfo));
  localStorage.setItem("moderator", JSON.stringify(gameInfo.moderator));
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

/**
 * Sample callback function to pass to socket. Socket will call it if anything goes wrong with our .emit request.
 * @param {*} errorMessage A string describing the error
 */
function callbackOnGamePlayerError(errorMessage) {
  alert(errorMessage);
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
