var passport = require('passport');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

var upload = multer({
  dest: 'uploads/',
  fileFilter: function (req, file, cb) {

    var filetypes = /jpeg|jpg|png/;
    var mimetype = filetypes.test(file.mimetype);
    var extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb("Error: File upload only supports the following filetypes - " + filetypes);
  }
}).single('avatar');

var authController = function (User) {

  let getLogin = (req, res) => {
    res.render('auth/login');
  };

  let postLogin = (req, res, next) => {
    passport.authenticate('local', (err, user) => {
      if (err) {
        res.send(err);
      }
      else if (!user) {
        res.render('auth/login', {error: 'Invalid username/password'});
      }
      else {
        req.logIn(user, err => {
          if (err) {
            return next(err);
          }
          else {
            res.redirect('/');
          }
        });
      }
    })(req, res, next);
  };

  let getRegister = (req, res) => {
    res.render('auth/register');
  };

  let postRegister = (req, res) => {

    upload(req, req.file, data => {
      if (data) {
        return res.render('auth/register', {
          errors: [{
            param: 'avatar',
            msg: 'Invalid picture format'
          }]
        });
      }
      req.checkBody({
        'email': {
          isEmail: {
            errorMessage: 'Invalid Email'
          }
        },
        'password': {
          notEmpty: true,
          isLength: {
            options: [{min: 3}],
            errorMessage: 'Password must have at least 2 chars'
          },
          errorMessage: 'Invalid Password'
        },
        'username': {
          isLength: {
            options: [{min: 2, max: 20}],
            errorMessage: 'Username must be between 2 and 20 chars long'
          },
        }
      });


      var errors = req.validationErrors();
      if (errors) {
        console.log(errors);
        return res.render('auth/register', {errors: errors});
      }
      let newUser = new User({
        username: req.body.username,
        email: req.body.email
      });
      if (req.file) {
        newUser.avatar.data = fs.readFileSync(req.file.path);
        newUser.avatar.contentType = req.file.mimetype;
      }
      User.register(newUser, req.body.password, (err, user) => {
        if (err) {
          return res.render('auth/register', {error: err.message});
        }

        passport.authenticate('local')(req, res, () => {
          res.redirect('/');
        });
      });
    });
  };

  var logout = (req, res) => {
    req.logout();
    res.redirect('/auth/login');
  };


  return {
    getLogin: getLogin,
    postLogin: postLogin,
    getRegister: getRegister,
    postRegister: postRegister,
    logout: logout
  };
};

module.exports = authController;