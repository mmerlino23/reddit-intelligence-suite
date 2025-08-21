const https = require('https');
const fs = require('fs');
const path = require('path');

class RedditScanner {
    constructor(apiKey) {
        this.apiKey = apiKey || 'c3a374550fmsha7a66e40a84e60dp1de4d4jsn64eafe5401e4';
        this.hostname = 'reddit34.p.rapidapi.com';
        this.cache = new Map();
        this.cacheTimeout = 300000; // 5 minutes
    }

    async scanKeyword(keyword, limit = 50) {
        console.log(`Scanning Reddit for: "${keyword}"`);
        
        // Check cache first
        const cacheKey = `${keyword}_${limit}`;
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                console.log('Using cached data...');
                return cached.data;
            }
        }

        try {
            // For now, we'll use popular posts and filter by keyword
            // In a real implementation, you'd use Reddit's search API
            const posts = await this.fetchPopularPosts();
            
            // Filter posts that contain the keyword
            const filteredPosts = posts.filter(post => {
                const searchText = `${post.title} ${post.text || ''}`.toLowerCase();
                return searchText.includes(keyword.toLowerCase());
            });

            // If not enough matches, get more posts
            if (filteredPosts.length < limit) {
                const morePosts = await this.fetchPopularPosts('new');
                const moreFiltered = morePosts.filter(post => {
                    const searchText = `${post.title} ${post.text || ''}`.toLowerCase();
                    return searchText.includes(keyword.toLowerCase()) && 
                           !filteredPosts.find(p => p.id === post.id);
                });
                filteredPosts.push(...moreFiltered);
            }

            const results = filteredPosts.slice(0, limit);
            
            // Cache results
            this.cache.set(cacheKey, {
                timestamp: Date.now(),
                data: results
            });

            return results;
        } catch (error) {
            console.error('Scanner error:', error.message);
            return [];
        }
    }

    async scanBrand(brandName, domain) {
        const searchTerms = [brandName];
        if (domain) {
            searchTerms.push(domain);
            searchTerms.push(domain.replace('.com', '').replace('.io', ''));
        }

        const allResults = [];
        
        for (const term of searchTerms) {
            const results = await this.scanKeyword(term, 100);
            allResults.push(...results);
        }

        // Deduplicate by post ID
        const unique = Array.from(
            new Map(allResults.map(post => [post.id || post.title, post])).values()
        );

        return unique;
    }

    async scanSubreddit(subreddit, limit = 50) {
        // Scan specific subreddit (simulated with popular posts)
        const posts = await this.fetchPopularPosts();
        return posts.filter(p => p.subreddit === subreddit).slice(0, limit);
    }

    async getThreadComments(threadUrl) {
        // In a real implementation, this would fetch actual comments
        // For now, return simulated comment data
        return [
            {
                author: 'user1',
                text: 'This is a great point about the issue',
                score: 45,
                replies: 3
            },
            {
                author: 'user2',
                text: 'I\'ve been struggling with this problem for months',
                score: 23,
                replies: 1
            }
        ];
    }

    fetchPopularPosts(sort = 'hot') {
        return new Promise((resolve, reject) => {
            const options = {
                method: 'GET',
                hostname: this.hostname,
                path: `/getPopularPosts?sort=${sort}`,
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
                        if (res.statusCode === 200 && parsed.success && parsed.data && parsed.data.posts) {
                            const posts = parsed.data.posts.map(item => ({
                                id: item.data.name,
                                title: item.data.title,
                                author: item.data.author,
                                subreddit: item.data.subreddit,
                                score: item.data.score,
                                comments: item.data.num_comments,
                                url: item.data.url,
                                text: item.data.selftext,
                                created: new Date(item.data.created_utc * 1000),
                                permalink: `https://reddit.com${item.data.permalink}`
                            }));
                            resolve(posts);
                        } else {
                            resolve([]);
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

    async analyzeThread(thread) {
        // Deep analysis of a single thread
        const analysis = {
            thread: {
                title: thread.title,
                author: thread.author,
                subreddit: thread.subreddit,
                score: thread.score,
                comments: thread.comments,
                url: thread.permalink
            },
            metrics: {
                engagement: this.calculateEngagement(thread),
                virality: this.calculateVirality(thread),
                controversiality: 0 // Would need actual upvote/downvote ratio
            },
            topics: this.extractTopics(thread),
            entities: this.extractEntities(thread),
            questions: this.extractQuestions(thread)
        };

        return analysis;
    }

    calculateEngagement(thread) {
        // Simple engagement score
        const commentRatio = thread.comments / (thread.score + 1);
        const ageHours = (Date.now() - thread.created) / (1000 * 60 * 60);
        const velocityScore = (thread.score + thread.comments) / Math.max(ageHours, 1);
        
        return {
            commentRatio: commentRatio.toFixed(2),
            velocityScore: velocityScore.toFixed(2),
            totalEngagement: thread.score + thread.comments
        };
    }

    calculateVirality(thread) {
        // Virality potential score (0-100)
        const factors = {
            score: Math.min(thread.score / 1000, 1) * 30,
            comments: Math.min(thread.comments / 100, 1) * 20,
            titleLength: (thread.title.length > 20 && thread.title.length < 100) ? 10 : 0,
            hasQuestion: thread.title.includes('?') ? 10 : 0,
            controversial: thread.title.match(/unpopular|controversial|hot take/i) ? 15 : 0,
            emotional: thread.title.match(/amazing|terrible|love|hate|best|worst/i) ? 15 : 0
        };
        
        return Math.min(Object.values(factors).reduce((a, b) => a + b, 0), 100);
    }

    extractTopics(thread) {
        // Simple topic extraction
        const text = `${thread.title} ${thread.text || ''}`.toLowerCase();
        const topics = [];
        
        const topicPatterns = {
            technology: /software|app|tech|computer|ai|ml|code|program/,
            business: /business|company|startup|entrepreneur|market/,
            education: /learn|course|tutorial|guide|teach/,
            problem: /problem|issue|bug|error|broken|fix/,
            request: /need|want|looking for|help|please/
        };
        
        for (const [topic, pattern] of Object.entries(topicPatterns)) {
            if (pattern.test(text)) {
                topics.push(topic);
            }
        }
        
        return topics;
    }

    extractEntities(thread) {
        // Extract mentioned brands, products, people
        const text = `${thread.title} ${thread.text || ''}`;
        const entities = {
            brands: [],
            products: [],
            people: []
        };
        
        // Simple pattern matching for common entities
        const brandPatterns = /\b(Google|Apple|Microsoft|Amazon|Facebook|Twitter|Reddit|Notion|Slack)\b/gi;
        const matches = text.match(brandPatterns);
        if (matches) {
            entities.brands = [...new Set(matches)];
        }
        
        return entities;
    }

    extractQuestions(thread) {
        const text = `${thread.title} ${thread.text || ''}`;
        const questions = [];
        
        // Extract sentences ending with ?
        const questionMatches = text.match(/[^.!?]*\?/g);
        if (questionMatches) {
            questions.push(...questionMatches.map(q => q.trim()));
        }
        
        // Extract implicit questions
        const implicitPatterns = [
            /how to [^.!?]*/gi,
            /what is [^.!?]*/gi,
            /why does [^.!?]*/gi,
            /can someone [^.!?]*/gi,
            /anyone know [^.!?]*/gi
        ];
        
        implicitPatterns.forEach(pattern => {
            const matches = text.match(pattern);
            if (matches) {
                questions.push(...matches);
            }
        });
        
        return [...new Set(questions)];
    }
}

module.exports = RedditScanner;