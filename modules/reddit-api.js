const http = require('https');

// YOUR PAID RAPIDAPI REDDIT34 SERVICE
class RedditAPI {
    constructor() {
        // Clean the API key of any whitespace or invalid characters
        const key = process.env.RAPIDAPI_KEY || '18a8353a07msh22bbf53c2cc3e32p136ef3jsn1ad5ad5d0630';
        this.apiKey = key.trim().replace(/[\r\n\t]/g, '');
        this.host = 'reddit34.p.rapidapi.com';
    }

    // Core request method using YOUR PROVIDED HTTP CLIENT CODE
    makeRequest(endpoint, params = {}) {
        return new Promise((resolve, reject) => {
            // Build query string
            const queryParams = new URLSearchParams(params).toString();
            const path = queryParams ? `${endpoint}?${queryParams}` : endpoint;

            const options = {
                method: 'GET',
                hostname: this.host,
                port: null,
                path: path,
                headers: {
                    'x-rapidapi-key': this.apiKey,
                    'x-rapidapi-host': this.host,
                    'useQueryString': true
                }
            };

            const req = http.request(options, function (res) {
                const chunks = [];

                res.on('data', function (chunk) {
                    chunks.push(chunk);
                });

                res.on('end', function () {
                    const body = Buffer.concat(chunks);
                    try {
                        const data = JSON.parse(body.toString());
                        resolve(data);
                    } catch (e) {
                        console.error('Failed to parse response:', e);
                        resolve(null);
                    }
                });
            });

            req.on('error', (e) => {
                console.error('Request error:', e);
                resolve(null);
            });

            req.end();
        });
    }

    // SEARCH POSTS - Using YOUR PAID API
    async searchPosts(query, sort = 'relevance') {
        console.log(`🔍 Searching with PAID Reddit34 API for: "${query}"`);
        const data = await this.makeRequest('/getSearchPosts', { 
            query: query,
            sort: sort 
        });
        return this.formatResults(data);
    }

    // GET HOT POSTS
    async getHotPosts() {
        const data = await this.makeRequest('/getHotPosts');
        return this.formatResults(data);
    }

    // GET POPULAR POSTS
    async getPopularPosts(time = 'day') {
        const data = await this.makeRequest('/getPopularPosts', { time });
        return this.formatResults(data);
    }

    // GET NEW POSTS
    async getNewPosts() {
        const data = await this.makeRequest('/getNewPosts');
        return this.formatResults(data);
    }

    // GET RISING POSTS
    async getRisingPosts() {
        const data = await this.makeRequest('/getRisingPosts');
        return this.formatResults(data);
    }

    // GET SUBREDDIT HOT
    async getSubredditHot(subreddit) {
        const data = await this.makeRequest('/getSubredditHot', { subreddit });
        return this.formatResults(data);
    }

    // GET SUBREDDIT NEW
    async getSubredditNew(subreddit) {
        const data = await this.makeRequest('/getSubredditNew', { subreddit });
        return this.formatResults(data);
    }

    // GET SUBREDDIT POPULAR
    async getSubredditPopular(subreddit) {
        const data = await this.makeRequest('/getSubredditPopular', { subreddit });
        return this.formatResults(data);
    }

    // GET POST DETAILS
    async getPostDetails(url) {
        const data = await this.makeRequest('/getPostDetails', { url });
        return data;
    }

    // SUBREDDIT SEARCH
    async searchSubreddit(subreddit, query) {
        const data = await this.makeRequest('/getSubredditSearch', { 
            subreddit: subreddit,
            query: query 
        });
        return this.formatResults(data);
    }

    // Format results from RapidAPI response
    formatResults(data) {
        if (!data) return [];
        
        // Handle different response formats from Reddit34 API
        if (data.posts) {
            return data.posts.map(post => this.formatPost(post));
        }
        
        if (data.data && data.data.children) {
            return data.data.children.map(child => this.formatPost(child.data));
        }

        if (Array.isArray(data)) {
            return data.map(post => this.formatPost(post));
        }

        return [];
    }

    // Format individual post
    formatPost(post) {
        return {
            id: post.id || post.name,
            title: post.title || '',
            subreddit: post.subreddit || post.subreddit_name_prefixed?.replace('r/', ''),
            author: post.author || '[deleted]',
            score: post.score || post.ups || 0,
            comments: post.num_comments || post.numComments || 0,
            url: post.url || `https://reddit.com${post.permalink}`,
            permalink: post.permalink,
            created: post.created || post.created_utc,
            text: post.selftext || post.text || '',
            thumbnail: post.thumbnail,
            media: post.media,
            isVideo: post.is_video || false,
            nsfw: post.over_18 || post.nsfw || false
        };
    }
}

module.exports = RedditAPI;