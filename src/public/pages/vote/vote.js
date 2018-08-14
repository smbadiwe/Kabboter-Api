function editId(val) {
  window.location = `addedit.html?id=${val}`;
<<<<<<< HEAD
}

// vote.html
function initPage() {
  loadNavBar();
  initVote("/api/user/surveys/my");
}

function initVote(apiEndPoint) {
  loadGridFooter();
  loadData(1, apiEndPoint);
  $("#search").on("input", function() {
    loadData(1, apiEndPoint);
  });
  $("#perPage").on("change", function() {
    loadData(1, apiEndPoint);
  });
  $("#gridFooter").on("click", "li.paginate_button", function() {
    const li = $(this);
    if (!li.hasClass("disabled")) loadData(parseInt(li.attr("pgInd")), apiEndPoint);
  });
=======
>>>>>>> Fixed latest list of issues from Tope yesterday.
}

<<<<<<< HEAD
=======
// vote.html
function initPage() {
  loadNavBar();
  initVote("/api/user/surveys/my");
}

function initVote(apiEndPoint) {
  loadGridFooter();
  loadData(1, apiEndPoint);
  $("#search").on("input", function() {
    loadData(1, apiEndPoint);
  });
  $("#perPage").on("change", function() {
    loadData(1, apiEndPoint);
  });
  $("#gridFooter").on("click", "li.paginate_button", function() {
    const li = $(this);
    if (!li.hasClass("disabled")) loadData(parseInt(li.attr("pgInd")), apiEndPoint);
  });
}

>>>>>>> Sundry changes. Audit trail UI almost there
function loadData(page, apiEndPoint) {
  console.log("loadData: apiEndPoint = " + apiEndPoint);
  const token = localStorage.getItem("token");
  const myUrl = window.location.origin + apiEndPoint;
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
      $("#result").show();
      $("#result").html("Error fetching data. " + data.statusText);
    },
    success: function(data) {
      console.log(data);
      let rows = "";
      $.each(data.data, function(key, val) {
        const sno = data.pagination.from + key;
        rows += getOneUserRow(sno, val);
      });
      $("table tbody").html(rows);

      // set paging narrative and nav buttons
      setPagingInfo(data.pagination);
    }
  });
}

function getOneUserRow(sno, val) {
  let btnLink = val.published
    ? `<a href="/moderatevote?id=${val.id}" class="btn btn-success btn-block btn-sm">Play game</a>`
    : `<a href="/pages/vote/details.html?id=${
        val.id
      }" class="btn btn-success btn-block btn-sm">Publish</a>`;
  let row = `<tr>
                <td scope="row">${sno}</td>
                <td><a href="/pages/vote/details.html?id=${val.id}">${val.title}</a></td>
<<<<<<< HEAD
                <td>${val.description || ""}</td>
=======
                <td>${val.description}</td>
>>>>>>> Sundry changes. Audit trail UI almost there
                <td>${val.nQuestions}</td>
                <td>${
                  val.published
                    ? "<span style='font-weight: bold; color: green;'>Yes</span>"
                    : "<span style='font-weight: bold; color: red;'>No</span>"
                }</td>
                <td>${btnLink}</td>
            </tr>`;

  return row;
}
