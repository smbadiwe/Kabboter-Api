// in users.html
function loadData(page = 1) {
  var token = localStorage.getItem("token");
  var myUrl = window.location.origin + "/api/user/admins";

  const queryData = {
    title: $("#search").val(),
    perPage: $("#perPage").val(),
    page: page
  };
  $.ajax({
    headers: {
      Authorization: "Bearer " + token
    },
    url: myUrl,
    type: "get",
    data: queryData,
    error: function(data) {
      console.log(data);
      $("#result").append("Error fetching quizzes");
    },
    success: function(data) {
      var rows = "";
      $.each(data.data, function(key, val) {
        let btnLink = val.published
          ? `<a href="/quizadmin/quizadmin.html?id=${
              val.id
            }" class="btn btn-success btn-block btn-sm">Play game</a>`
          : `<a href="details.html?id=${
              val.id
            }" class="btn btn-success btn-block btn-sm">Publish</a>`;
        rows +=
          `<tr>
                              <td scope="row">` +
          (key + 1) +
          `</td>
                              <td>${val.title}</td>
                              <td>${val.description}</td>
                              <td>${
                                val.published
                                  ? "<span style='font-weight: bold; color: green;'>Yes</span>"
                                  : "No"
                              }</td>
                              <td>${btnLink}</td>
                              <td><a href="details.html?id=${
                                val.id
                              }" class="btn btn-danger btn-block btn-sm">View details</a></td>
                          </tr>`;
      });
      $("table tbody").html(rows);

      // set paging narrative and nav buttons
      setPagingInfo(data.pagination);
    }
  });
}

// in users.html
function initQuiz() {
  loadNavBar();
  loadData();
  $("#search").on("input", function() {
    loadData();
  });
  $("#perPage").on("change", function() {
    loadData();
  });
  $("li.paginate_button").on("click", function() {
    if (!$(this).hasClass("disabled")) loadData(parseInt($(this).attr("pgInd")));
  });
}
