$(function () {
  var box = $('.notification-box');
  let notifybutton = $('.notify');
  notifybutton.on('click', function () {
    $('.notification-icon').css('color', '#7a7a7a');
    box.toggle('fast');
  });
  $('.live-chat header').on('click', function() {

    $(this).next().slideToggle(300, 'swing');

  });

  $('.chat-close').on('click', function(e) {
    console.log($(this).parent().parent());
    let x = $(this).parent().parent();
    e.preventDefault();
    x.fadeOut(300);

  });

});