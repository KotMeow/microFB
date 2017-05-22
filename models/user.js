var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({
  username: String,
  password: String,
  email: String,
  invites: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
  friends: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}]
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);