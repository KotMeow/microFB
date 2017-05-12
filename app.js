var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var lessMiddleware = require('less-middleware');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);

const sessionStore = new RedisStore({
  host: 'localhost',
  port: 6379,
  client: require('redis').createClient(),
  ttl:  260
});

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

const sessionSecret = 'wielkiCzarnyKot';
const sessionKey = 'express.sid';


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(session({
  key: sessionKey,
  secret: sessionSecret,
  store: sessionStore,
  resave: false,
  saveUninitialized: true,
}));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(lessMiddleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));





app.use('/', index);
app.use('/users', users);

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
