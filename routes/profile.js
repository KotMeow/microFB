var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Post = require('../models/post');
/* GET users listing. */

router.get('/', function(req, res, next) {
  Post.find({}).populate('_creator').then(post => {
    res.send(post);
  });
});

router.get('/all', function(req, res, next) {
  User.find({}).then(users => {
    res.send(users);
  })

});

module.exports = router;
