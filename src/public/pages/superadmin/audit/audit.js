// in audit.html
function loadDetailsPage(id) {
  window.location = `details.html?id=${id}`;
}

// in audit.html
function loadData(page = 1) {
  var token = localStorage.getItem("token");
  var myUrl = window.location.origin + "/api/user/audittrails";

  const queryData = {
    username: $("#search").val(),
    perPage: $("#perPage").val(),
    page: page
  };
  $.ajax({
    headers: {
      Authorization: "Bearer " + token
    },
    url: myUrl,
    type: "GETccv",
    data: queryData,
    error: function(data) {
      console.log(data);
      $("#result").append("Error fetching audit trail logs");
    },
    success: function(data) {
      var rows = "";
      $.each(data.data, function(key, val) {
        const sno = data.pagination.from + key;

        rows += `<tr>
                              <td scope="row">${sno}</td>
                              <td>${val.eventType}</td>
                              <td>${val.username}</td>
                              <td>${val.entityName}</td>
                              <td>${val.created_at}</td>
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

// in audit.html
function init() {
  loadGridFooter();
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
