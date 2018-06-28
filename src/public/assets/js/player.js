// Pages Div
var loginContainer = document.getElementById("login");
var registerContainer = document.getElementById("register");
var gameContainer = document.getElementById("play");
var playGroundContainer = document.getElementById("game");
var timeoutContainer = document.getElementById("timeout");

//Button ID

var goToGameBtn = document.getElementById("goToGameBtn")
var goRegisterBtn = document.getElementById("goToRegisterBtn")
var goToLoginBtn = document.getElementById("goToLoginBtn")
var goToPlayGround = document.getElementById("goToPlayGround")

//OnInit of the page

registerContainer.style.display = "none";
gameContainer.style.display = "none";
playGroundContainer.style.display = "none";
timeoutContainer.style.display = "none";

$("#goToGameBtn").click(function(){
   $("#register").hide();
   $("#login").hide(); 
   $("#timeout").hide();
   $("#game").hide();
   $("#play").show();
})

$("#goToRegisterBtn").click(function(){
   
    $("#play").hide();
    $("#login").hide();
    $("#game").hide();
    $("#timeout").hide(); 
    $("#register").show();
    
})

$("#goToLoginBtn").click(function(){

    $("#register").hide(); 
    $("#play").hide();
    $("#game").hide(); 
    $("#timeout").hide();
    $("#login").show();


})

$("#goToPlayGround").click(function(){

    $("#register").hide(); 
    $("#play").hide();
    $("#login").hide();
    $("#timeout").hide();
    $("#game").show(); 

})

$("#goToPlayBtn").click(function(){

    $("#register").hide(); 
    $("#play").hide();
    $("#login").hide();
    $("#timeout").hide();
    $("#game").show(); 

})

$("#goToWait").click(function(){
    $("#register").hide(); 
    $("#play").hide();
    $("#login").hide();
    $("#game").hide();
    $("#timeout").show();
})
