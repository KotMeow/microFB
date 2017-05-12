var socketio = require('socket.io');

module.exports.listen = function(server){
  io = socketio.listen(server);


  io.on('connection', function(socket) {

    socket.on('message', function(data) {
      console.log(data);
    });

  });

  return io
};