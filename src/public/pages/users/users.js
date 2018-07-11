function loadUserDetailsAndSetOnPage() {
  loadNavBar();
  const token = localStorage.getItem("token");
  const userId = getUrlParameter("id");
  const myUrl = window.location.origin + "/api/members/" + userId;

  $.ajax({
    headers: {
      Authorization: "Bearer " + token
    },
    url: myUrl,
    type: "GET",
    error: function(data) {
      console.log(data);
      $("#result").show();
      $("#result").html("Error fetching data. " + data.statusText);
    },
    success: function(data) {
      console.log(data);

      $("#details").append(
        `
        
      <div class="row" style="margin-bottom:24px;">
        <div class="col-md-3">
          <b>Username</b>
        </div>
        <div class="col-md-9">
          ` +
          data.username +
          `
        </div>
      </div>

      <div class="row" style="margin-bottom:24px;">
        <div class="col-md-3">
          <b>Name</b>
        </div>
        <div class="col-md-9">
          ` +
          data.firstname +
          ` ` +
          data.lastname +
          `
        </div>
      </div>

      <div class="row" style="margin-bottom:24px;">
        <div class="col-md-3">
          <b>Email address</b>
        </div>
        <div class="col-md-9">
          ` +
          data.email +
          `
        </div>
      </div>

      <div class="row" style="margin-bottom:24px;">
        <div class="col-md-3">
          <b>Phone number</b>
        </div>
        <div class="col-md-9">
          ` +
          data.phone +
          `
        </div>
      </div>

      <div class="row" style="margin-bottom:24px;">
        <div class="col-md-3">
          <b>Country</b>
        </div>
        <div class="col-md-9">
          ` +
          data.country +
          `
        </div>
      </div>

      <div class="row" style="margin-bottom:24px;">
        <div class="col-md-3">
          <b>Organization</b>
        </div>
        <div class="col-md-9">
          ` +
          data.organization +
          `
        </div>
      </div>

      <div class="row" style="margin-bottom:24px;">
        <div class="col-md-3">
          <b>Roles</b>
        </div>
        <div class="col-md-9">
         <div class="badge badge-success"> ` +
          data.roles +
          `</div>
        </div>
      </div>
      
      
      `
      );
      //TODO: set page html elements. 'data' will be the user details.
      // write to console if you need to see what the JSON looks like
    }
  });
}

// in users.html
function loadData(page = 1) {
  const token = localStorage.getItem("token");
  const myUrl = window.location.origin + "/api/members/admins";

  const queryData = {
    q: $("#search").val(),
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
    type: "get",
    data: queryData,
    error: function(data) {
      console.log(data);
      $("#result").show();
      $("#result").html("Error fetching data. " + data.statusText);
    },
    success: function(data) {
      var rows = "";
      $.each(data.data, function(key, val) {
        rows += getOneUserRow(key, val);
      });
      $("table tbody").html(rows);

      // set paging narrative and nav buttons
      setPagingInfo(data.pagination);
    },
    complete: function() {
      $("a.enabledisable").on("click", function(event) {
        event.preventDefault();
        event.stopPropagation();
        const target = event.target;
        console.log(target);
        const sno = target.getAttribute("sno");
        const userId = target.getAttribute("userId");
        const enabling = target.getAttribute("enabling");
        console.log("sno = " + sno + " userId = " + userId + " enabling = " + enabling);
        toggleUser(+sno, +userId, enabling);
      });
    }
  });
}

// in users.html
function initUsers() {
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

function toggleUser(sno, userId, enabling) {
  const token = localStorage.getItem("token");
  const myUrl = window.location.origin + "/api/members/enabledisable";
  enabling = enabling ? true : false;
  const data = {
    id: userId,
    enabling: enabling
  };
  console.log("calling enable-disable with payload: ");
  console.log(data);
  $.ajax({
    headers: {
      Authorization: "Bearer " + token
    },
    url: myUrl,
    type: "POST",
    data: data,
    error: function(data) {
      console.log(data);
      $("#result").show();
      $("#result").html(`Error ${enabling ? "enabling" : "disabling"} user. ${data.statusText}`);
    },
    success: function(data) {
      console.log("calling enable-disable: back from server");
      console.log(data);
      $(`tr#${userId} td#${sno}`).html(
        enabling ? "<span style='font-weight: bold; color: green;'>Yes</span>" : "No"
      );
      $(`tr#${userId} td#${sno}-btn`).html(getEnableDisableButton(userId, enabling, sno));
    }
  });
}

function getEnableDisableButton(userId, enabled, sno) {
  let btnLink = enabled
    ? `<a href sno="${sno}", userId="${userId}", class="enabledisable btn btn-danger btn-block btn-sm">Disable</a>`
    : `<a href sno="${sno}", userId="${userId}", enabling="true" class="enabledisable btn btn-success btn-block btn-sm">Enable</a>`;
  return btnLink;
}

function getOneUserRow(key, user) {
  const sno = key + 1;
  let btnLink = getEnableDisableButton(user.id, user.enabled, sno);

  return `<tr id="${user.id}">
              <td scope="row">${sno}</td>
              <td>${user.username}</td>
              <td><a href="details.html?id=${user.id}">${user.firstname} ${user.lastname}</a></td>
              <td>${user.roles}</td>
              <td id="${sno}">${
    user.enabled ? "<span style='font-weight: bold; color: green;'>Yes</span>" : "No"
  }</td>
              <td id="${sno}-btn">${btnLink}</td>
          </tr>`;
}
