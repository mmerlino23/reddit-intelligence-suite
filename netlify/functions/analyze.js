const https = require('https');

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { keyword } = JSON.parse(event.body);
        
        if (!keyword) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Keyword is required' })
            };
        }

        // Use Reddit's FREE JSON API
        const data = await fetchReddit(keyword);
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(data)
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};

function fetchReddit(query) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'www.reddit.com',
            path: `/search.json?q=${encodeURIComponent(query)}&limit=50`,
            headers: {
                'User-Agent': 'RedditIntelligenceSuite/1.0'
            }
        };

        https.get(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    const posts = parsed?.data?.children || [];
                    
                    const analysis = {
                        keyword: query,
                        totalThreads: posts.length,
                        totalComments: posts.reduce((sum, p) => sum + (p.data.num_comments || 0), 0),
                        topThreads: posts.slice(0, 10).map(p => ({
                            title: p.data.title,
                            subreddit: p.data.subreddit,
                            score: p.data.score,
                            comments: p.data.num_comments,
                            url: `https://reddit.com${p.data.permalink}`
                        }))
                    };
                    
                    resolve(analysis);
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}