$("#nav-user").click(function() {
  $("#viewDiv").load("users/users.html");
});

$("#nav-vote").click(function() {
  $("#viewDiv").load("votes/votes.html");
});

$("#nav-quiz").click(function() {
  $("#viewDiv").load("quizzes/quizzes.html");
});

$("#nav-audit").click(function() {
  $("#viewDiv").load("audit/audit.html");
});

function loadVotes() {
  const myUrl = window.location.origin + "/superadmin/super.json";

  $.ajax({
    url: myUrl,
    type: "GET",

    error: function(error) {
      console.log(error);
    },
    success: function(success) {
      $.each(success.vote, function(key, val) {
        var id = key++;

        $("#result").append(
          `
                <tr>
                <td>` +
            key++ +
            `</td>
                <td>` +
            val.title +
            `</td>
                <td>` +
            val.description +
            `</td>
                <td>` +
            val.poll +
            `</td>
                <td>` +
            val.users +
            `</td>
                <td><a href="../superadmin/vote-details.html" class="btn btn-brand btn-sm">View details</a>
            </tr>
                `
        );
      });
    }
  });
}
