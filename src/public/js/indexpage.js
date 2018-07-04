$(function() {
  var signUpContainer = document.getElementById("signup");
  var loginContainer = document.getElementById("login");
  var forgotPasswordContainer = document.getElementById("forgot-password");
  //   var gameContainer = document.getElementById("game");
  //   var loader = document.getElementById("loader");

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

  $("#sec-que").html(getSecurityQuestionsForDropdown());
  $("#country").html(getCountriesForDropdown());
  $("#sub-login").click(function(e) {
    e.preventDefault();
    var myUrl = window.location.origin + "/api/public/login";

    var username = $("#username").val();
    var pass = $("#pass").val();
    $.ajax({
      url: myUrl,
      type: "post",
      data: {
        username: username,
        password: pass
      },
      dataType: "json",
      async: false,
      error: function(data) {
        $("#result").html(`<div class="alert alert-warning">${data.responseText}</div`);
      },
      success: function(data) {
        localStorage.setItem("userInfo", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);
        window.location = "pages/dashboard.html";
      }
    });
  });

  /*
      BUTTON TO NAVIGATE PLAYERS TO QUIZ VIEW 
  */
  $("#playQuizBtn").click(function(e) {
    e.preventDefault();
    window.location = window.location.origin + "/playquiz";
  });

  /*
      BUTTON TO NAVIGATE PLAYERS TO VOTE/SURVEY VIEW 
  */
  $("#playVoteBtn").click(function(e) {
    e.preventDefault();
    window.location = window.location.origin + "/playvote";
  });

  $("#register").click(function(e) {
    e.preventDefault();
    var myUrl = window.location.origin + "/api/public/register";

    var firstname = $("#r-firstname").val();
    var lastname = $("#r-lastname").val();
    var email = $("#r-email").val();
    var phone = $("#r-phone").val();
    var username = $("#r-username").val();
    var pass = $("#r-pass").val();
    var cpass = $("#r-cpass").val();
    var sec_que = $("#sec-que").val();
    var ans = $("#ans").val();

    if (pass !== cpass) {
      $("#passerr").html(`<div class="alert alert-warning">Password does\'nt match</div>`);
    } else {
      $.ajax({
        url: myUrl,
        type: "post",
        data: {
          firstname: firstname,
          lastname: lastname,
          email: email,
          phone: phone,
          username: username,
          password: pass,
          securityanswer: ans,
          securityquestion: sec_que
        },
        dataType: "json",
        async: false,
        error: function(data) {
          console.log(data);
          $("#r_result").html(`<div class="alert alert-warning">` + data.responseText + `</div`);
        },
        success: function(data) {
          // On success, we log user in automatically.
          localStorage.setItem("userInfo", JSON.stringify(data.user));
          localStorage.setItem("token", data.token);
          window.location = "pages/dashboard.html";
        }
      });
    }
  });
  $("#reset").click(function(e) {
    e.preventDefault();
    var username = $("#user-detail").val();
    window.location = "pages/security-question.html?username=" + username;
  });
});
