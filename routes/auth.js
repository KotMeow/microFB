var express = require('express');
var router = express.Router();


var User = require('../models/user');

var authController = require('../controllers/authController')(User);


router.get('/login', authController.getLogin);

router.post('/login', authController.postLogin);

router.get('/register', authController.getRegister);

router.post('/register', authController.postRegister);

router.get('/logout', authController.logout);

router.post('/checkexist', (req,res) => {
  User.find({username: req.body.username}).then(data => {
    res.send(data);
  });
});

module.exports = router;