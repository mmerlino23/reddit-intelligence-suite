class ContentCreator {
    constructor() {
        this.templates = {
            solution_post: {
                title: "How to {solve_problem} - A Complete Guide",
                structure: ['introduction', 'problem_statement', 'solution_steps', 'tips', 'conclusion']
            },
            comparison_post: {
                title: "{brand} vs {competitor}: An Honest Comparison",
                structure: ['introduction', 'feature_comparison', 'pros_cons', 'pricing', 'verdict']
            },
            tutorial_post: {
                title: "Step-by-Step: {task_description}",
                structure: ['overview', 'prerequisites', 'steps', 'troubleshooting', 'summary']
            },
            announcement_post: {
                title: "We heard you: {improvement_description}",
                structure: ['acknowledgment', 'changes_made', 'how_to_use', 'feedback_request']
            },
            educational_post: {
                title: "Everything you need to know about {topic}",
                structure: ['hook', 'main_content', 'examples', 'takeaways', 'cta']
            }
        };

        this.hooks = [
            "Have you ever struggled with {problem}?",
            "Here's what nobody tells you about {topic}...",
            "After analyzing {number} discussions, we found...",
            "The truth about {topic} might surprise you",
            "Stop {bad_practice}. Do this instead:",
            "{percentage}% of users don't know this about {topic}"
        ];

        this.ctas = [
            "What's your experience with this?",
            "Drop your questions below!",
            "Share your tips in the comments",
            "Have you tried this approach?",
            "What would you add to this list?",
            "Tag someone who needs to see this"
        ];
    }

    async generate(basedOn, data) {
        console.log(`Generating content based on: ${basedOn}`);
        
        let content;
        
        switch (basedOn) {
            case 'pain_points':
                content = this.createPainPointContent(data);
                break;
            case 'analysis':
                content = this.createAnalysisContent(data);
                break;
            case 'sentiment':
                content = this.createSentimentContent(data);
                break;
            case 'trending':
                content = this.createTrendingContent(data);
                break;
            case 'comparison':
                content = this.createComparisonContent(data);
                break;
            default:
                content = this.createGenericContent(data);
        }
        
        // Add metadata
        content.metadata = {
            generated: new Date().toISOString(),
            basedOn,
            targetAudience: this.identifyAudience(data),
            keywords: this.extractKeywords(data),
            estimatedReadTime: this.calculateReadTime(content.body)
        };
        
        return content;
    }

    createPainPointContent(data) {
        const topPainPoint = data.painPoints && data.painPoints[0] || {
            category: 'general',
            context: 'common issue',
            pattern: 'problem'
        };
        
        const title = `How to Fix: ${this.humanizePattern(topPainPoint.pattern)}`;
        
        const content = {
            title,
            hook: `Tired of dealing with ${topPainPoint.pattern}? You're not alone. We've analyzed dozens of discussions and found the solution.`,
            body: this.generateSolutionBody(topPainPoint),
            conclusion: "Remember, every problem has a solution. The key is understanding the root cause and applying the right fix.",
            cta: "Have you experienced this issue? What worked for you?"
        };
        
        return content;
    }

    createAnalysisContent(data) {
        const insights = this.extractInsights(data);
        
        const title = `${data.keyword || 'Topic'} Analysis: Key Insights from Reddit`;
        
        const content = {
            title,
            hook: `We analyzed ${data.totalThreads || 'multiple'} Reddit discussions about ${data.keyword || 'this topic'}. Here's what we found:`,
            body: this.formatInsights(insights),
            conclusion: "These insights represent real user experiences and feedback from the community.",
            cta: "What's been your experience? Share your thoughts below!"
        };
        
        return content;
    }

    createSentimentContent(data) {
        const sentiment = data.sentimentBreakdown || { positive: 0, negative: 0, neutral: 0 };
        const total = sentiment.positive + sentiment.negative + sentiment.neutral;
        
        const title = `Community Sentiment: What Reddit Really Thinks About ${data.keyword || 'This'}`;
        
        const content = {
            title,
            hook: `After analyzing ${total} discussions, the community sentiment is clear...`,
            body: this.generateSentimentBody(sentiment, data),
            conclusion: "Understanding community sentiment helps us improve and address concerns.",
            cta: "How do you feel about this? Let us know!"
        };
        
        return content;
    }

    createTrendingContent(data) {
        const trends = data.contentOpportunities || [];
        
        const title = `Trending Now: ${trends[0]?.suggestion || 'Hot Topics in the Community'}`;
        
        const content = {
            title,
            hook: "Here's what everyone's talking about right now...",
            body: this.generateTrendingBody(trends, data),
            conclusion: "Stay ahead of the curve by understanding what matters to the community.",
            cta: "What trends are you seeing? Share your observations!"
        };
        
        return content;
    }

    createComparisonContent(data) {
        const competitors = data.competitors || {};
        
        const title = `The Honest Truth: How We Compare to Alternatives`;
        
        const content = {
            title,
            hook: "You asked for it - here's an unbiased comparison based on community feedback.",
            body: this.generateComparisonBody(competitors, data),
            conclusion: "Every solution has its strengths. Choose what works best for your needs.",
            cta: "What factors are most important to you when choosing a solution?"
        };
        
        return content;
    }

    createGenericContent(data) {
        const title = `Community Update: ${data.keyword || 'Latest Insights'}`;
        
        const content = {
            title,
            hook: "Based on recent community discussions, here's what you need to know...",
            body: this.generateGenericBody(data),
            conclusion: "We're always listening and improving based on your feedback.",
            cta: "What would you like to see next?"
        };
        
        return content;
    }

    generateSolutionBody(painPoint) {
        const sections = [];
        
        // Problem explanation
        sections.push({
            type: 'problem',
            content: `**The Problem:**\n${painPoint.context || 'Users are experiencing difficulties'}\n\n`
        });
        
        // Root cause
        sections.push({
            type: 'cause',
            content: `**Why This Happens:**\nBased on community discussions, this typically occurs when:\n` +
                    `- Configuration issues\n- Outdated versions\n- Conflicting settings\n\n`
        });
        
        // Solution steps
        sections.push({
            type: 'solution',
            content: `**The Solution:**\n\n` +
                    `1. **Quick Fix:** Try this first - it solves 80% of cases\n` +
                    `2. **Deep Dive:** If the quick fix doesn't work, check these settings\n` +
                    `3. **Advanced:** For persistent issues, consider this approach\n\n`
        });
        
        // Prevention
        sections.push({
            type: 'prevention',
            content: `**Preventing Future Issues:**\n` +
                    `- Regular maintenance tips\n- Best practices to follow\n- Common mistakes to avoid\n\n`
        });
        
        return sections;
    }

    formatInsights(insights) {
        const sections = [];
        
        insights.forEach((insight, index) => {
            sections.push({
                type: 'insight',
                content: `**Insight #${index + 1}: ${insight.title}**\n${insight.description}\n\n` +
                        `*Impact: ${insight.impact}*\n\n`
            });
        });
        
        return sections;
    }

    generateSentimentBody(sentiment, data) {
        const total = sentiment.positive + sentiment.negative + sentiment.neutral;
        const sections = [];
        
        // Overall sentiment
        sections.push({
            type: 'overview',
            content: `**Overall Sentiment Breakdown:**\n` +
                    `- Positive: ${((sentiment.positive/total)*100).toFixed(1)}%\n` +
                    `- Negative: ${((sentiment.negative/total)*100).toFixed(1)}%\n` +
                    `- Neutral: ${((sentiment.neutral/total)*100).toFixed(1)}%\n\n`
        });
        
        // Positive highlights
        if (data.topPositive && data.topPositive.length > 0) {
            sections.push({
                type: 'positive',
                content: `**What People Love:**\n` +
                        data.topPositive.slice(0, 3).map(p => `- "${p.title}"`).join('\n') + '\n\n'
            });
        }
        
        // Areas for improvement
        if (data.topNegative && data.topNegative.length > 0) {
            sections.push({
                type: 'negative',
                content: `**Areas We're Improving:**\n` +
                        data.topNegative.slice(0, 3).map(n => `- Addressing: "${n.title}"`).join('\n') + '\n\n'
            });
        }
        
        return sections;
    }

    generateTrendingBody(trends, data) {
        const sections = [];
        
        trends.forEach((trend, index) => {
            sections.push({
                type: 'trend',
                content: `**Trend ${index + 1}: ${trend.type}**\n` +
                        `${trend.suggestion}\n` +
                        `Priority: ${trend.priority}\n\n`
            });
        });
        
        return sections;
    }

    generateComparisonBody(competitors, data) {
        const sections = [];
        
        // Feature comparison table
        sections.push({
            type: 'features',
            content: `**Feature Comparison:**\n\n` +
                    `| Feature | Us | Competitors |\n` +
                    `|---------|-----|-------------|\n` +
                    `| Ease of Use | ✅ | Varies |\n` +
                    `| Pricing | Competitive | Often Higher |\n` +
                    `| Support | 24/7 | Business Hours |\n` +
                    `| Integration | Extensive | Limited |\n\n`
        });
        
        // Unique advantages
        sections.push({
            type: 'advantages',
            content: `**Our Unique Advantages:**\n` +
                    `- Feature exclusive to our platform\n` +
                    `- Better implementation of common features\n` +
                    `- Superior customer support\n\n`
        });
        
        return sections;
    }

    generateGenericBody(data) {
        const sections = [];
        
        // Key points
        sections.push({
            type: 'points',
            content: `**Key Takeaways:**\n` +
                    `- Important point from community feedback\n` +
                    `- Another significant insight\n` +
                    `- Action we're taking based on feedback\n\n`
        });
        
        return sections;
    }

    humanizePattern(pattern) {
        // Convert technical patterns to human-readable text
        return pattern
            .replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase())
            .replace(/Dont/g, "Don't")
            .replace(/Cant/g, "Can't")
            .replace(/Wont/g, "Won't");
    }

    extractInsights(data) {
        const insights = [];
        
        if (data.painPoints && data.painPoints.length > 0) {
            insights.push({
                title: 'Top User Frustration',
                description: `Users are struggling with ${data.painPoints[0].pattern}`,
                impact: 'High'
            });
        }
        
        if (data.contentOpportunities && data.contentOpportunities.length > 0) {
            insights.push({
                title: 'Content Gap Identified',
                description: data.contentOpportunities[0].suggestion,
                impact: 'Medium'
            });
        }
        
        if (data.urgentIssues && data.urgentIssues.length > 0) {
            insights.push({
                title: 'Urgent Attention Needed',
                description: `${data.urgentIssues.length} urgent issues require immediate response`,
                impact: 'Critical'
            });
        }
        
        return insights;
    }

    identifyAudience(data) {
        // Analyze data to identify target audience
        if (data.subreddit) {
            const techSubs = ['programming', 'webdev', 'technology'];
            if (techSubs.includes(data.subreddit)) {
                return 'technical';
            }
        }
        
        if (data.keyword && data.keyword.includes('business')) {
            return 'business';
        }
        
        return 'general';
    }

    extractKeywords(data) {
        const keywords = [];
        
        if (data.keyword) keywords.push(data.keyword);
        if (data.topThreads) {
            data.topThreads.forEach(thread => {
                const words = thread.title.toLowerCase().split(/\s+/);
                words.forEach(word => {
                    if (word.length > 4 && !keywords.includes(word)) {
                        keywords.push(word);
                    }
                });
            });
        }
        
        return keywords.slice(0, 10);
    }

    calculateReadTime(body) {
        if (!body) return 1;
        
        const wordCount = body.reduce((count, section) => {
            return count + (section.content || '').split(/\s+/).length;
        }, 0);
        
        // Average reading speed: 200 words per minute
        return Math.max(1, Math.ceil(wordCount / 200));
    }

    generateContentVariations(content) {
        // Create multiple versions for A/B testing
        const variations = [];
        
        // Version A: Original
        variations.push({
            version: 'A',
            ...content
        });
        
        // Version B: Different hook
        variations.push({
            version: 'B',
            ...content,
            hook: this.generateAlternativeHook(content)
        });
        
        // Version C: Different CTA
        variations.push({
            version: 'C',
            ...content,
            cta: this.generateAlternativeCTA(content)
        });
        
        return variations;
    }

    generateAlternativeHook(content) {
        const alternatives = [
            `Did you know that ${content.title.toLowerCase()}?`,
            `Here's something interesting: ${content.hook}`,
            `Let's talk about ${content.title.toLowerCase()}`
        ];
        
        return alternatives[Math.floor(Math.random() * alternatives.length)];
    }

    generateAlternativeCTA(content) {
        const alternatives = [
            "Your thoughts?",
            "Let's discuss!",
            "Share your experience!",
            "What do you think?"
        ];
        
        return alternatives[Math.floor(Math.random() * alternatives.length)];
    }
}

module.exports = ContentCreator;