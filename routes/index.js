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
    User.findById(req.user).populate('friends invites').then(user => {
      let friends = [];
      let posts = [];

      user.friends.forEach(friend => {
        friends.push(friend._id);
      });
      friends.push(req.user._id);
      Promise.reduce(friends, function(total, friend) {
        return Post.find({_creator : friend}).populate('_creator to').then(function(post) {
          post.forEach(po => {
            posts.push(po);
          });
          return posts;
        });
      }, 0).then(function(total) {
        total = _.sortBy(total, function(o) {
          return new moment(o.date);
        }).reverse();
        res.render('index', {user: user, posts: total});
      });
    });
  }
});

router.get('/like', (req, res) => {
  Post.findOne({}).then(post => {
    post.likes.push(req.user._id);
    post.save().then(() => {
      res.send(post);
    });
  });

});

router.get('/shared', (req, res) => {

  User.findOne({})
      .then(user => {
        return Post.find().populate('sharedBy');
      })
      .then(posts => {
        res.send(posts);
      });
});
module.exports = router;
