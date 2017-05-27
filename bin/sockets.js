var socketio = require('socket.io');
var User = require('../models/user');
var Post = require('../models/post');
var passportSocketIo = require("passport.socketio");
var Promise = require("bluebird");
var pug = require('pug');
var path = require('path');

module.exports.listen = function (io) {

  io.on('connection', function (socket) {
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
      });
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

    socket.on('invite', data => {
      User.findOne({username: data}).populate('invites')
          .then(user => {
            if (user.invites.filter(e => e.username === socket.request.user.username).length > 0) {
              console.log('Already invited');
            }
            else {
              user.invites.push(socket.request.user._id);
              return user.save();
            }
          })
          .then(user => {
            io.in(user.username).emit('invite', {from: socket.request.user.username});
          })
          .catch(err => {
            console.log(err);
          });
    });

    socket.on('accept', data => {
      let element;
      Promise.all([User.findOne({username: data}), User.findById(socket.request.user).populate('invites')])
          .spread((user1, user2) => {
            user1.friends.push(user2._id);
            user2.friends.push(user1._id);
            user2.invites.forEach((invite, index) => {
              if (invite.username === data) {
                element = index;
              }
            });
            user2.invites.splice(element, 1);
            return Promise.all([user1.save(), user2.save()]);
          })
          .spread((user1, user2) => {
            io.in(user1.username).emit('accept', user2.username);
            io.in(user2.username).emit('accept', user1.username);
          })
          .catch(err => {
            console.log(err);
          });
    });

    socket.on('decline', data => {
      let element;
      User.findById(socket.request.user).populate('invites')
          .then(user => {
            user.invites.forEach((invite, index) => {
              if (invite.username === data) {
                element = index;
              }
            });
            user.invites.splice(element, 1);
            return user.save();
          })
          .catch(e => {
            console.log(e);
          });
    });

    socket.on('newpost', data => {
      let toUsername = data.username ? data.username : null;
      User.findById(socket.request.user).populate('friends')
          .then(user => {
            var post = new Post({
              content: data.content,
              _creator: user._id,
            });
            post.to = data.to ? data.to : null;
            post.save().then(post => {
              var fn = pug.compileFile(path.join(__dirname, '../views/shared/post.pug'));
              // Render function
              user.friends.forEach(friend => {
                let canShare = true;

                let html = fn({
                  post: post,
                  author: user.username,
                  user: friend.username,
                  to: toUsername,
                  canShare: canShare
                });
                io.in(friend.username).emit('newpost', {post: html, to: toUsername, creator: user.username});
              });
              let canShare = false;
              let html = fn({
                post: post,
                author: user.username,
                user: socket.request.user.username,
                to: toUsername,
                canShare: canShare
              });
              io.in(user.username).emit('newpost', {post: html, to: toUsername, creator: user.username});
            });
          })
          .catch(err => {
            console.log(err);
          });
    });
    socket.on('sharePost', data => {
      Promise.all([
        User.findById(socket.request.user).populate('friends'),
        Post.findById(data).populate('_creator to')
      ]).spread((user, post) => {
        user.sharedPosts.push(data);
        var fn = pug.compileFile(path.join(__dirname, '../views/shared/post.pug'));

        let to = post.to === undefined || post.to === null ? '' : post.to.username;
        user.friends.forEach(friend => {
          let html = fn({
            post: post,
            author: post._creator.username,
            user: friend.username,
            to: to,
            canShare: false
          });
          io.in(friend.username).emit('newpost', {post: html, to: to, creator: post._creator.username, shared: user.username});
        });
      user.save();
      });
    });

    socket.on('chatMessage', (data) => {
      console.log(`chat message to ${data.to}, content: ${data.content}`);
      io.in(data.to).emit('chatMessage', {from: socket.request.user.username, content: data.content});
    });
  });

  return io;
};