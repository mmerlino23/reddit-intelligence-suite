const express = require('express');
const cors = require('cors');
const path = require('path');
const RedditFreeAPI = require('./modules/reddit-free-api');
const SentimentAnalyzer = require('./modules/sentiment');
const PainExtractor = require('./modules/pain-extractor');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// API endpoint for analysis
app.post('/api/analyze', async (req, res) => {
    try {
        const { keyword, limit = 50 } = req.body;
        
        if (!keyword) {
            return res.status(400).json({ error: 'Keyword is required' });
        }
        
        const api = new RedditFreeAPI();
        const sentiment = new SentimentAnalyzer();
        const painExtractor = new PainExtractor();
        
        // Search for posts
        const threads = await api.searchPosts(keyword);
        
        if (!threads || threads.length === 0) {
            return res.status(200).json({
                keyword,
                message: 'No results found',
                totalThreads: 0
            });
        }
        
        // Analyze threads
        const analysis = {
            keyword,
            timestamp: new Date().toISOString(),
            totalThreads: threads.length,
            totalComments: 0,
            sentimentBreakdown: { positive: 0, negative: 0, neutral: 0 },
            painPoints: [],
            topThreads: []
        };
        
        for (const thread of threads.slice(0, limit)) {
            const sentimentResult = sentiment.analyze(thread.title + ' ' + (thread.text || ''));
            analysis.sentimentBreakdown[sentimentResult.category]++;
            
            const pains = painExtractor.extract(thread);
            analysis.painPoints.push(...pains);
            
            analysis.topThreads.push({
                title: thread.title,
                subreddit: thread.subreddit,
                score: thread.score,
                comments: thread.comments,
                url: thread.permalink
            });
            
            analysis.totalComments += thread.comments || 0;
        }
        
        analysis.topThreads.sort((a, b) => b.score - a.score);
        analysis.topThreads = analysis.topThreads.slice(0, 10);
        
        res.status(200).json(analysis);
    } catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Brand analysis endpoint
app.post('/api/brand', async (req, res) => {
    try {
        const { brandName, domain } = req.body;
        
        if (!brandName) {
            return res.status(400).json({ error: 'Brand name is required' });
        }
        
        const api = new RedditFreeAPI();
        const sentiment = new SentimentAnalyzer();
        
        const searchTerms = [brandName];
        if (domain) searchTerms.push(domain);
        
        const allThreads = [];
        for (const term of searchTerms) {
            const results = await api.searchPosts(term);
            allThreads.push(...results);
        }
        
        const threads = Array.from(
            new Map(allThreads.map(t => [t.id, t])).values()
        );
        
        if (threads.length === 0) {
            return res.status(200).json({
                brand: brandName,
                status: 'no_data',
                message: 'No mentions found'
            });
        }
        
        const report = {
            brand: brandName,
            domain,
            generated: new Date().toISOString(),
            overview: {
                totalMentions: threads.length,
                totalEngagement: 0,
                avgEngagement: 0
            },
            sentiment: {
                overall: 0,
                breakdown: { positive: 0, negative: 0, neutral: 0 }
            },
            topThreads: []
        };
        
        let totalSentiment = 0;
        
        for (const thread of threads) {
            const engagement = thread.score + thread.comments;
            report.overview.totalEngagement += engagement;
            
            const sentimentResult = sentiment.analyze(thread.title + ' ' + (thread.text || ''));
            report.sentiment.breakdown[sentimentResult.category]++;
            totalSentiment += sentimentResult.score;
            
            report.topThreads.push({
                title: thread.title,
                subreddit: thread.subreddit,
                score: thread.score,
                comments: thread.comments,
                url: thread.permalink,
                sentiment: sentimentResult.score
            });
        }
        
        report.overview.avgEngagement = Math.round(report.overview.totalEngagement / threads.length);
        report.sentiment.overall = totalSentiment / threads.length;
        
        report.topThreads.sort((a, b) => b.score - a.score);
        report.topThreads = report.topThreads.slice(0, 10);
        
        const sentimentGrade = report.sentiment.overall > 0.3 ? 'A' :
                              report.sentiment.overall > 0 ? 'B' :
                              report.sentiment.overall > -0.3 ? 'C' : 'D';
        
        report.reportCard = {
            overall: sentimentGrade,
            summary: `${brandName} has ${report.sentiment.overall > 0 ? 'positive' : 'negative'} sentiment with ${threads.length} mentions.`
        };
        
        res.status(200).json(report);
    } catch (error) {
        console.error('Brand analysis error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', platform: 'Railway/Render' });
});

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Reddit Intelligence Suite running on port ${PORT}`);
    console.log(`📍 API endpoints: /api/analyze, /api/brand`);
});