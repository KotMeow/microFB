var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Post = require('../models/post');
var Promise = require("bluebird");

router.get('/', function (req, res, next) {
  if (!req.user) res.redirect('/auth/login');
  else res.render('index', {user: req.user});
});
router.get('/posts', (req, res) => {
  User.findOne({username: "meow"}).then(user => {

    var post = new Post({
      content: "Once upon a timex.",
      _creator: user._id    // assign the _id from the person
    });

    post.save(function (err) {
      if (err) return res.send(err);
      else res.send(user);
    });
  })
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
        Promise.all([user1.save(),user2.save()]);

      })
      .then(() => {
        res.send('ok');
      })
      .catch(err => {
        throw err;
      });

});
module.exports = router;
