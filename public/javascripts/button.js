/**
 * Created by Meow on 12.05.2017.
 */
$(function () {

  var socket = io();

  var friendlist = $('#friend-list');
  $('#butt').on('click', () => {
    socket.emit('message', {
      name: 'Kamil',
      age: 15
    });
  });
  socket.on('message', function (data) {
    friendlist.append(`<li><div class="online">${data.init}</div><div>${data.name}</div></li>`);
  });

  const button = document.querySelector('.notify');
  const dropdown = document.querySelector('.dropdown');

  button.addEventListener('click', () => {
    dropdown.classList.toggle('is-open');
  });
});