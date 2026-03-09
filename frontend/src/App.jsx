import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts'
import { LayoutDashboard, ShieldAlert, MessageSquare, TrendingUp, Search, Activity } from 'lucide-react'

const COLORS = ['#00f2fe', '#4facfe', '#38bdf8', '#0ea5e9', '#0284c7'];
const SENTIMENT_COLORS = {
  positive: '#10b981',
  neutral: '#94a3b8',
  negative: '#f43f5e'
};

function App() {
  const [posts, setPosts] = useState([]);
  const [sentiment, setSentiment] = useState({ positive: 0, neutral: 0, negative: 0 });
  const [topics, setTopics] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsRes, sentimentRes, topicsRes, trendsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/posts'),
          axios.get('http://localhost:5000/api/sentiment-summary'),
          axios.get('http://localhost:5000/api/topic-distribution'),
          axios.get('http://localhost:5000/api/trends')
        ]);
        
        setPosts(postsRes.data);
        setSentiment(sentimentRes.data);
        setTopics(topicsRes.data);
        setTrends(trendsRes.data);
      } catch (err) {
        console.error("Error fetching data, using mock data:", err);
        // Fallback to mock data if API is not running
        setPosts(Array(5).fill({ post_id: '1', title: 'Sample Post', category: 'Safety', sentiment_score: 0.8 }));
        setSentiment({ positive: 25, neutral: 15, negative: 10 });
        setTopics([
          { name: 'harassment', value: 15 },
          { name: 'safety concerns', value: 25 },
          { name: 'reporting systems', value: 10 },
          { name: 'user experiences', value: 20 },
          { name: 'platform trust', value: 30 }
        ]);
        setTrends([
          { date: '2026-03-01', count: 5 },
          { date: '2026-03-02', count: 8 },
          { date: '2026-03-03', count: 12 },
          { date: '2026-03-04', count: 7 },
          { date: '2026-03-05', count: 15 }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const sentimentData = [
    { name: 'Positive', value: sentiment.positive, color: SENTIMENT_COLORS.positive },
    { name: 'Neutral', value: sentiment.neutral, color: SENTIMENT_COLORS.neutral },
    { name: 'Negative', value: sentiment.negative, color: SENTIMENT_COLORS.negative }
  ];

  return (
    <div className="dashboard">
      <header className="header">
        <div>
          <h1>Digital Safety Analyzer</h1>
          <p className="text-muted">Analyzing community health and safety trends</p>
        </div>
        <div className="card" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={20} className="text-primary" />
          <span>System Live</span>
        </div>
      </header>

      <div className="stats-grid">
        <div className="card">
          <div className="text-muted" style={{ marginBottom: '0.5rem' }}>Total Posts</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{posts.length}</div>
        </div>
        <div className="card">
          <div className="text-muted" style={{ marginBottom: '0.5rem' }}>Primary Platform</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>Reddit</div>
        </div>
        <div className="card">
          <div className="text-muted" style={{ marginBottom: '0.5rem' }}>Top Concern</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>Safety</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card">
          <h3>Sentiment Analysis</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3>Topic Distribution</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                />
                <Bar dataKey="value" fill="url(#colorTopic)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="colorTopic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f2fe" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#4facfe" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3>Discussion Trends</h3>
        <div className="chart-container" style={{ height: '350px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trends}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00f2fe" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00f2fe" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
              <Area type="monotone" dataKey="count" stroke="#00f2fe" fillOpacity={1} fill="url(#colorCount)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h3>Explored Keywords</h3>
        <div style={{ marginTop: '1rem' }}>
          {['safety', 'harassment', 'moderation', 'reporting', 'policy', 'trust', 'toxic', 'community', 'privacy', 'content'].map(kw => (
            <span key={kw} className="keyword-badge">{kw}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App
