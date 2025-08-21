const https = require('https');

// Reddit API via CORS proxy for Vercel
class RedditProxyAPI {
    constructor() {
        // Using a CORS proxy to bypass Reddit's blocking of Vercel
        this.proxyHost = 'corsproxy.io';
    }

    // Core request method via proxy
    makeRequest(redditPath) {
        return new Promise((resolve, reject) => {
            // Use CORS proxy to access Reddit
            const proxyPath = `/?https://www.reddit.com${redditPath}`;
            
            const options = {
                method: 'GET',
                hostname: this.proxyHost,
                path: proxyPath,
                headers: {
                    'Accept': 'application/json'
                }
            };

            const req = https.request(options, (res) => {
                let data = '';
                
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const parsed = JSON.parse(data);
                        resolve(parsed);
                    } catch (e) {
                        console.error('Parse error:', e.message);
                        resolve(null);
                    }
                });
            });

            req.on('error', error => {
                console.error('Request error:', error);
                resolve(null);
            });
            
            req.end();
        });
    }

    // SEARCH POSTS
    async searchPosts(query, sort = 'relevance') {
        console.log(`🔍 Searching Reddit via proxy for: "${query}"`);
        
        try {
            const path = `/search.json?q=${encodeURIComponent(query)}&sort=${sort}&limit=50`;
            const data = await this.makeRequest(path);
            
            if (data && data.data && data.data.children) {
                return this.formatPosts(data.data.children);
            }
            return [];
        } catch (error) {
            console.error('Search error:', error.message);
            return [];
        }
    }

    // Format posts
    formatPosts(children) {
        return children
            .filter(child => child.data && child.kind === 't3')
            .map(child => {
                const post = child.data;
                return {
                    id: post.id,
                    title: post.title || '',
                    subreddit: post.subreddit || '',
                    author: post.author || '[deleted]',
                    score: post.score || 0,
                    comments: post.num_comments || 0,
                    url: post.url || `https://reddit.com${post.permalink}`,
                    permalink: `https://reddit.com${post.permalink}`,
                    created: post.created_utc,
                    text: post.selftext || '',
                    thumbnail: post.thumbnail,
                    nsfw: post.over_18 || false
                };
            });
    }
}

module.exports = RedditProxyAPI;