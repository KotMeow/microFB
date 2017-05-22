$(function () {
  var box = $('.notification-box');
  let notifybutton = $('.notify');
  notifybutton.on('click', function () {
    $('.notification-icon').css('color', '#7a7a7a');
    box.toggle('fast');
  });


});