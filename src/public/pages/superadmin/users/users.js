function loadUserDetailsAndSetOnPage() {
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

      $("#username").append(data.username);
      $("#name").append(data.name);
      $("#firstname").append(data.firstname);
      $("#lastname").append(data.lastname);
      $("#email").append(data.email);
      $("#phone").append(data.phone);
      $("#roles").append(data.roles);
      $("#country").append(data.country);
      $("#organization").append(data.organization);

      //TODO: set page html elements. 'data' will be the user details.
      // write to console if you need to see what the JSON looks like
    }
  });
}

// in users.html
function loadData(page = 1) {
  console.log("loadData: page = " + page);
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
      let rows = "";
      $.each(data.data, function(key, val) {
        const sno = data.pagination.from + key;
        rows += getOneUserRow(sno, val);
      });
      $("table tbody").html(rows);

      // set paging narrative and nav buttons
      setPagingInfo(data.pagination);
    },
    complete: function() {
      $("a.enabledisable").on("click", onToggleBtnClicked);
      $("a.promotedemote").on("click", onPromoteDemoteBtnClicked);
    }
  });
}

// in users.html
function onToggleBtnClicked(event) {
  event.preventDefault();
  event.stopPropagation();
  const target = event.target;
  console.log(target);
  const sno = target.getAttribute("sno");
  const userId = target.getAttribute("userId");
  const enabling = target.getAttribute("enabling");
  console.log("sno = " + sno + " userId = " + userId + " enabling = " + enabling);
  toggleUser(+sno, +userId, enabling);
}

function onPromoteDemoteBtnClicked(event) {
  event.preventDefault();
  event.stopPropagation();
  const target = event.target;
  console.log(target);
  const sno = target.getAttribute("sno");
  const userId = target.getAttribute("userId");
  const demoting = target.getAttribute("demoting");
  console.log("sno = " + sno + " userId = " + userId + " demoting = " + demoting);
  promoteDemoteUser(+sno, +userId, demoting);
}
// in users.html
function initUsers() {
  loadGridFooter();
  loadData();
  $("#search").on("input", function() {
    loadData();
  });
  $("#perPage").on("change", function() {
    loadData();
  });
  $("#gridFooter").on("click", "li.paginate_button", function() {
    const li = $(this);
    if (!li.hasClass("disabled")) loadData(parseInt(li.attr("pgInd")));
  });
}

function promoteDemoteUser(sno, userId, demoting) {
  const token = localStorage.getItem("token");
  const myUrl = window.location.origin + "/api/members/changerole";
  demoting = demoting ? true : false;
  const payload = {
    id: userId,
    demoting: demoting
  };
  $.ajax({
    headers: {
      Authorization: "Bearer " + token
    },
    url: myUrl,
    type: "POST",
    data: payload,
    error: function(data) {
      console.log(data);
      $("#result").show();
      $("#result").html(
        `Error ${demoting ? "demoting" : "promoting"} user's role. ${data.statusText}`
      );
    },
    success: function(data) {
      const oldRole = $(`tr#${userId} td#${sno}-role`).html();
      let newRole;
      if (demoting) {
        $(`tr#${userId} td#${sno}-prd a.promotedemote`)
          .removeAttr("demoting")
          .removeClass("btn-warning")
          .addClass("btn-primary")
          .html("Promote");

        newRole = getKeyByValue(UserRoleOptions, +UserRoleOptions[oldRole] - 1);
      } else {
        $(`tr#${userId} td#${sno}-prd a.promotedemote`)
          .attr("demoting", "true")
          .removeClass("btn-primary")
          .addClass("btn-warning")
          .html("Demote");

        newRole = getKeyByValue(UserRoleOptions, +UserRoleOptions[oldRole] + 1);
      }

      $(`tr#${userId} td#${sno}-role`).html(newRole);
    }
  });
}

function toggleUser(sno, userId, enabling) {
  const token = localStorage.getItem("token");
  const myUrl = window.location.origin + "/api/members/enabledisable";
  enabling = enabling ? true : false;
  const payload = {
    id: userId,
    enabling: enabling
  };
  $.ajax({
    headers: {
      Authorization: "Bearer " + token
    },
    url: myUrl,
    type: "POST",
    data: payload,
    error: function(data) {
      console.log(data);
      $("#result").show();
      $("#result").html(`Error ${enabling ? "enabling" : "disabling"} user. ${data.statusText}`);
    },
    success: function(data) {
      if (enabling) {
        $(`tr#${userId} td#${sno}-txt`).html(
          "<span style='font-weight: bold; color: green;'>Yes</span>"
        );

        $(`tr#${userId} td#${sno}-btn a.enabledisable`)
          .removeAttr("enabling")
          .removeClass("btn-success")
          .addClass("btn-danger")
          .html("Disable");
      } else {
        $(`tr#${userId} td#${sno}-txt`).html(
          "<span style='font-weight: bold; color: red;'>No</span>"
        );

        $(`tr#${userId} td#${sno}-btn a.enabledisable`)
          .attr("enabling", "true")
          .removeClass("btn-danger")
          .addClass("btn-success")
          .html("Enable");
      }
    }
  });
}

function getOneUserRow(sno, user) {
  let enableOrDisableBtnLink = user.disabled
    ? `<a href sno="${sno}", userId="${
        user.id
      }", enabling="true" class="enabledisable btn btn-success btn-block btn-sm">Enable</a>`
    : `<a href sno="${sno}", userId="${
        user.id
      }", class="enabledisable btn btn-danger btn-block btn-sm">Disable</a>`;

  let promoteOrDemoteBtnLink =
    UserRoleOptions[user.roles] === UserRoleOptions.SuperAdmin
      ? `<a href sno="${sno}", userId="${
          user.id
        }", demoting="true" class="promotedemote btn btn-warning btn-block btn-sm">Demote</a>`
      : `<a href sno="${sno}", userId="${
          user.id
        }", class="promotedemote btn btn-primary btn-block btn-sm">Promote</a>`;

  return `<tr id="${user.id}">
              <td scope="row">${sno}</td>
              <td>${user.username}</td>
              <td><a href="details.html?id=${user.id}">${user.firstname} ${user.lastname}</a></td>
              <td id="${sno}-role">${user.roles}</td>
              <td id="${sno}-txt">${
    user.disabled
      ? "<span style='font-weight: bold; color: red;'>No</span>"
      : "<span style='font-weight: bold; color: green;'>Yes</span>"
  }</td>
              <td id="${sno}-btn">${enableOrDisableBtnLink}</td>
              <td id="${sno}-prd">${promoteOrDemoteBtnLink}</td>
          </tr>`;
}
