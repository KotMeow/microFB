/**
 * Created by Meow on 12.05.2017.
 */
$(function () {

  var socket = io();

  $('#butt').on('click', () => {
    socket.emit('message', {
      name: 'Kamil',
      age: 15
    });
  });

  const button = document.querySelector('.notify');
  const dropdown = document.querySelector('.dropdown');

  button.addEventListener('click', () => {
    dropdown.classList.toggle('is-open');
  });
});