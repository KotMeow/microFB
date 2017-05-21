/**
 * Created by Meow on 12.05.2017.
 */
$(function () {

  var socket = io();
  socket.emit('join');
  var friendlist = $('#friend-list');
  $('#butt').on('click', () => {
    socket.emit('message', {
      age: 15
    });
  });
  socket.on('message', function (data) {
    friendlist.append(`<li><div class="online">${data.init}</div><div>${data.name}</div></li>`);
  });

});