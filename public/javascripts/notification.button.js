$(function () {
  var box = $('.notification-box');
  let notifybutton = $('.notify');
  notifybutton.on('click', function () {
    console.log('click');
    box.toggle('fast');
  })
});