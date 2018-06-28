function loadNextQuestion(e) {
  e.preventDefault();
  getNextQuestion();
  $("disquest").hide();
  $("populate").show();
  // alert($('span#timeLimit').html());
  timeOut();
}

function showquest(e) {
  e.preventDefault();
  console.log();
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
    beforeSend: function(xhr) {
      const authToken = "Bearer " + getAuthToken();
      xhr.setRequestHeader("Authorization", authToken);
    },
    success: function(result) {
      console.log("Result from " + baseUrl + apiEndpoint);
      console.log(result);
      let options = "";
      if (result) {
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
