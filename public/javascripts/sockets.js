$(function () {

  var socket = io();
  socket.emit('join');
  var friendlist = $('#friend-list');
  $('#butt').on('click', () => {
    socket.emit('message', {
      age: 15
    });
  });
  $('#logOut').on('click', () => {
    socket.emit('logout');
  });
  socket.on('message', function (data) {
    friendlist.append(`<li><div class="online">${data.init}</div><div>${data.name}</div></li>`);
  });
  socket.on('online', data => {
    $('#' + data.username).removeClass('offline').addClass('online');
  });
  socket.on('offline', data => {
    $('#' + data.username).removeClass('online').addClass('offline');
  });
  socket.on('onlineUsers', data => {
    data.forEach( value => {
      $('#' + value).removeClass('offline').addClass('online');
    })
  });

});