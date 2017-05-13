var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');

router.get('/login', function (req, res, next) {
  res.render('auth/login');
});

router.post('/login', function (req, res, next) {

  passport.authenticate('local', function (err, user) {
    if (err) res.send(err);
    else if (!user) res.render('auth/login', {error: 'usernotfound'});
    else {
      req.logIn(user, function (err) {
        if (err) {
          return next(err);
        }
        else res.redirect('/')
      });
    }
  })(req, res, next);

});

router.get('/register', function (req, res) {
  res.render('auth/register');
});

router.post('/register', function (req, res) {
  User.register(new User({
    username: req.body.username,
    email: req.body.email
  }), req.body.password, function (err, user) {
    if (err) {
      console.log('error');
      return res.render('auth/register', {user: user});
    }

    passport.authenticate('local')(req, res, function () {
      res.redirect('/');
    });
  });
});

router.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/auth/login');
});

module.exports = router;