var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Post = require('../models/post');
var Promise = require("bluebird");
var _ = require('lodash');
var moment = require("moment");


router.get('/', (req, res) => {
  Post.find({}).populate('_creator').then(post => {
    res.send(post);
  });
});

router.get('/me', (req, res) => {
  User.findById(req.user).populate('friends').then(users => {
    res.send(users);
  });
});

router.get('/:username', (req, res) => {
  if (!req.user) {
    res.redirect('/auth/login');
  }
  else {
    Promise.all([User.findById(req.user).populate('friends invites'), User.findOne({username: req.params.username}).populate('invites')])
        .spread((user, profile) => {
          let friends = false;
          let inviteSent = false;
          user.friends.forEach(friend => {
            if (friend.username.localeCompare(profile.username) === 0) {
              friends = true;
            }
          });
          profile.invites.forEach(friend => {
            if (friend.username.localeCompare(user.username) === 0) {
              inviteSent = true;
            }
          });
          if (req.user.username.localeCompare(profile.username) === 0) {
            friends = true;
          }

          Post.find({$or: [{_creator: profile}, {to: profile}]}).populate('_creator to').then(posts => {

            posts = _.sortBy(posts, function (o) {
              return new moment(o.date);
            }).reverse();

            res.render('profile', {
              user: user,
              profile: profile,
              friends: friends,
              inviteSent: inviteSent,
              posts: posts
            });
          }).catch(err => {
            console.log(err);
          });
        });
  }
});

router.get('/search/:name', (req, res) => {
  User.find({username: {$regex: `.*${req.params.name}.*`, $options: 'i'}}).then(users => {
    users.forEach((user, index) => {
      if (user.username.toLowerCase() === req.user.username.toLowerCase()) {
        users.splice(index, 1);
      }
    });
    res.send(users);
  });
});




module.exports = router;
