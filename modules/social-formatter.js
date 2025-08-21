class SocialFormatter {
    constructor() {
        this.platforms = {
            reddit: {
                maxTitle: 300,
                maxBody: 40000,
                supportsMarkdown: true,
                supportsImages: true,
                hashtagStyle: 'r/',
                bestTimes: ['9am EST', '12pm EST', '7pm EST']
            },
            twitter: {
                maxChars: 280,
                maxThread: 25,
                supportsImages: true,
                hashtagStyle: '#',
                bestTimes: ['9am', '12pm', '5pm', '7pm']
            },
            linkedin: {
                maxChars: 3000,
                supportsMarkdown: false,
                supportsImages: true,
                hashtagStyle: '#',
                bestTimes: ['7am', '12pm', '5pm']
            },
            instagram: {
                maxCaption: 2200,
                maxHashtags: 30,
                requiresImage: true,
                hashtagStyle: '#',
                bestTimes: ['11am', '2pm', '5pm']
            },
            facebook: {
                maxChars: 63206,
                supportsImages: true,
                hashtagStyle: '#',
                bestTimes: ['9am', '3pm', '7pm']
            },
            tiktok: {
                maxCaption: 2200,
                maxHashtags: 100,
                requiresVideo: true,
                hashtagStyle: '#',
                bestTimes: ['6am', '10am', '3pm', '7pm']
            }
        };

        this.emojiMap = {
            positive: ['🎉', '✨', '💪', '🚀', '⭐', '🔥', '💯', '👏'],
            negative: ['⚠️', '🚨', '😕', '📉', '❌', '🔴'],
            neutral: ['📊', '📈', '💡', '🔍', '📝', '💭', '🎯'],
            tech: ['💻', '🖥️', '📱', '⚙️', '🔧', '🛠️', '🤖', '🌐'],
            business: ['💼', '📊', '💰', '📈', '🏢', '🤝', '📋'],
            announcement: ['📢', '🎤', '📣', '🆕', '⚡', '🎊']
        };
    }

    async formatForAllPlatforms(content) {
        const formatted = {};
        
        // Format for each platform
        formatted.reddit = this.formatForReddit(content);
        formatted.twitter = this.formatForTwitter(content);
        formatted.linkedin = this.formatForLinkedIn(content);
        formatted.instagram = this.formatForInstagram(content);
        formatted.facebook = this.formatForFacebook(content);
        formatted.tiktok = this.formatForTikTok(content);
        
        // Add posting recommendations
        formatted.recommendations = this.generatePostingRecommendations(content);
        
        return formatted;
    }

    formatForReddit(content) {
        const title = this.truncate(content.title, this.platforms.reddit.maxTitle);
        
        let body = '';
        
        // Add hook
        if (content.hook) {
            body += `${content.hook}\n\n`;
        }
        
        // Format body sections
        if (content.body && Array.isArray(content.body)) {
            content.body.forEach(section => {
                body += section.content + '\n';
            });
        } else if (content.body) {
            body += content.body + '\n\n';
        }
        
        // Add conclusion
        if (content.conclusion) {
            body += `\n${content.conclusion}\n\n`;
        }
        
        // Add CTA
        if (content.cta) {
            body += `---\n\n${content.cta}`;
        }
        
        // Add relevant subreddits
        const subreddits = this.identifyRelevantSubreddits(content);
        
        return {
            title,
            body: this.truncate(body, this.platforms.reddit.maxBody),
            subreddits,
            bestTime: this.platforms.reddit.bestTimes[0],
            formatting: 'markdown',
            tips: [
                'Post during peak hours for maximum visibility',
                'Engage with early comments to boost discussion',
                'Cross-post to relevant subreddits',
                'Use proper flair if available'
            ]
        };
    }

    formatForTwitter(content) {
        const thread = [];
        let currentTweet = '';
        
        // First tweet with hook
        const emoji = this.selectEmoji(content);
        currentTweet = `${emoji} ${content.title}\n\n${content.hook || ''}`;
        
        if (currentTweet.length > 280) {
            currentTweet = this.truncate(currentTweet, 275) + '...';
        }
        thread.push(currentTweet);
        
        // Body tweets
        if (content.body && Array.isArray(content.body)) {
            content.body.forEach(section => {
                const text = this.stripMarkdown(section.content);
                const chunks = this.chunkText(text, 270);
                chunks.forEach((chunk, i) => {
                    thread.push(`${i + 2}/ ${chunk}`);
                });
            });
        }
        
        // CTA tweet
        if (content.cta) {
            thread.push(`${thread.length + 1}/ ${content.cta}\n\n${this.generateHashtags(content).slice(0, 5).join(' ')}`);
        }
        
        // Limit thread length
        if (thread.length > this.platforms.twitter.maxThread) {
            thread = thread.slice(0, this.platforms.twitter.maxThread);
            thread[thread.length - 1] += '\n\n[Thread continues...]';
        }
        
        return {
            thread,
            singleTweet: this.createSingleTweet(content),
            hashtags: this.generateHashtags(content),
            bestTime: this.platforms.twitter.bestTimes[0],
            tips: [
                'Use thread for detailed content',
                'Include visuals in first tweet',
                'Engage with replies quickly',
                'Retweet with additional thoughts later'
            ]
        };
    }

    formatForLinkedIn(content) {
        let post = '';
        
        // Professional opening
        post += `${content.title}\n\n`;
        
        // Hook with professional tone
        if (content.hook) {
            post += `${this.professionalizeText(content.hook)}\n\n`;
        }
        
        // Key points with bullets
        if (content.body && Array.isArray(content.body)) {
            post += 'Key Insights:\n\n';
            content.body.slice(0, 5).forEach(section => {
                const text = this.stripMarkdown(section.content);
                const points = text.split('\n').filter(p => p.trim());
                points.slice(0, 3).forEach(point => {
                    post += `• ${point.trim()}\n`;
                });
            });
            post += '\n';
        }
        
        // Professional conclusion
        if (content.conclusion) {
            post += `${this.professionalizeText(content.conclusion)}\n\n`;
        }
        
        // Professional CTA
        post += 'What are your thoughts on this? I\'d love to hear your perspective.\n\n';
        
        // Hashtags
        const hashtags = this.generateHashtags(content, 'professional').slice(0, 5);
        post += hashtags.join(' ');
        
        return {
            post: this.truncate(post, this.platforms.linkedin.maxChars),
            hashtags,
            bestTime: this.platforms.linkedin.bestTimes[0],
            formatting: 'plain',
            tips: [
                'Use professional tone',
                'Include data and statistics',
                'Ask for opinions to boost engagement',
                'Tag relevant people or companies'
            ]
        };
    }

    formatForInstagram(content) {
        let caption = '';
        
        // Eye-catching opening with emojis
        const emojis = this.selectMultipleEmojis(content, 3);
        caption += `${emojis.join(' ')} ${content.title}\n\n`;
        
        // Short, punchy hook
        if (content.hook) {
            caption += `${this.truncate(content.hook, 100)}\n\n`;
        }
        
        // Key points with emojis
        if (content.body && Array.isArray(content.body)) {
            caption += content.body.slice(0, 3).map((section, i) => {
                const emoji = this.emojiMap.neutral[i % this.emojiMap.neutral.length];
                const text = this.stripMarkdown(section.content);
                return `${emoji} ${this.truncate(text, 50)}`;
            }).join('\n');
            caption += '\n\n';
        }
        
        // CTA
        caption += `${content.cta || 'Double tap if you agree!'}\n\n`;
        
        // Hashtags (Instagram loves them)
        const hashtags = this.generateHashtags(content, 'instagram');
        caption += '.\n.\n.\n'; // Instagram spacing trick
        caption += hashtags.slice(0, 30).join(' ');
        
        return {
            caption: this.truncate(caption, this.platforms.instagram.maxCaption),
            hashtags,
            imageRequired: true,
            carouselSuggestion: this.suggestCarousel(content),
            bestTime: this.platforms.instagram.bestTimes[0],
            tips: [
                'Use carousel for multiple points',
                'First image is most important',
                'Use Instagram Stories for behind-the-scenes',
                'Save hashtags in first comment if preferred'
            ]
        };
    }

    formatForFacebook(content) {
        let post = '';
        
        // Conversational opening
        post += `${content.title}\n\n`;
        
        // Engaging hook
        if (content.hook) {
            post += `${content.hook}\n\n`;
        }
        
        // Detailed body (Facebook allows long posts)
        if (content.body && Array.isArray(content.body)) {
            content.body.forEach(section => {
                const text = this.stripMarkdown(section.content);
                post += `${text}\n\n`;
            });
        }
        
        // Conclusion
        if (content.conclusion) {
            post += `${content.conclusion}\n\n`;
        }
        
        // Engaging CTA
        post += `${content.cta || 'What do you think? Share your thoughts below!'}\n\n`;
        
        // Minimal hashtags (Facebook doesn't favor them)
        const hashtags = this.generateHashtags(content).slice(0, 3);
        if (hashtags.length > 0) {
            post += hashtags.join(' ');
        }
        
        return {
            post: this.truncate(post, this.platforms.facebook.maxChars),
            hashtags,
            bestTime: this.platforms.facebook.bestTimes[0],
            tips: [
                'Use native video for better reach',
                'Ask questions to boost engagement',
                'Share to relevant groups',
                'Consider boosting important posts'
            ]
        };
    }

    formatForTikTok(content) {
        // TikTok script for video
        const script = {
            hook: this.createTikTokHook(content),
            main: this.createTikTokScript(content),
            cta: 'Follow for more tips like this!'
        };
        
        // Caption
        let caption = '';
        const emojis = this.selectMultipleEmojis(content, 2);
        caption += `${emojis.join(' ')} ${this.truncate(content.title, 50)}\n\n`;
        
        // TikTok loves hashtags
        const hashtags = [
            ...this.generateHashtags(content, 'tiktok'),
            '#fyp', '#foryou', '#foryoupage', '#viral'
        ];
        
        caption += hashtags.slice(0, 10).join(' ');
        
        return {
            script,
            caption: this.truncate(caption, this.platforms.tiktok.maxCaption),
            hashtags,
            duration: '30-60 seconds',
            format: 'vertical video (9:16)',
            bestTime: this.platforms.tiktok.bestTimes[0],
            tips: [
                'Start with a hook in first 3 seconds',
                'Use trending sounds',
                'Keep it under 60 seconds',
                'Use text overlays for key points',
                'End with a clear CTA'
            ]
        };
    }

    createSingleTweet(content) {
        const emoji = this.selectEmoji(content);
        let tweet = `${emoji} ${content.title}`;
        
        if (content.hook && tweet.length + content.hook.length < 250) {
            tweet += `\n\n${content.hook}`;
        }
        
        const hashtags = this.generateHashtags(content).slice(0, 3);
        if (tweet.length + hashtags.join(' ').length < 280) {
            tweet += `\n\n${hashtags.join(' ')}`;
        }
        
        return this.truncate(tweet, 280);
    }

    createTikTokHook(content) {
        const hooks = [
            `POV: ${content.title}`,
            `Nobody talks about this but... ${content.hook}`,
            `Here's what they don't tell you about ${content.title}`,
            `Wait for it... ${content.hook}`,
            `You've been doing it wrong! ${content.title}`
        ];
        
        return hooks[Math.floor(Math.random() * hooks.length)];
    }

    createTikTokScript(content) {
        const points = [];
        
        if (content.body && Array.isArray(content.body)) {
            content.body.slice(0, 3).forEach(section => {
                const text = this.stripMarkdown(section.content);
                points.push(this.truncate(text, 100));
            });
        }
        
        return {
            points,
            transitions: ['First...', 'Next...', 'Finally...'],
            visuals: 'Show relevant screenshots or demonstrations for each point'
        };
    }

    generateHashtags(content, style = 'general') {
        const hashtags = [];
        
        // Extract keywords from content
        if (content.metadata && content.metadata.keywords) {
            content.metadata.keywords.forEach(keyword => {
                hashtags.push(`#${keyword.replace(/\s+/g, '')}`);
            });
        }
        
        // Add style-specific hashtags
        switch (style) {
            case 'professional':
                hashtags.push('#business', '#leadership', '#innovation', '#strategy');
                break;
            case 'instagram':
                hashtags.push('#instagood', '#photooftheday', '#instadaily', '#love');
                break;
            case 'tiktok':
                hashtags.push('#LearnOnTikTok', '#TikTokTips', '#educational');
                break;
            default:
                hashtags.push('#tech', '#startup', '#productivity');
        }
        
        return [...new Set(hashtags)]; // Remove duplicates
    }

    identifyRelevantSubreddits(content) {
        const subreddits = [];
        
        // Based on keywords
        if (content.metadata && content.metadata.keywords) {
            const keywordMap = {
                'programming': ['r/programming', 'r/learnprogramming'],
                'business': ['r/Entrepreneur', 'r/startups'],
                'technology': ['r/technology', 'r/tech'],
                'productivity': ['r/productivity', 'r/getdisciplined'],
                'design': ['r/web_design', 'r/Design']
            };
            
            content.metadata.keywords.forEach(keyword => {
                if (keywordMap[keyword]) {
                    subreddits.push(...keywordMap[keyword]);
                }
            });
        }
        
        return [...new Set(subreddits)].slice(0, 5);
    }

    selectEmoji(content) {
        // Select appropriate emoji based on content sentiment/type
        if (content.metadata && content.metadata.basedOn === 'pain_points') {
            return this.emojiMap.negative[0];
        }
        
        if (content.title && content.title.toLowerCase().includes('success')) {
            return this.emojiMap.positive[0];
        }
        
        return this.emojiMap.neutral[0];
    }

    selectMultipleEmojis(content, count = 3) {
        const category = content.metadata && content.metadata.basedOn === 'pain_points' 
            ? 'negative' 
            : 'positive';
        
        return this.emojiMap[category].slice(0, count);
    }

    professionalizeText(text) {
        // Convert casual text to professional tone
        return text
            .replace(/don't/gi, 'do not')
            .replace(/can't/gi, 'cannot')
            .replace(/won't/gi, 'will not')
            .replace(/it's/gi, 'it is')
            .replace(/!+/g, '.')
            .replace(/\?+/g, '?');
    }

    stripMarkdown(text) {
        if (!text) return '';
        
        return text
            .replace(/\*\*(.*?)\*\*/g, '$1')  // Bold
            .replace(/\*(.*?)\*/g, '$1')      // Italic
            .replace(/#{1,6}\s/g, '')         // Headers
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links
            .replace(/`([^`]+)`/g, '$1')      // Code
            .replace(/^[-*+]\s/gm, '• ');     // Lists
    }

    chunkText(text, maxLength) {
        const chunks = [];
        const sentences = text.split(/(?<=[.!?])\s+/);
        let currentChunk = '';
        
        sentences.forEach(sentence => {
            if ((currentChunk + sentence).length <= maxLength) {
                currentChunk += (currentChunk ? ' ' : '') + sentence;
            } else {
                if (currentChunk) chunks.push(currentChunk);
                currentChunk = sentence;
            }
        });
        
        if (currentChunk) chunks.push(currentChunk);
        return chunks;
    }

    truncate(text, maxLength) {
        if (!text || text.length <= maxLength) return text || '';
        return text.substring(0, maxLength - 3) + '...';
    }

    suggestCarousel(content) {
        const slides = [];
        
        // Title slide
        slides.push({
            type: 'title',
            content: content.title
        });
        
        // Content slides
        if (content.body && Array.isArray(content.body)) {
            content.body.slice(0, 8).forEach((section, i) => {
                slides.push({
                    type: 'content',
                    number: i + 1,
                    content: this.truncate(this.stripMarkdown(section.content), 100)
                });
            });
        }
        
        // CTA slide
        slides.push({
            type: 'cta',
            content: content.cta || 'Swipe up for more!'
        });
        
        return slides;
    }

    generatePostingRecommendations(content) {
        const recommendations = {
            immediate: [],
            scheduled: [],
            strategy: []
        };
        
        // Immediate posting
        recommendations.immediate.push({
            platform: 'reddit',
            reason: 'Source platform - post here first for authenticity'
        });
        
        recommendations.immediate.push({
            platform: 'twitter',
            reason: 'Real-time engagement platform'
        });
        
        // Scheduled posting
        recommendations.scheduled.push({
            platform: 'linkedin',
            time: 'Next business day morning',
            reason: 'Professional audience most active'
        });
        
        recommendations.scheduled.push({
            platform: 'instagram',
            time: 'Peak visual engagement hours (11am or 5pm)',
            reason: 'Requires visual preparation'
        });
        
        // Strategy recommendations
        recommendations.strategy.push(
            'Start with Reddit for authentic community feedback',
            'Use Twitter for rapid distribution and virality',
            'Repurpose top-performing content for LinkedIn',
            'Create visual series for Instagram based on engagement',
            'Save TikTok for proven high-engagement content'
        );
        
        return recommendations;
    }
}

module.exports = SocialFormatter;