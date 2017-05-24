var socketio = require('socket.io');
var User = require('../models/user');
var Post = require('../models/post');
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
      let users = [];
      passportSocketIo.filterSocketsByUser(io, function (user) {
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

    socket.on('onlineUsers', () => {
      var username = socket.request.user.username;
      let users = [];
      passportSocketIo.filterSocketsByUser(io, function (user) {
        users.push(user.username);
        return user;
      });
      io.in(username).emit('onlineUsers', users);
    });

    socket.on('invite', (data) => {
      User.findOne({username: data}).populate('invites').then(user => {
        if (user.invites.filter(e => e.username === socket.request.user.username).length > 0) {
          console.log('Already invited');
        }
        else {
          user.invites.push(socket.request.user._id);
          user.save().then(() => {
            io.in(user.username).emit('invite', {from: socket.request.user.username});
          });
        }
      });
    });

    socket.on('accept', data => {
      let element;
      Promise.all([User.findOne({username: data}), User.findById(socket.request.user).populate('invites')])
          .spread((user1, user2) => {
            user1.friends.push(user2._id);
            user2.friends.push(user1._id);
            user2.invites.forEach((invite, index) => {
              if (invite.username === data) element = index;
            });
            user2.invites.splice(element, 1);
            Promise.all([user1.save(), user2.save()]).then(() => {
              io.in(user1.username).emit('accept', user2.username);
              io.in(user2.username).emit('accept', user1.username);
            })
          })
          .catch(err => {
            throw err;
          });
    });

    socket.on('decline', data => {
      let element;
      User.findById(socket.request.user).populate('invites')
          .then(user => {
            user.invites.forEach((invite, index) => {
              if (invite.username === data) element = index;
            });
            user.invites.splice(element, 1);
            user.save();
          }).catch(e => {
        console.log(e);
      });
    });

    socket.on('newpost', data => {
      User.findById(socket.request.user).populate('friends')
          .then(user => {
            var post = new Post({
              content: data,
              _creator: user._id
            });
            post.save().then(post => {
              user.friends.forEach(friend => {
                io.in(friend.username).emit('newpost', {post: post, author: user.username});
              });
              io.in(user.username).emit('newpost', {post: post, author: user.username, user: socket.request.user.username});
            });
          })
          .catch(err => {
            console.log(err);
          });
    });
  });

  return io;
};