var socketio = require('socket.io');

module.exports.listen = function(server){
  io = socketio.listen(server);


  io.on('connection', function(socket) {

    socket.on('message', function(data) {
      console.log(data);
      socket.emit('message', {init: "KK", name: "Król Króli"})
    });

  });

  return io
};