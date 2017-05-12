var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  let sess = req.session;
  if (!sess.views) sess.views = 1;
  else sess.views++;
  console.log(req.session);
  res.render('index', { title: 'Expressssss', views: sess.views });
});

module.exports = router;
