$(function() {
  var signUpContainer = document.getElementById("signup");
  var loginContainer = document.getElementById("login");
  var forgotPasswordContainer = document.getElementById("forgot-password");
  //   var gameContainer = document.getElementById("game");
  //   var loader = document.getElementById("loader");

  var forgotPasswordBtn = document.getElementById("forgotPasswordBtn");
  var registerBtn = document.getElementById("registerBtn");

  // OnAppInit
  forgotPasswordContainer.style.display = "none";
  signUpContainer.style.display = "none";

  // show Signup form
  registerBtn.addEventListener("click", showSignUpForm);
  forgotPasswordBtn.addEventListener("click", showForgotPasswordForm);

  // Callback functions
  function showSignUpForm() {
    loginContainer.style.display = "none";
    forgotPasswordContainer.style.display = "none";
    signUpContainer.style.display = "block";
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
    var feedbackDiv = $("#login #result");
    var username = $("#username").val();
    if (!username) {
      feedbackDiv.html(`<div class="alert alert-danger">User detail is required</div`);
      return false;
    }
    var password = $("#pass").val();
    if (!password) {
      feedbackDiv.html(`<div class="alert alert-danger">Password is required</div`);
      return false;
    }
    $.ajax({
      url: myUrl,
      type: "post",
      data: {
        username: username,
        password: password
      },
      error: function(data) {
        feedbackDiv.html(`<div class="alert alert-danger">${data.responseText}</div`);
      },
      success: function(data) {
        localStorage.setItem("userInfo", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);
        window.location = "/pages/dashboard.html";
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

  function validatePassword() {
    var pass = $("#r-pass").val();
    var cpass = $("#r-cpass").val();
    if (pass !== cpass) {
      $("#passerr").html(`<div class="alert alert-danger">Password does not match</div>`);
      return false;
    } else {
      $("#passerr").html("");
      return pass;
    }
  }

  $("#r-pass").on("input", function() {
    if ($("#r-cpass").val()) {
      validatePassword();
    }
  });
  $("#r-cpass").on("input", validatePassword);

  $("#register").click(function(e) {
    e.preventDefault();
    var firstname = $("#r-firstname").val();
    var feedbackDiv = $("#signup #result");
    if (!firstname) {
      feedbackDiv.html(`<div class="alert alert-danger">First name is required</div`);
      return false;
    }
    var lastname = $("#r-lastname").val();
    if (!lastname) {
      feedbackDiv.html(`<div class="alert alert-danger">Last name is required</div`);
      return false;
    }
    var sec_que = $("#sec-que").val();
    if (!sec_que) {
      feedbackDiv.html(`<div class="alert alert-danger">Security question is required</div`);
      return false;
    }
    var ans = $("#ans").val();
    if (!ans) {
      feedbackDiv.html(`<div class="alert alert-danger">Security answer is required</div`);
      return false;
    }
    var country = $("#country").val();
    if (!country) {
      feedbackDiv.html(`<div class="alert alert-danger">Country is required</div`);
      return false;
    }
    //var username = $("#r-username").val();
    var pass = validatePassword();
    if (!pass) {
      feedbackDiv.html(`<div class="alert alert-danger">Password validation failed</div`);
      return false;
    }
    var email = $("#r-email").val();
    var phone = $("#r-phone").val();
    if (!email && !phone) {
      feedbackDiv.html(
        `<div class="alert alert-danger">Enter email or phone number. We need a way to contact you if need be</div`
      );
      return false;
    }

    var myUrl = window.location.origin + "/api/public/register";

    $.ajax({
      url: myUrl,
      type: "post",
      data: {
        firstname: firstname,
        lastname: lastname,
        email: email,
        phone: phone,
        country: country,
        password: pass,
        securityanswer: ans,
        securityquestion: sec_que
      },
      dataType: "json",
      async: false,
      error: function(data) {
        console.log(data);
        feedbackDiv.html(`<div class="alert alert-danger">` + data.responseText + `</div`);
      },
      success: function(data) {
        // On success, we log user in automatically.
        localStorage.setItem("userInfo", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);
        window.location = "/pages/dashboard.html";
      }
    });
  });

  $("#reset").click(function(e) {
    e.preventDefault();
    var username = $("#user-detail").val();
    if (!username) {
      $("#forgot-password #result").html(
        `<div class="alert alert-danger">Enter either your email, phone or username that you used to register</div`
      );
      return false;
    }
    window.location = "/pages/security-question.html?username=" + username;
  });
});
