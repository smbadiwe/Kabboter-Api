$(function() {
    setTimeout(function () { $('#overlay').fadeOut(); }, 3000);

    $('#result').click(function(){
        window.location = 'result.html'
    })

    $('#quiz').click(function(){
        window.location = 'quiz.html'
    })

    $('#vote').click(function(){
        window.location = 'vote.html'
    })
    
})