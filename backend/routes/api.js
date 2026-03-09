const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Helper to get DB
const getDb = () => mongoose.connection.db;

// Get all posts with their analysis
router.get('/posts', async (req, res) => {
  try {
    const db = getDb();
    const analysis = await db.collection('analysisresults').find({}).toArray();
    const posts = await db.collection('posts').find({}).toArray();
    
    const postMap = {};
    posts.forEach(p => postMap[p._id] = p);
    
    const merged = analysis.map(a => ({
      ...a,
      post_id: postMap[a.post_id] || { title: 'Unknown', platform: 'Unknown' }
    }));
    
    res.json(merged);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get sentiment summary
router.get('/sentiment-summary', async (req, res) => {
  try {
    const db = getDb();
    const results = await db.collection('analysisresults').find({}).toArray();
    const summary = { positive: 0, neutral: 0, negative: 0 };
    
    results.forEach(r => {
      if (r.sentiment_score > 0.05) summary.positive++;
      else if (r.sentiment_score < -0.05) summary.negative++;
      else summary.neutral++;
    });
    
    res.json(summary);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get topic distribution
router.get('/topic-distribution', async (req, res) => {
  try {
    const db = getDb();
    const results = await db.collection('analysisresults').find({}).toArray();
    const distribution = {};
    
    results.forEach(r => {
      distribution[r.category] = (distribution[r.category] || 0) + 1;
    });
    
    const formatted = Object.keys(distribution).map(key => ({
      name: key,
      value: distribution[key]
    }));
    
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get trends
router.get('/trends', async (req, res) => {
  try {
    const db = getDb();
    const posts = await db.collection('posts').find({}).toArray();
    const trends = {};
    
    posts.forEach(p => {
      const dateKey = p.date ? p.date.substring(0, 10) : 'unknown';
      trends[dateKey] = (trends[dateKey] || 0) + 1;
    });
    
    const formatted = Object.keys(trends).map(key => ({
      date: key,
      count: trends[key]
    })).sort((a, b) => a.date.localeCompare(b.date));
    
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
