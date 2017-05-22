var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Post = require('../models/post');
var Promise = require("bluebird");
var moment = require("moment");
var _ = require('lodash');

router.get('/', function (req, res, next) {
  if (!req.user) res.redirect('/auth/login');
  else {
    User.findById(req.user).populate('friends invites').then(user => {
      let friends = [];
      let posts = [];

      user.friends.forEach(friend => {
        friends.push(friend._id);
      });
      friends.push(req.user._id);
      Promise.reduce(friends, function(total, friend) {
        return Post.find({_creator : friend}).populate('_creator').then(function(post) {
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

router.get('/posty', (req,res) => {


});

router.get('/like', (req, res) => {
  Post.findOne({}).then(post => {
    post.likes.push(req.user._id);
    post.save().then(() => {
      res.send(post);
    })
  })
});

router.get('/friend', (req, res) => {
  Promise.all([User.findOne({username: "kociak"}), User.findById(req.user._id)])
      .spread((user1, user2) => {
        user1.friends.push(user2._id);
        user2.friends.push(user1._id);
        Promise.all([user1.save(), user2.save()]).catch(err => {
          throw err;
        });

      })
      .then(() => {
        res.send('ok');
      })
      .catch(err => {
        throw err;
      });
});

module.exports = router;
