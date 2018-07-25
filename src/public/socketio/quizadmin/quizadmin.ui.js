function getTopScores() {
  $("#topscores").load("/pages/game/topscores.component.html", function() {
    const token = localStorage.getItem("token");
    const quizRunInfo = GameAdminData["quizruninfo"];
    $.ajax({
      headers: {
        Authorization: "Bearer " + token
      },
      url: window.location.origin + "/api/user/quizruns/topscores",
      type: "GET",
      data: {
        quizRunId: quizRunInfo.gameRunId,
        limit: $("#topscores #limit").val()
      },
      error: function(data) {
        console.log(data);
      },
      success: function(data) {
        let rows = "";
        $.each(data, function(i, element) {
          rows += `
        <tr>
            <td>${i + 1}</td>
            <td>[${element.username}] ${element.firstname} ${element.lastname}</td>
            <td>${element.score}</td>
        </tr>
        `;
        });

        $("#topscores #topScoresTable tbody").html(rows);
      },
      complete: function() {
        $("#topscores").show();
      }
    });
  });
}

$(function() {
  $("#playGameUrl").html(window.location.origin + "/playquiz");
  loadGameDropdownList("quizzes");
});
