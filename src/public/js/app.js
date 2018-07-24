function fadeOutLoader() {
  // console.log('game loading...');
  gameContainer.style.display = "none";

  setTimeout(function() {
    loader.style.display = "none";
    gameContainer.style.display = "block";
  }, 3000);
}

function loadNavBar() {
  const url = "/pages/game/navbar.component.html";
  $("#myNavBar").load(url);
}

function loadGridFooter() {
  const url = "/pages/game/gridfooter.component.html";
  $("#gridFooter").load(url);
}

function getUrlParameter(sParam) {
  var sPageURL = decodeURIComponent(window.location.search.substring(1)),
    sURLVariables = sPageURL.split("&"),
    sParameterName,
    i;
  for (i = 0; i < sURLVariables.length; i++) {
    sParameterName = sURLVariables[i].split("=");

    if (sParameterName[0] === sParam) {
      return sParameterName[1] === undefined ? true : sParameterName[1];
    }
  }
}

function logout(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  localStorage.removeItem("token");
  localStorage.removeItem("userInfo");
  clearAdminGameStorages("quiz");
  clearAdminGameStorages("survey");
  window.location.href = "/"; // window.location.origin;
}

/**
 * Clear all storage data associated with game playing
 * Sync up with the code at src\public\general.admin.js
 * @param {*} game 'quiz' or 'survey'
 */
function clearAdminGameStorages(game) {
  if (typeof GameAdminData !== "undefined") {
    GameAdminData[game + "runinfo"] = undefined;
    GameAdminData[game + "question"] = undefined;
    GameAdminData["answeredquestionlist"] = undefined;
    GameAdminData["userData"] = undefined;
  }
}

function setPagingInfo(paging) {
  $("#pg_info").html(
    `Showing ${paging.total ? paging.from : 0} to ${paging.to} of ${paging.total} entries`
  );

  // set the nav buttons
  $("#pg_current a").html(paging.currentPage);
  $("#pg_last").attr("pgInd", paging.lastPage);
  if (paging.currentPage > 1) {
    $("#pg_previous").attr("pgInd", paging.currentPage - 1);
    $("#pg_previous").removeClass("disabled");
    $("#pg_first").removeClass("disabled");
  }
  if (paging.currentPage < paging.lastPage) {
    $("#pg_next").attr("pgInd", Math.min(paging.lastPage, paging.currentPage + 1));
    $("#pg_next").removeClass("disabled");
    $("#pg_last").removeClass("disabled");
  }
}

/**
 * Returns an array of the questions
 */
function getSecurityQuestions() {
  return [
    "What is your favorite food?",
    "Which football team do you support?",
    "How many languages do you speak?",
    "Who is your best musician?",
    "What is the brand of your first car?"
  ];
}

function getSecurityQuestionsForDropdown() {
  const questions = getSecurityQuestions();
  let options = '<option value="" disabled selected>* Select a security question...</option>';
  for (const qn of questions) {
    options += `<option value="${qn}">${qn}</option>`;
  }
  return options;
}

function isModernBrowser() {
  var div = document.createElement("div");
  return (
    ("draggable" in div || ("ondragstart" in div && "ondrop" in div)) &&
    "FormData" in window &&
    "FileReader" in window
  );
}

function getKeyByValue(object, value) {
  for (let key of Object.keys(object)) {
    if (object[key] === value) return key;
  }
  return undefined;
}

// ALWAYS sync with the definition in /services/enums.js
const UserRoleOptions = {
  Players: 1,
  Moderator: 2,
  SuperAdmin: 3
};

// Turn off console logging in production
if (window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
  console.log = function() {};
}
