const RedditFreeAPI = require('../modules/reddit-free-api');
const SentimentAnalyzer = require('../modules/sentiment');
const PainExtractor = require('../modules/pain-extractor');

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    
    try {
        const { keyword, limit = 50 } = req.body;
        
        if (!keyword) {
            res.status(400).json({ error: 'Keyword is required' });
            return;
        }
        
        // Using FREE Reddit API - no authentication needed
        const api = new RedditFreeAPI();
        const sentiment = new SentimentAnalyzer();
        const painExtractor = new PainExtractor();
        
        // Search for posts using YOUR PAID API
        const threads = await api.searchPosts(keyword);
        
        if (!threads || threads.length === 0) {
            res.status(200).json({
                keyword,
                message: 'No results found',
                totalThreads: 0
            });
            return;
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
        
        for (const thread of threads) {
            // Sentiment analysis
            const sentimentResult = sentiment.analyze(thread.title + ' ' + (thread.text || ''));
            analysis.sentimentBreakdown[sentimentResult.category]++;
            
            // Extract pain points
            const pains = painExtractor.extract(thread);
            analysis.painPoints.push(...pains);
            
            // Add to top threads
            analysis.topThreads.push({
                title: thread.title,
                subreddit: thread.subreddit,
                score: thread.score,
                comments: thread.comments,
                url: thread.permalink
            });
            
            analysis.totalComments += thread.comments || 0;
        }
        
        // Sort top threads by score
        analysis.topThreads.sort((a, b) => b.score - a.score);
        analysis.topThreads = analysis.topThreads.slice(0, 10);
        
        res.status(200).json(analysis);
    } catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({ error: error.message });
    }
};