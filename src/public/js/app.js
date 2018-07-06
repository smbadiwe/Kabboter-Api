function fadeOutLoader() {
  // console.log('game loading...');
  gameContainer.style.display = "none";

  setTimeout(function() {
    loader.style.display = "none";
    gameContainer.style.display = "block";
  }, 3000);
}

function loadNavBar() {
  const navBarUrl = window.location.origin + "/pages/navbar.component.html";
  $("#myNavBar").load(navBarUrl);
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
  localStorage.removeItem(game + "runinfo");
  localStorage.removeItem(game + "question");
  sessionStorage.removeItem("answeredquestionlist");
  sessionStorage.removeItem("userData");
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
  let options = '<option value="" disabled selected>Select a security question...</option>';
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
