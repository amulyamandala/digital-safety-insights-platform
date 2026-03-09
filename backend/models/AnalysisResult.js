const mongoose = require('mongoose');

const AnalysisResultSchema = new mongoose.Schema({
  post_id: { type: String, required: true },
  sentiment_score: Number,
  category: String,
  keywords: [String],
  cleaned_text: String
});

module.exports = mongoose.model('AnalysisResult', AnalysisResultSchema);
