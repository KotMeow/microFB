var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Post = require('../models/post');
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
          console.log(post);
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
          console.log('liked');
          post.likes.splice(element, 1);
        }
        else {
          console.log('push');
          post.likes.push(req.user._id);
        }
        return post.save();
      })
      .then((post) => {
        res.send(post);
      });
});

router.get('/shared', (req, res) => {

  User.findById(req.user).populate('sharedPosts').then(user => {
    res.send(user);
  });
});
module.exports = router;
