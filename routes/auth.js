var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');

router.get('/login', (req, res, next) =>{
  res.render('auth/login');
});

router.post('/login', (req, res, next) =>{

  passport.authenticate('local', (err, user) =>{
    if (err) res.send(err);
    else if (!user) res.render('auth/login', {error: 'Invalid username/password'});
    else {
      req.logIn(user, err =>{
        if (err) {
          return next(err);
        }
        else res.redirect('/')
      });
    }
  })(req, res, next);

});

router.get('/register', (req, res) =>{
  res.render('auth/register');
});

router.post('/register', (req, res) =>{
  User.register(new User({
    username: req.body.username,
    email: req.body.email
  }), req.body.password, (err, user) =>{
    if (err) {
      return res.render('auth/register', {error: err.message});
    }

    passport.authenticate('local')(req, res, () =>{
      res.redirect('/');
    });
  });
});

router.post('/checkexist', (req,res) => {
  User.find({username: req.body.username}).then(data => {
    console.log(data);
    res.send(data)
  });
});

router.get('/logout', (req, res) =>{
  req.logout();
  res.redirect('/auth/login');
});

module.exports = router;