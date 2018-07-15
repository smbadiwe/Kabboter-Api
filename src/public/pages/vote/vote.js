function editId(val) {
  window.location = `addedit.html?id=${val}`;
}

function loadData(page = 1) {
  var token = localStorage.getItem("token");
  var myUrl = window.location.origin + "/api/user/surveys/my";

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
      $("#result").append("Error fetching surveys");
    },
    success: function(data) {
      const sno = data.pagination.from + key;
      var rows = "";
      $.each(data.data, function(key, val) {
        let btnLink = val.published
          ? `<a href="/surveyadmin/surveyadmin.html?id=${
              val.id
            }" class="btn btn-success btn-block btn-sm">Play game</a>`
          : `<a href="details.html?id=${
              val.id
            }" class="btn btn-success btn-block btn-sm">Publish</a>`;
        rows += `<tr>
                            <td scope="row">${sno}</td>
                            <td>${val.title}</td>
                            <td>${val.description}</td>
                            <td>${
                              val.published
                                ? "<span style='font-weight: bold; color: green;'>Yes</span>"
                                : "<span style='font-weight: bold; color: red;'>No</span>"
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

function initVote() {
  loadNavBar();
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
