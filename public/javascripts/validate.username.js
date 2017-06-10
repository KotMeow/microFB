$(function () {
  let usernameInput = $('#username');
  let usernameError = $('#username-error');

  var file = document.getElementById("file");
  file.onchange = function(){
    if(file.files.length > 0)
    {

      document.getElementById('filename').innerHTML = file.files[0].name;

    }
  };

  usernameInput.on('blur', function () {
    if (usernameInput.val().length > 2) {
      axios.post('checkexist', {username: $(this).val()}).then(function (response) {
        if (response.data.length > 0) {
          usernameError.addClass('is-danger');
          usernameError.html('This username is already taken');
          usernameInput.addClass('is-danger');
        } else {
          usernameInput.removeClass('is-danger').addClass('is-success');
          usernameError.removeClass('is-danger').addClass('is-success');
          usernameError.html('This username is available');
        }
      });
    }
  });

});
