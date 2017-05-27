$(function () {
  var box = $('.notification-box');
  let notifybutton = $('.notify');
  notifybutton.on('click', function () {
    $('.notification-icon').css('color', '#7a7a7a');
    box.toggle('fast');
  });
  $('.chat-container').on('click', '.live-chat header', function() {

    $(this).next().slideToggle(300, 'swing');

  });
  $('.chat-container').on('click', '.chat-close', function(e) {
    console.log($(this).parent().parent());
    let x = $(this).parent().parent();
    e.preventDefault();
    x.fadeOut(300);
    setTimeout(function(){
      x.remove();
    },300);

  });

});