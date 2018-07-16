
$("#nav-user").click(function(){
    console.log('i am clicked')
    window.location.href = window.location.origin + "/superadmin/users.html";
})

$("#nav-vote").click(function(){
    window.location.href = window.location.origin + "/superadmin/vote.html";
})

$("#nav-quiz").click(function(){
    window.location.href = window.location.origin + "/superadmin/index.html";
})

function loadQuizzes() {

    const myUrl = window.location.origin + "/superadmin/super.json";

    $.ajax({
        url: myUrl,
        type: 'GET',
       
        error : function(error) {
            console.log(error)
        },
        success: function(success) {
            $.each(success.quiz, function(key, val){
                var id = key++;

                $("#result").append(`
                <tr>
                <td>`+ key++ +`</td>
                <td>`+ val.title+`</td>
                <td>`+ val.description+`</td>
                <td>`+ val.date+`</td>
                <td>`+val.users+`</td>
                <td><a href="../superadmin/quiz-details.html" class="btn btn-brand btn-sm">View details</a></td>
            </tr>
                `)

            })
        }
    })
}

function loadUsers(){

    const myUrl = window.location.origin + "/superadmin/super.json";

    $.ajax({
        url: myUrl,
        type: 'GET',
       
        error : function(error) {
            console.log(error)
        },
        success: function(success) {
            $.each(success.users, function(key, val){
                var id = key++;

                $("#result").append(`
                <tr>
                <td>`+ key++ +`</td>
                <td>`+ val.firstname+`</td>
                <td>`+ val.lastname+`</td>
                <td>`+ val.email+`</td>
                <td>`+val.role+`</td>
                <td><button class="btn btn-brand btn-sm">View details</button>
            </tr>
                `)

            })
        }
    })

}

function loadVotes(){
    
    const myUrl = window.location.origin + "/superadmin/super.json";

    $.ajax({
        url: myUrl,
        type: 'GET',
       
        error : function(error) {
            console.log(error)
        },
        success: function(success) {
            $.each(success.vote, function(key, val){
                var id = key++;

                $("#result").append(`
                <tr>
                <td>`+ key++ +`</td>
                <td>`+ val.title+`</td>
                <td>`+ val.description+`</td>
                <td>`+ val.poll+`</td>
                <td>`+val.users+`</td>
                <td><a href="../superadmin/vote-details.html" class="btn btn-brand btn-sm">View details</a>
            </tr>
                `)

            })
        }
    })

}

