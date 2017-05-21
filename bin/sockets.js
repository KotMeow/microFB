var socketio = require('socket.io');
var User = require('../models/user');
var passportSocketIo = require("passport.socketio");

module.exports.listen = function(server, sessionStore){
  io = socketio(server);

  io.use(passportSocketIo.authorize({
    key:          'express.sid',       // the name of the cookie where express/connect stores its session_id
    secret:       'wielkiCzarnyKot',    // the session_secret to parse the cookie
    store:        sessionStore,
  }));

  io.on('connection', function(socket) {

    socket.on('message', function(data) {
      console.log(socket.request.user.username);
      User.findOne({username: socket.request.user.username}).populate('friends').then(user => {
        user.friends.forEach(friend => {
          io.in(friend.username).emit('message',  {init: "KK", name: socket.request.user.username});
        });
      });

    });
    socket.on('join', () => {
      socket.join(socket.request.user.username);
    });

  });

  return io;
};