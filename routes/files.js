var express = require('express');
var router = express.Router();
var User = require('../models/user');
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


router.get('/upload', (req, res) => {
  res.render('upload');
});

router.post('/upload', (req, res) => {
  upload(req, req.file, data => {
    if (data) {
      console.log(data);
    } else {
      User.findById(req.user).then(user => {
        console.log(req.file);
        user.avatar.data = fs.readFileSync(req.file.path);
        user.avatar.contentType = req.file.mimetype;
        return user.save();
      }).catch(err => {
        console.log(err);
      });
    }
  });
  res.status(200).send('ok');
});

module.exports = router;