// in audit.html
function loadDetailsPage(id) {
  window.location = `details.html?id=${id}`;
}

// in audit.html
function loadData(page = 1) {
  var token = localStorage.getItem("token");
  var myUrl = window.location.origin + "/api/user/audittrails";

  const queryData = {
    username: $("#username").val(),
    eventType: $("#ddEvent").val(),
    dateFrom: $("#dateFrom").val(),
    dateTo: $("#dateTo").val(),
    perPage: $("#perPage").val(),
    page: page
  };
  console.log("queryData = ");
  console.log(queryData);
  $.ajax({
    headers: {
      Authorization: "Bearer " + token
    },
    url: myUrl,
    type: "GET",
    data: queryData,
    error: function(data) {
      console.log(data);
      $("#result").append("Error fetching audit trail logs");
    },
    success: function(data) {
      console.log(data);
      var rows = "";
      $.each(data.data, function(key, val) {
        const sno = data.pagination.from + key;

        // <td><a href="details.html?id=${val.id}">${val.eventType}</a></td>
        rows += `<tr>
                    <td scope="row">${sno}</td>
<<<<<<< HEAD
                    <td><a href>${val.eventType}</a></td>
                    <td>${val.username || ""}</td>
=======
                    <td><a href="details.html?id=${val.id}">${val.eventType}</a></td>
                    <td>${val.username}</td>
>>>>>>> Sundry changes. Audit trail UI almost there
                    <td>${val.entityName}</td>
                    <td>${val.created_at}</td>
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
  // Populate events dropdown
  var token = localStorage.getItem("token");
  var myUrl = window.location.origin + "/api/user/audittrails/events";
  $.ajax({
    headers: {
      Authorization: "Bearer " + token
    },
    url: myUrl,
    type: "GET",
    error: function(data) {},
    success: function(data) {
<<<<<<< HEAD
      var options = "<option value selected>Select event...</option>";
=======
      var options = "`<option value selected disabled>Select event...</option>`";
>>>>>>> Sundry changes. Audit trail UI almost there
      for (var val in data) {
        options += `<option value='${data[val]}'>${val}</option>`;
      }
      $("#ddEvent").html(options);
    }
  });

  loadGridFooter();
  loadData();
<<<<<<< HEAD
  var reloadData = function() {
    loadData();
  };
  $("#username").on("input", reloadData);
  $("#ddEvent").on("change", reloadData);
  $("#dateFrom").on("change", reloadData);
  $("#dateTo").on("change", reloadData);
  $("#perPage").on("change", reloadData);
=======
  $("#username").on("input", loadData);
  $("#dateFrom").on("change", loadData);
  $("#dateTo").on("change", loadData);
  $("#perPage").on("change", loadData);
>>>>>>> Sundry changes. Audit trail UI almost there
  $("#gridFooter").on("click", "li.paginate_button", function() {
    const li = $(this);
    if (!li.hasClass("disabled")) loadData(parseInt(li.attr("pgInd")));
  });
}
