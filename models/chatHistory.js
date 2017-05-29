var mongoose = require('mongoose');
var Schema = mongoose.Schema;

let ChatHistory = new Schema({
  user1: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  user2: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  history: []
});

module.exports = mongoose.model('ChatHistory', ChatHistory);