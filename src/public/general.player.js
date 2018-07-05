/**
 * The method runs when a quiz or survey player clicks Start Game button after PIN is gotten.
 * @param {*} e The button event
 */
function startGamePlay(e) {
  e.preventDefault();

  const pin = $("#pin").val();
  if (!pin) {
    alert("Game code not set.");
    return;
  }
  const username = $("#username").val();
  const lastname = $("#lastname").val();
  const firstname = $("#firstname").val();
  const email = $("#email").val();
  const phone = $("#phone").val();
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

  // if there's pin, there'll be moderator
  const moderator = JSON.parse(localStorage.getItem("moderator"));
  if (
    (phone && moderator.p === phone) ||
    (email && moderator.e === email) ||
    (username && moderator.u === username)
  ) {
    alert("No cheating. You can't play in a game that you're also the moderator");
    return;
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

//  data = { pin: pin, userInfo: userInfo }
function onGetPlayerGameRunInfo(data) {
  console.log("onGetPlayerGameRunInfo: data = ");
  console.log(data);
  localStorage.setItem("moderator", JSON.stringify(data.userInfo));
  // if we're still in the start page, set the pin
  if ($("input#pin").length) {
    $("input#pin").val(data.pin);
  }
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
      $("div#youranswer").hide();
      $("#question").html(question.question);
      // Enable the buttons
      $("#option1").prop("disabled", false);
      $("#option2").prop("disabled", false);
      $("#option3").prop("disabled", false);
      $("#option4").prop("disabled", false);

      localStorage.setItem(game + "question", JSON.stringify(question));
      startPlayerCountDown(question.timeLimit);
    } catch (e) {
      console.log(e);
      $("#error").html(e);
    }
  } else {
    $("#login").hide();
    $("#game").hide();
    $("#feedback").show();
    $("#feedbackText").html("That's all! Thank you for participating.");
    localStorage.removeItem(game + "question");
    localStorage.removeItem(game + "PlayerInfo");
    localStorage.removeItem(game + "pin");
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
  }
}

function startPlayerCountDown(maxCount = 20) {
  $("#timekeeper").show();
  $("#timer").html(maxCount);
  $("#maxTimeCount").html(maxCount);
  const counter = setInterval(function() {
    if (answered || maxCount === 0) {
      clearInterval(counter);

      $("#option1").prop("disabled", true);
      $("#option2").prop("disabled", true);
      $("#option3").prop("disabled", true);
      $("#option4").prop("disabled", true);
      if (maxCount === 0) {
        alert("Time up!");
        $("#timer").html("Time up!");
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

  const maxTimeCount = parseInt($("div#maxTimeCount").html()) || 20;
  let timeCount = parseInt($("div#timer").html()) || 0;
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
  $("div#youranswer").show();
  $("div#youranswer").html("Your answer: " + ansChosen);
  const answerInfo = {
    timeCount: timeCount,
    choice: choice
  };
  submitAnswer(answerInfo);
}

/**
 * playerInfo: {
 *  pin: xxx,
 *  id: userId,
 *  lastname: xxx,
 *  firstname: xxx,
 *  username: xxx
 * }
 * @param {*} playerInfo
 */
// Treated and used.
function showAnswerViewOnAuthSuccess(playerInfo) {
  // Show the view where user can answer the questions.
  //NB: Redirecting closes the socket. So, don't.
  //$("div#register").hide();
  $("div#login").hide();
  $("div#game").show();
  $("div#timeout").hide();

  $("span#pin").html(playerInfo.pin);
  $("span#gameplayer").html(
    playerInfo.username + " - " + playerInfo.firstname + " " + playerInfo.lastname
  );
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
    $("div#register").show();
    $("div#enterusername").hide();
    $("div#startgamebtn").show();
  });
  $("a#existingplayer").click(function(e) {
    e.preventDefault();
    e.stopPropagation();
    $("div#register").hide();
    $("div#enterusername").show();
    $("div#startgamebtn").show();
  });

  $("button.question").click(submitAmswerChoice);
});
