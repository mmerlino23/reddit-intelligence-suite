const https = require('https');

class EnhancedRedditScanner {
    constructor(apiKey) {
        this.apiKey = apiKey || 'c3a374550fmsha7a66e40a84e60dp1de4d4jsn64eafe5401e4';
        this.hostname = 'reddit34.p.rapidapi.com';
        this.cache = new Map();
        this.cacheTimeout = 300000; // 5 minutes
    }

    // Core request method
    makeRequest(path) {
        return new Promise((resolve, reject) => {
            const options = {
                method: 'GET',
                hostname: this.hostname,
                path: path,
                headers: {
                    'x-rapidapi-key': this.apiKey,
                    'x-rapidapi-host': this.hostname
                }
            };

            const req = https.request(options, (res) => {
                let data = '';
                
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const parsed = JSON.parse(data);
                        if (res.statusCode === 200 && parsed.success) {
                            resolve(parsed.data);
                        } else {
                            resolve(null);
                        }
                    } catch (e) {
                        reject(new Error(`Failed to parse response: ${e.message}`));
                    }
                });
            });

            req.on('error', error => reject(error));
            req.end();
        });
    }

    // SEARCH FUNCTIONALITY - This is what we needed!
    async searchPosts(query, limit = 50) {
        console.log(`🔍 Searching Reddit for: "${query}"`);
        
        try {
            const data = await this.makeRequest(`/getSearchPosts?query=${encodeURIComponent(query)}`);
            
            if (data && data.posts) {
                return this.formatPosts(data.posts).slice(0, limit);
            }
            return [];
        } catch (error) {
            console.error('Search error:', error.message);
            return [];
        }
    }

    // Get posts by subreddit
    async getSubredditPosts(subreddit, sort = 'hot', limit = 50) {
        console.log(`📍 Fetching posts from r/${subreddit}`);
        
        try {
            const data = await this.makeRequest(`/getPostsBySubreddit?subreddit=${subreddit}&sort=${sort}`);
            
            if (data && data.posts) {
                return this.formatPosts(data.posts).slice(0, limit);
            }
            return [];
        } catch (error) {
            console.error('Subreddit fetch error:', error.message);
            return [];
        }
    }

    // Get top posts by subreddit
    async getTopSubredditPosts(subreddit, time = 'week', limit = 50) {
        console.log(`🏆 Fetching top posts from r/${subreddit} (${time})`);
        
        try {
            const data = await this.makeRequest(`/getTopPostsBySubreddit?subreddit=${subreddit}&time=${time}`);
            
            if (data && data.posts) {
                return this.formatPosts(data.posts).slice(0, limit);
            }
            return [];
        } catch (error) {
            console.error('Top posts fetch error:', error.message);
            return [];
        }
    }

    // Get posts by username
    async getUserPosts(username, sort = 'new', limit = 50) {
        console.log(`👤 Fetching posts by u/${username}`);
        
        try {
            const data = await this.makeRequest(`/getPostsByUsername?username=${username}&sort=${sort}`);
            
            if (data && data.posts) {
                return this.formatPosts(data.posts).slice(0, limit);
            }
            return [];
        } catch (error) {
            console.error('User posts fetch error:', error.message);
            return [];
        }
    }

    // Get comments by username
    async getUserComments(username, sort = 'hot', limit = 50) {
        console.log(`💬 Fetching comments by u/${username}`);
        
        try {
            const data = await this.makeRequest(`/getCommentsByUsername?username=${username}&sort=${sort}`);
            
            if (data && data.comments) {
                return this.formatComments(data.comments).slice(0, limit);
            }
            return [];
        } catch (error) {
            console.error('User comments fetch error:', error.message);
            return [];
        }
    }

    // Get post details with comments
    async getPostDetails(postUrl) {
        console.log(`📝 Fetching post details`);
        
        try {
            const encodedUrl = encodeURIComponent(postUrl);
            const data = await this.makeRequest(`/getPostDetails?post_url=${encodedUrl}`);
            
            return data;
        } catch (error) {
            console.error('Post details fetch error:', error.message);
            return null;
        }
    }

    // Get popular posts (various types)
    async getPopularPosts(sort = 'hot', limit = 50) {
        console.log(`🔥 Fetching popular posts (${sort})`);
        
        try {
            const data = await this.makeRequest(`/getPopularPosts?sort=${sort}`);
            
            if (data && data.posts) {
                return this.formatPosts(data.posts).slice(0, limit);
            }
            return [];
        } catch (error) {
            console.error('Popular posts fetch error:', error.message);
            return [];
        }
    }

    // Get rising posts
    async getRisingPosts(limit = 50) {
        console.log(`📈 Fetching rising posts`);
        
        try {
            const data = await this.makeRequest('/getRisingPopularPosts');
            
            if (data && data.posts) {
                return this.formatPosts(data.posts).slice(0, limit);
            }
            return [];
        } catch (error) {
            console.error('Rising posts fetch error:', error.message);
            return [];
        }
    }

    // Get top posts of all time
    async getTopPosts(time = 'year', limit = 50) {
        console.log(`🏆 Fetching top posts (${time})`);
        
        try {
            const data = await this.makeRequest(`/getTopPopularPosts?time=${time}`);
            
            if (data && data.posts) {
                return this.formatPosts(data.posts).slice(0, limit);
            }
            return [];
        } catch (error) {
            console.error('Top posts fetch error:', error.message);
            return [];
        }
    }

    // Get new subreddits
    async getNewSubreddits() {
        console.log(`🆕 Fetching new subreddits`);
        
        try {
            const data = await this.makeRequest('/getNewSubreddits');
            return data || [];
        } catch (error) {
            console.error('New subreddits fetch error:', error.message);
            return [];
        }
    }

    // Get popular subreddits
    async getPopularSubreddits() {
        console.log(`🌟 Fetching popular subreddits`);
        
        try {
            const data = await this.makeRequest('/getPopularSubreddits');
            return data || [];
        } catch (error) {
            console.error('Popular subreddits fetch error:', error.message);
            return [];
        }
    }

    // Format posts consistently
    formatPosts(posts) {
        if (!posts || !Array.isArray(posts)) return [];
        
        return posts.map(item => {
            const post = item.data || item;
            return {
                id: post.name || post.id,
                title: post.title,
                author: post.author,
                subreddit: post.subreddit,
                score: post.score || post.ups || 0,
                comments: post.num_comments || 0,
                url: post.url,
                text: post.selftext,
                created: post.created_utc ? new Date(post.created_utc * 1000) : new Date(),
                permalink: post.permalink ? `https://reddit.com${post.permalink}` : '',
                thumbnail: post.thumbnail,
                is_video: post.is_video || false,
                media: post.media
            };
        });
    }

    // Format comments consistently
    formatComments(comments) {
        if (!comments || !Array.isArray(comments)) return [];
        
        return comments.map(item => {
            const comment = item.data || item;
            return {
                id: comment.name || comment.id,
                body: comment.body,
                author: comment.author,
                score: comment.score || comment.ups || 0,
                subreddit: comment.subreddit,
                created: comment.created_utc ? new Date(comment.created_utc * 1000) : new Date(),
                permalink: comment.permalink ? `https://reddit.com${comment.permalink}` : '',
                parent_id: comment.parent_id,
                link_title: comment.link_title
            };
        });
    }

    // Advanced search with multiple sources
    async comprehensiveSearch(query, options = {}) {
        const {
            includeSubreddits = [],
            excludeSubreddits = [],
            sortBy = 'relevance',
            timeRange = 'all',
            limit = 100
        } = options;

        console.log(`🔍 Comprehensive search for: "${query}"`);
        
        const results = {
            searchResults: [],
            subredditResults: [],
            risingMatches: [],
            popularMatches: []
        };

        // 1. Direct search
        results.searchResults = await this.searchPosts(query, limit);

        // 2. Search in specific subreddits
        if (includeSubreddits.length > 0) {
            for (const sub of includeSubreddits) {
                const subPosts = await this.getSubredditPosts(sub, sortBy, limit);
                const filtered = subPosts.filter(post => 
                    post.title.toLowerCase().includes(query.toLowerCase()) ||
                    (post.text && post.text.toLowerCase().includes(query.toLowerCase()))
                );
                results.subredditResults.push(...filtered);
            }
        }

        // 3. Check rising posts
        const risingPosts = await this.getRisingPosts(50);
        results.risingMatches = risingPosts.filter(post =>
            post.title.toLowerCase().includes(query.toLowerCase())
        );

        // 4. Check popular posts
        const popularPosts = await this.getPopularPosts('hot', 50);
        results.popularMatches = popularPosts.filter(post =>
            post.title.toLowerCase().includes(query.toLowerCase())
        );

        // Combine and deduplicate
        const allPosts = [
            ...results.searchResults,
            ...results.subredditResults,
            ...results.risingMatches,
            ...results.popularMatches
        ];

        // Deduplicate by post ID
        const unique = Array.from(
            new Map(allPosts.map(post => [post.id, post])).values()
        );

        // Apply exclusions
        const filtered = unique.filter(post => 
            !excludeSubreddits.includes(post.subreddit)
        );

        return filtered.slice(0, limit);
    }
}

module.exports = EnhancedRedditScanner;