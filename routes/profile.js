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
    res.locals.checkLikes = function (likes, user) {
      let liked = false;
      console.log(likes);
      likes.forEach(like => {
        if (user.equals( like) || user.equals(like._id)) {
          liked = true;
        }
      });
      return liked;
    };
    res.locals.checkShared = function (id) {
      let shared = false;
      res.locals.shared.forEach(post => {
        if (post._id === id) {
          shared = true;
        }
      });
      return shared;
    };
    res.locals.checkCanShare = function (post, user) {
      let canShare = true;
      let to = post.to === undefined || post.to === null ? ' ' : post.to.username;
      if (to.localeCompare(user) === 0 || post._creator.username.localeCompare(user) === 0) {
        canShare = false;
      }
      res.locals.sharedPosts.forEach(sharedPost => {
        if (sharedPost._id.toString() === post._id.toString()) {
          canShare = false;
        }
      });
      return canShare;
    };
    Promise.all([
      User.findById(req.user).populate({
        path: 'friends invites sharedPosts',
        populate: {path: '_creator to'}
      }),
      User.findOne({username: req.params.username}).populate({
        path: 'invites sharedPosts',
        populate: {path: '_creator to'}
      })])
        .spread((user, profile) => {
          res.locals.sharedPosts = user.sharedPosts;
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

          Post.find({$or: [{_creator: profile}, {to: profile}]}).populate({
            path: 'sharedPosts _creator to likes',
            populate: {path: 'likes'}
          }).then(posts => {
            res.locals.shared = profile.sharedPosts;
            profile.sharedPosts.forEach(post => {
              posts.push(post);
            });

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
