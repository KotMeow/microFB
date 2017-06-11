$(function () {
  var box = $('.notification-box');
  let notifybutton = $('.notify');
  let chatContainer = $('.chat-container');
  notifybutton.on('click', function () {
    $('.notification-icon').css('color', '#7a7a7a');
    box.toggle('fast');
  });
  chatContainer.on('click', '.live-chat header', function () {

    $(this).next().slideToggle(200, 'swing');
    $(this).next().find('.chat-history').scrollTop($(this).next().find('.chat-history')[0].scrollHeight);
    if ($(this).find('.message-count').html().localeCompare("0") === 0) {
      $(this).find('.message-count').hide();
    } else {
      $(this).find('.message-count').fadeToggle(3200, 'swing');
    }
    if($(this).next().is(':visible')) {
      $(this).find('.message-count').hide();
      $(this).find('.message-count').html(0);
    }
  });
  chatContainer.on('click', '.chat-close', function (e) {
    let x = $(this).parent().parent();
    e.preventDefault();
    x.fadeOut(300);
    setTimeout(function () {
      x.remove();
    }, 300);

  });

});