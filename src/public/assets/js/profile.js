$(function() {

    $('#main').load('edit-profile.html')

    $('#edit-profile').click(function(){
        $('#main').load('edit-profile.html')
    })

    $('#change-password').click(function() {
        $('#main').load('change-password.html')
    })

    $('#change-email').click(function() {
        $('#main').load('change-email.html')
    })

})