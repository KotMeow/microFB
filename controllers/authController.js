var passport = require('passport');

var authController = function (User) {

  let getLogin = (req, res, next) => {
    res.render('auth/login');
  };

  let postLogin = (req, res, next) => {
    passport.authenticate('local', (err, user) => {
      if (err) res.send(err);
      else if (!user) res.render('auth/login', {error: 'Invalid username/password'});
      else {
        req.logIn(user, err => {
          if (err) {
            return next(err);
          }
          else res.redirect('/')
        });
      }
    })(req, res, next);
  };

  let getRegister = (req, res) => {
    res.render('auth/register');
  };

  let postRegister = (req, res) => {
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
    User.register(new User({
      username: req.body.username,
      email: req.body.email
    }), req.body.password, (err, user) => {
      if (err) {
        return res.render('auth/register', {error: err.message});
      }

      passport.authenticate('local')(req, res, () => {
        res.redirect('/');
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
  }
};

module.exports = authController;