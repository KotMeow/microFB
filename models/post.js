var mongoose = require('mongoose');
var Schema = mongoose.Schema;

let commentSchema = new Schema({
  author: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  content: String
},{ _id : false });

let Post = new Schema({
  _creator: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  to: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  date: {
    type: Date,
    default: Date.now
  },
  content: String,
  tags: [String],
  comments: [commentSchema],
  likes: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
  image: {
    data: {
      type: Buffer,
      default: null
    },
    contentType: String
  }
});

module.exports = mongoose.model('Post', Post);