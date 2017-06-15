var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Post = require('../models/post');
var chatHistory = require('../models/chatHistory');
var Promise = require("bluebird");
var moment = require("moment");
var _ = require('lodash');
var pug = require('pug');
var path = require('path');

router.get('/', function (req, res) {
  if (!req.user) {
    res.redirect('/auth/login');
  }
  else {
    req.session.openChats = [];
    User.findById(req.user).populate('friends invites sharedPosts').then(user => {
      let friends = [];
      let posts = [];

      user.friends.forEach(friend => {
        friends.push(friend._id);
      });
      friends.push(req.user._id);
      Promise.reduce(friends, function (total, friend) {
        return Post.find({_creator: friend}).populate('_creator to likes').then(function (post) {
          post.forEach(po => {
            posts.push(po);
          });
          return posts;
        });
      }, 0).then(function (total) {
        total = _.sortBy(total, function (o) {
          return new moment(o.date);
        }).reverse();

        res.locals.checkLikes = function (likes, user) {
          let liked = false;
          likes.forEach(like => {
            if (like.username === user) {
              liked = true;
            }
          });
          return liked;
        };
        res.locals.checkCanShare = function (post, user) {
          let canShare = true;
          let to = post.to === undefined || post.to === null ? '' : post.to.username;
          if (to.localeCompare(user) === 0 || post._creator.username.localeCompare(user) === 0) {
            canShare = false;
          }
          res.locals.shared.forEach(sharedPost => {
            if (sharedPost._id.toString() === post._id.toString()) {
              canShare = false;
            }
          });
          return canShare;

        };
        res.locals.shared = user.sharedPosts;
        res.render('index', {user: user, posts: total});
      });
    });
  }
});

router.post('/like', (req, res) => {
  let liked = false;
  let element;

  Post.findById(req.body.post).populate('likes')
      .then(post => {
        post.likes.forEach((like, index) => {
          if (req.user.username === like.username) {
            liked = true;
            element = index;
          }
        });
        if (liked) {
          post.likes.splice(element, 1);
        }
        else {
          post.likes.push(req.user._id);
        }
        return post.save();
      })
      .then((post) => {
        console.log(post);
        res.send({likes: post.likes.length, id: post.id});
      });
});

router.get('/shared', (req, res) => {
  User.findById(req.user).populate('sharedPosts').then(user => {
    res.send(user);
  });
});

router.get('/tag/:tag', (req, res) => {

  Promise.all([User.findById(req.user).populate('friends invites sharedPosts'), Post.find({tags: req.params.tag}).populate('_creator to likes')])
      .spread((user, posts) => {
        res.locals.checkLikes = function (likes, user) {
          let liked = false;
          likes.forEach(like => {
            if (like.username === user.username) {
              liked = true;
            }
          });
          return liked;
        };
        res.locals.checkCanShare = function (post, user) {
          let canShare = true;
          let to = post.to === undefined || post.to === null ? '' : post.to.username;
          if (to.localeCompare(user) === 0 || post._creator.username.localeCompare(user) === 0) {
            canShare = false;
          }
          res.locals.shared.forEach(sharedPost => {
            if (sharedPost._id.toString() === post._id.toString()) {
              canShare = false;
            }
          });
          return canShare;

        };

        posts = _.sortBy(posts, function (o) {
          return new moment(o.date);
        }).reverse();

        res.locals.shared = user.sharedPosts;
        res.render('tagWall', {tag: req.params.tag, user: user, posts: posts});
      });

});

router.post('/getchat', (req, res) => {
  if (req.body.user === "all") {
    var fn = pug.compileFile(path.join(__dirname, '../views/shared/chatWindow.pug'));
    let html = fn({user: "all", history: [], userid: ''});
    res.send(html);
  } else {
    chatHistory.findOne()
        .and([
          {$or: [{user1: req.body.userid}, {user2: req.body.userid}]},
          {$or: [{user1: req.user._id}, {user2: req.user._id}]}
        ]).then(retrHistory => {
      var fn = pug.compileFile(path.join(__dirname, '../views/shared/chatWindow.pug'));
      let html = fn({user: req.body.user, userid: req.body.userid, history: retrHistory.history});
      req.session.openChats.push(req.body.user);
      res.send(html);
    });
  }
});
router.get('/openChats', (req, res) => {
  res.send(req.session.openChats);
});
module.exports = router;
