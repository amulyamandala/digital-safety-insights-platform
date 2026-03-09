const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'digital_safety_analyzer';

app.use(cors());
app.use(bodyParser.json());

let db;

async function connectDb() {
  try {
    const client = await MongoClient.connect(MONGODB_URI);
    db = client.db(DB_NAME);
    console.log('Connected to MongoDB (Native)');
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
  }
}

connectDb();

// Inline Routes to avoid any model imports
app.get('/api/posts', async (req, res) => {
  try {
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

app.get('/api/sentiment-summary', async (req, res) => {
  try {
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

app.get('/api/topic-distribution', async (req, res) => {
  try {
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

app.get('/api/trends', async (req, res) => {
  try {
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

app.get('/', (req, res) => {
  res.send('Digital Safety Analyzer API (Native) is running...');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
