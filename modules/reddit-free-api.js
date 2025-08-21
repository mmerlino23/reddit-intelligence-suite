const https = require('https');

// FREE Reddit JSON API - No authentication needed
class RedditFreeAPI {
    constructor() {
        this.hostname = 'www.reddit.com';
        this.userAgent = 'RedditIntelligenceSuite/1.0';
    }

    // Core request method for Reddit's FREE JSON API
    makeRequest(path) {
        return new Promise((resolve, reject) => {
            const options = {
                method: 'GET',
                hostname: this.hostname,
                path: path,
                headers: {
                    'User-Agent': this.userAgent,
                    'Accept': 'application/json'
                }
            };

            const req = https.request(options, (res) => {
                let data = '';
                
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const parsed = JSON.parse(data);
                        if (res.statusCode === 200) {
                            resolve(parsed);
                        } else {
                            console.error(`HTTP ${res.statusCode}: ${data}`);
                            resolve(null);
                        }
                    } catch (e) {
                        console.error('Failed to parse response:', e.message);
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

    // SEARCH POSTS - Using FREE Reddit search
    async searchPosts(query, sort = 'relevance') {
        console.log(`🔍 Searching Reddit for: "${query}"`);
        
        try {
            const path = `/search.json?q=${encodeURIComponent(query)}&sort=${sort}&limit=100`;
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

    // GET HOT POSTS
    async getHotPosts() {
        const data = await this.makeRequest('/hot.json?limit=100');
        if (data && data.data && data.data.children) {
            return this.formatPosts(data.data.children);
        }
        return [];
    }

    // GET POPULAR POSTS
    async getPopularPosts() {
        const data = await this.makeRequest('/r/popular.json?limit=100');
        if (data && data.data && data.data.children) {
            return this.formatPosts(data.data.children);
        }
        return [];
    }

    // GET NEW POSTS
    async getNewPosts() {
        const data = await this.makeRequest('/new.json?limit=100');
        if (data && data.data && data.data.children) {
            return this.formatPosts(data.data.children);
        }
        return [];
    }

    // GET SUBREDDIT POSTS
    async getSubredditHot(subreddit) {
        const data = await this.makeRequest(`/r/${subreddit}/hot.json?limit=100`);
        if (data && data.data && data.data.children) {
            return this.formatPosts(data.data.children);
        }
        return [];
    }

    // SUBREDDIT SEARCH
    async searchSubreddit(subreddit, query) {
        const path = `/r/${subreddit}/search.json?q=${encodeURIComponent(query)}&restrict_sr=1&limit=100`;
        const data = await this.makeRequest(path);
        if (data && data.data && data.data.children) {
            return this.formatPosts(data.data.children);
        }
        return [];
    }

    // Format posts from Reddit response
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

module.exports = RedditFreeAPI;