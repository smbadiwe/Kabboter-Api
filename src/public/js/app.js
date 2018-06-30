var signUpContainer = document.getElementById("signup");
var loginContainer = document.getElementById("login");
var forgotPasswordContainer = document.getElementById("forgot-password");
var gameContainer = document.getElementById("game");
var loader = document.getElementById("loader");

var forgotPasswordBtn = document.getElementById("forgotPasswordBtn");
var registerBtn = document.getElementById("registerBtn");
var loginBtn = document.getElementById("loginBtn");

// OnAppInit
forgotPasswordContainer.style.display = "none";
signUpContainer.style.display = "none";

// show Signup form
registerBtn.addEventListener("click", showSignUpForm);
loginBtn.addEventListener("click", showLoginForm);
forgotPasswordBtn.addEventListener("click", showForgotPasswordForm);

// Callback functions
function showSignUpForm() {
  loginContainer.style.display = "none";
  forgotPasswordContainer.style.display = "none";
  signUpContainer.style.display = "block";
}

function showLoginForm() {
  loginContainer.style.display = "block";
  forgotPasswordContainer.style.display = "none";
  signUpContainer.style.display = "none";
}

function showForgotPasswordForm() {
  loginContainer.style.display = "none";
  forgotPasswordContainer.style.display = "block";
  signUpContainer.style.display = "none";
}

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
