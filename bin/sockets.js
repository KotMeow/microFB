var socketio = require('socket.io');
var User = require('../models/user');
var Post = require('../models/post');
var chatHistory = require('../models/chatHistory');
var passportSocketIo = require("passport.socketio");
var Promise = require("bluebird");
var pug = require('pug');
var path = require('path');
var uuid = require('node-uuid');
var fs = require("fs");

module.exports.listen = function (io) {

  io.on('connection', function (socket) {
    var username = socket.request.user.username;
    console.log(`User ${username} connected`);
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
            io.in(user1.username).emit('accept', {user: user2.username, userId: user2._id});
            io.in(user2.username).emit('accept', {user: user1.username, userId: user1._id});
            return chatHistory.create({
              user1: user1._id,
              user2: user2._id
            });
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
      let tags = data.content.match(/#(\S+)/g);
      if (tags) {
        tags.forEach((part, index, arr) => {
          arr[index] = arr[index].split('#')[1];
        });
      }

      User.findById(socket.request.user).populate('friends')
          .then(user => {
            if (data.file) {
              var mimeType = data.file.split(';')[0].split(':')[1];
              var base64Data = data.file.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");

              var filename = uuid.v4();
              fs.writeFile(`uploads/${filename}`, base64Data, 'base64', err => {
                if (err) {
                  console.log(err);
                }
                fs.readFile(`uploads/${filename}`, (err, img) => {
                  var post = new Post({
                    content: data.content,
                    _creator: user._id,
                    tags: tags
                  });
                  post.to = data.to ? data.to : null;
                  post.image.data = img;
                  post.image.contentType = mimeType;
                  post.save().then(post => {
                    var fn = pug.compileFile(path.join(__dirname, '../views/shared/post.pug'));
                    // Render function
                    user.friends.forEach(friend => {
                      let canShare = true;
                      let html = fn({
                        post: post,
                        author: user.username,
                        user: friend.username,
                        avatar: user.avatar.data,
                        to: toUsername,
                        canShare: canShare
                      });
                      io.in(friend.username).emit('newpost', {
                        post: html,
                        to: toUsername,
                        creator: user.username,
                        tags: tags
                      });
                    });
                    let canShare = false;
                    let html = fn({
                      post: post,
                      author: user.username,
                      avatar: user.avatar.data,
                      user: socket.request.user.username,
                      to: toUsername,
                      canShare: canShare
                    });
                    io.in(user.username).emit('newpost', {
                      post: html,
                      to: toUsername,
                      creator: user.username,
                      avatar: user.avatar.data,
                      tags: tags
                    });
                  });
                });
              });
            } else {
              var post = new Post({
                content: data.content,
                _creator: user._id,
                tags: tags
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
                    avatar: user.avatar.data,
                    to: toUsername,
                    canShare: canShare
                  });
                  io.in(friend.username).emit('newpost', {
                    post: html,
                    to: toUsername,
                    creator: user.username,
                    tags: tags
                  });
                });
                let canShare = false;
                let html = fn({
                  post: post,
                  author: user.username,
                  avatar: user.avatar.data,
                  user: socket.request.user.username,
                  to: toUsername,
                  canShare: canShare
                });
                io.in(user.username).emit('newpost', {
                  post: html,
                  to: toUsername,
                  creator: user.username,
                  avatar: user.avatar.data,
                  tags: tags
                });
              });
            }
          })
          .catch(err => {
            console.log(err);
          });
    });

    socket.on('sharePost', data => {
      Promise.all([
        User.findById(socket.request.user).populate('friends'),
        Post.findById(data).populate('_creator to comments.author')
      ]).spread((user, post) => {
        user.sharedPosts.push(data);
        var fn = pug.compileFile(path.join(__dirname, '../views/shared/post.pug'));

        let to = post.to === undefined || post.to === null ? '' : post.to.username;
        user.friends.forEach(friend => {
          let html = fn({
            post: post,
            author: post._creator.username,
            avatar: post._creator.avatar.data,
            user: friend.username,
            to: to,
            canShare: false,
            shared: user.username
          });
          io.in(friend.username).emit('newpost', {
            post: html,
            to: to,
            creator: post._creator.username,
            shared: user.username
          });
        });
        let html = fn({
          post: post,
          author: post._creator.username,
          avatar: post._creator.avatar.data,
          user: user.username,
          to: to,
          canShare: false,
          shared: user.username
        });
        io.in(user.username).emit('newpost', {
          post: html,
          to: to,
          creator: post._creator.username,
          shared: user.username
        });
        user.save();
      });
    });

    socket.on('chatMessage', (data) => {
      console.log(data.to);
      if (data.to === "all") {
        User.findById(socket.request.user).populate('friends').then(user => {
          user.friends.forEach(friend => {
            chatHistory.findOne()
                .and([
                  {$or: [{user1: user._id}, {user2: user._id}]},
                  {$or: [{user1: friend._id}, {user2: friend._id}]}
                ]).then(retrHistory => {
              retrHistory.history.push({
                from: socket.request.user.username,
                message: data.content
              });
              retrHistory.save()
                  .then(() => {
                    io.in(friend.username).emit('chatMessage', {
                      from: user.username,
                      content: data.content,
                      fromId: user._id
                    });
                  })
                  .catch(err => {
                    console.log(err);
                  });
            });
          });
        });
      } else {
        let user = socket.request.user;
        chatHistory.findOne()
            .and([
              {$or: [{user1: user._id}, {user2: user._id}]},
              {$or: [{user1: data.toid}, {user2: data.toid}]}
            ]).then(retrHistory => {
          retrHistory.history.push({
            from: socket.request.user.username,
            message: data.content
          });
          retrHistory.save()
              .then(() => {
                io.in(data.to).emit('chatMessage', {from: user.username, content: data.content, fromId: user._id});
              })
              .catch(err => {
                console.log(err);
              });
        });
      }
    });

    socket.on('like', data => {
      User.findById(socket.request.user).populate('friends').then(user => {
        user.friends.forEach(friend => {
          io.in(friend.username).emit('like', data);
        });
      });
    });

    socket.on('comment', data => {
      Promise.all([User.findById(socket.request.user).populate('friends'), Post.findById(data.postid)])
          .spread((user, post) => {
            let comment = {
              author: user._id,
              content: data.content
            };
            post.comments.push(comment);
            post.save().then(() => {
              var fn = pug.compileFile(path.join(__dirname, '../views/shared/comment.pug'));
              let html = fn({author: user, comment: comment.content});
              user.friends.forEach(friend => {
                io.in(friend.username).emit('comment', {
                  comment: html,
                  postid: data.postid
                });
              });
              io.in(user.username).emit('comment', {
                comment: html,
                postid: data.postid
              });
            });
          })
          .catch(err => {
            console.log(err);
          });
    });
  });

  return io;
};