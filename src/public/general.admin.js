function loadNextQuestion(e) {
  e.preventDefault();
  getNextQuestion();
  $("disquest").hide();
  $("populate").show();

  timeOut();
}

function showquest(e) {
  e.preventDefault();
  $("div#step2").hide();
  $("#disquest").show();
}

function timeOut() {
  var timer = setInterval(function() {
    var count = parseInt($("#timeLimit").html());
    if (count !== 0) {
      $("#timeLimit").html(count - 1);
    } else {
      clearInterval(timer);
      $("div#disquest").hide();
      $("div#timeout").show();
    }
  }, 1000);
}

function loadGameDropdownList(apiEndpoint) {
  $("div#step2").hide();
  $("div#disquest").hide();
  $("div#scoreboard").hide();
  $("div#results").hide();
  const baseUrl = window.location.origin;
  $.ajax({
    type: "GET",
    url: baseUrl + apiEndpoint,
    beforeSend: setAuthToken,
    success: function(result) {
      let options = "";
      if (result) {
        console.log("Nomber of items gotten from " + baseUrl + apiEndpoint);
        console.log(result.length);
        result.forEach(function(r) {
          options += '<option value="' + r.id + '">' + r.title + "</option>";
        });
      }
      $("#gamelist").html(options);
    },
    error: function(error) {
      console.log("Status: " + error.status + " Message: " + error.statusText);
      console.log(error);
    }
  });
}
