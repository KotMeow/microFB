var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var lessMiddleware = require('less-middleware');
var bluebird = require("bluebird");
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var mongoose = require('mongoose');
mongoose.Promise = bluebird;
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var expressValidator = require('express-validator');
const MongoStore = require('connect-mongo')(session);
var compression = require('compression');

mongoose.connect('mongodb://localhost/test');

var index = require('./routes/index');
var profile = require('./routes/profile');
var auth = require('./routes/auth');
var files = require('./routes/files');

var app = express();
app.use(compression());
app.locals.moment = require('moment');
//nie działa na windowsowym redisie
// app.set('sessionStore', new RedisStore({
//   url: 'redis://meow:6f422b82fb841f5a753da69f4aa3bed9',
//   host: '50.30.35.9',
//   pass: '6f422b82fb841f5a753da69f4aa3bed9',
//   port: 3388,
//   client: require('redis').createClient(),
//   ttl:  260
// }));

app.set('sessionStore', new MongoStore({ mongooseConnection: mongoose.connection }));

const sessionSecret = 'wielkiCzarnyKot';
const sessionKey = 'express.sid';


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(expressValidator());

app.use(session({
  key: sessionKey,
  secret: sessionSecret,
  store: app.get('sessionStore'),
  resave: false,
  saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(lessMiddleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', index);
app.use('/profile', profile);
app.use('/auth', auth);

var User = require('./models/user');
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
