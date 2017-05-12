/**
 * Created by Meow on 12.05.2017.
 */
$(function () {

  var socket = io.connect('http://localhost:3000');

  $('#butt').on('click', () => {
    socket.emit('message', {
      name: 'Kamil',
      age: 15
    });
  });
});