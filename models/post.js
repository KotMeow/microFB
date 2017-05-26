var mongoose = require('mongoose');
var Schema = mongoose.Schema;

let Post = new Schema({
  _creator: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  to: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  date: {
    type: Date,
    default: Date.now
  },
  content: String,
  likes: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
  image: {
    data: Buffer,
    contentType: String
  }
});

module.exports = mongoose.model('Post', Post);