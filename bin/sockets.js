var socketio = require('socket.io');
var User = require('../models/user');

module.exports.listen = function(server){
  io = socketio.listen(server);


  io.on('connection', function(socket) {

    socket.on('message', function(data) {
      User.findOne({username: data.name}).populate('friends').then(user => {
        user.friends.forEach(friend => {
          io.in(friend.username).emit('message',  {init: "KK", name: data.name});
        });
      });

    });
    socket.on('join', data => {
      console.log(`User ${data} has connected`);
      socket.join(data);
    });

  });

  return io;
};