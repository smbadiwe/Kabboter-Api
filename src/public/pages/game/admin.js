var memberContainer = document.getElementById("members");
var resultContainer = document.getElementById("results");
var scoreboardContainer = document.getElementById("scoreboard");
var questionContainer = document.getElementById("questions");

var gotoQuestionBtn = document.getElementById("goToQuestionBtn");
var gotoScoreboardBtn = document.getElementById("gotoScoreboardBtn");
var gotoResultBtn = document.getElementById("gotoResultBtn");


//On App Initialization
resultContainer.style.display = 'none';
scoreboardContainer.style.display = 'none';
questionContainer.style.display = 'none';


// show question view
gotoQuestionBtn.addEventListener('click', showQuestions);

//show results view
gotoResultBtn.addEventListener('click', showResults);

// show scoreboard view
gotoScoreboardBtn.addEventListener('click', showScoreboard)




//Callback functions
function showQuestions(){
    memberContainer.display.style = 'none';
    resultContainer.display.style = 'none';
    scoreboardContainer.display.style = 'none';
    questionContainer.display.style = 'block';

}

function showScoreboard(){
    memberContainer.display.style = 'none';
    resultContainer.display.style = 'none';
    scoreboardContainer.display.style = 'block';
    questionContainer.display.style = 'none';

}

function showResults(){
    memberContainer.display.style = 'none';
    resultContainer.display.style = 'block';
    scoreboardContainer.display.style = 'none';
    questionContainer.display.style = 'none';

}


function showMembers(){
    memberContainer.display.style = 'block';
    resultContainer.display.style = 'none';
    scoreboardContainer.display.style = 'none';
    questionContainer.display.style = 'none';

}