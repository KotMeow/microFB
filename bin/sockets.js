var socketio = require('socket.io');
var User = require('../models/user');
var passportSocketIo = require("passport.socketio");
var Promise = require("bluebird");

module.exports.listen = function (io) {

  io.on('connection', function (socket) {
    socket.on('message', function (data) {
      console.log('message');
      User.findOne({username: socket.request.user.username}).populate('friends').then(user => {
        user.friends.forEach(friend => {
          io.in(friend.username).emit('message', {init: "KK", name: socket.request.user.username});
        });
      });

    });
    socket.on('join', () => {
      var username = socket.request.user.username;
      socket.join(username);
      var users = [];
      passportSocketIo.filterSocketsByUser(io, function(user){
        users.push(user.username);
        return user;
      });
      io.in(username).emit('onlineUsers', users);
      User.findOne({username: username}).populate('friends').then(user => {
        user.friends.forEach(friend => {
          io.in(friend.username).emit('online', {username: username});
        })
      })
    });

    socket.on('logout', () => {
      var username = socket.request.user.username;
      User.findOne({username: username}).populate('friends').then(user => {
        user.friends.forEach(friend => {
          io.in(friend.username).emit('offline', {username: username});
        })
      })
    })
  });

  return io;
};