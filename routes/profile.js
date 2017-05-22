var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Post = require('../models/post');
var Promise = require("bluebird");

router.get('/', (req, res, next) => {
  Post.find({}).populate('_creator').then(post => {
    res.send(post);
  });
});

router.get('/me', (req, res, next) => {
  User.findById(req.user).populate('friends').then(users => {
    res.send(users);
  })
});
router.get('/:username', (req, res) => {
  if (!req.user) res.redirect('/auth/login');
  else {
    Promise.all([User.findById(req.user).populate('friends invites'), User.findOne({username: req.params.username})])
        .spread((user, profile, posts) => {
          let friends = false;
          user.friends.forEach(friend => {
            if (friend.username === profile.username) friends = true;
          });
          user.invites.forEach(friend => {
            if (friend.username === profile.username) friends = true;
          });
          if (req.user.username === user.username) friends = true;
          Post.find({_creator: profile}).populate('_creator').then(posts => {
            res.render('profile', {user: user, profile: profile, friends: friends, posts: posts})
          });
        });
  }
});
router.get('/search/:name', (req, res) => {
  User.find({username: {$regex: `.*${req.params.name}.*`, $options: 'i'}}).then(users => {
    console.log(req.user.username);
    users.forEach((user, index) => {
      if (user.username.toLowerCase() === req.user.username.toLowerCase()) {
        users.splice(index, 1);
      }
    });
    res.send(users);
  });
});
module.exports = router;
