const https = require('https');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // Test direct Reddit API call
    const options = {
        method: 'GET',
        hostname: 'www.reddit.com',
        path: '/search.json?q=roofing&limit=5',
        headers: {
            'User-Agent': 'RedditIntelligenceSuite/1.0',
            'Accept': 'application/json'
        }
    };

    https.request(options, (response) => {
        let data = '';
        response.on('data', chunk => data += chunk);
        response.on('end', () => {
            try {
                const parsed = JSON.parse(data);
                const posts = parsed?.data?.children || [];
                res.status(200).json({
                    success: true,
                    statusCode: response.statusCode,
                    found: posts.length,
                    firstTitle: posts[0]?.data?.title || 'No posts',
                    raw: data.substring(0, 200)
                });
            } catch (e) {
                res.status(200).json({
                    error: e.message,
                    statusCode: response.statusCode,
                    data: data.substring(0, 500)
                });
            }
        });
    }).on('error', (e) => {
        res.status(500).json({ error: e.message });
    }).end();
};