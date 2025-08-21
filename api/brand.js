const EnhancedScanner = require('../modules/enhanced-scanner');
const SentimentAnalyzer = require('../modules/sentiment');

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
        const { brandName, domain } = req.body;
        
        if (!brandName) {
            res.status(400).json({ error: 'Brand name is required' });
            return;
        }
        
        const scanner = new EnhancedScanner(process.env.RAPIDAPI_KEY);
        const sentiment = new SentimentAnalyzer();
        
        // Search for brand mentions
        const searchTerms = [brandName];
        if (domain) {
            searchTerms.push(domain);
        }
        
        const allThreads = [];
        for (const term of searchTerms) {
            const results = await scanner.searchPosts(term, 50);
            allThreads.push(...results);
        }
        
        // Deduplicate
        const threads = Array.from(
            new Map(allThreads.map(t => [t.id, t])).values()
        );
        
        if (threads.length === 0) {
            res.status(200).json({
                brand: brandName,
                status: 'no_data',
                message: 'No mentions found for this brand'
            });
            return;
        }
        
        // Build report
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
        
        // Analyze each thread
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
        
        // Sort and limit top threads
        report.topThreads.sort((a, b) => b.score - a.score);
        report.topThreads = report.topThreads.slice(0, 10);
        
        // Generate report card
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
};