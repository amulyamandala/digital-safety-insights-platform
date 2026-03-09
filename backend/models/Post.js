const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Use reddit post_id as primary key
  title: { type: String, required: true },
  content: String,
  platform: { type: String, default: 'Reddit' },
  subreddit: String,
  date: String,
  comment_count: String
});

module.exports = mongoose.model('Post', PostSchema);
