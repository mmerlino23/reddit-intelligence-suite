const Scanner = require('./scanner');
const SentimentAnalyzer = require('./sentiment');
const PainExtractor = require('./pain-extractor');

class BrandAnalyzer {
    constructor() {
        this.scanner = new Scanner();
        this.sentiment = new SentimentAnalyzer();
        this.painExtractor = new PainExtractor();
    }

    async generateReport(brandName, domain = null) {
        console.log(`Analyzing brand: ${brandName}${domain ? ` (${domain})` : ''}`);
        
        // Scan for brand mentions
        const threads = await this.scanner.scanBrand(brandName, domain);
        
        if (!threads || threads.length === 0) {
            return {
                brand: brandName,
                domain,
                status: 'no_data',
                message: 'No mentions found for this brand'
            };
        }

        // Initialize report structure
        const report = {
            brand: brandName,
            domain,
            generated: new Date().toISOString(),
            overview: {
                totalMentions: threads.length,
                uniqueAuthors: 0,
                totalEngagement: 0,
                avgEngagement: 0,
                timeRange: this.getTimeRange(threads)
            },
            sentiment: {
                overall: null,
                breakdown: { positive: 0, negative: 0, neutral: 0 },
                trend: [],
                topPositive: [],
                topNegative: []
            },
            engagement: {
                mostDiscussed: [],
                topSubreddits: {},
                peakTimes: {},
                viralPosts: []
            },
            topics: {
                mainThemes: {},
                painPoints: [],
                features: {},
                comparisons: []
            },
            competitors: {
                mentioned: {},
                sentiment: {}
            },
            influencers: {
                topContributors: [],
                brandAdvocates: [],
                critics: []
            },
            opportunities: [],
            risks: [],
            recommendations: []
        };

        // Analyze each thread
        const authors = new Set();
        const sentiments = [];
        const painPoints = [];
        
        for (const thread of threads) {
            // Track unique authors
            authors.add(thread.author);
            
            // Calculate engagement
            const engagement = thread.score + thread.comments;
            report.overview.totalEngagement += engagement;
            
            // Sentiment analysis
            const sentimentResult = this.sentiment.analyze(thread.title + ' ' + (thread.text || ''));
            sentiments.push(sentimentResult);
            report.sentiment.breakdown[sentimentResult.category]++;
            
            // Store for top positive/negative
            if (sentimentResult.category === 'positive') {
                report.sentiment.topPositive.push({
                    title: thread.title,
                    score: sentimentResult.score,
                    url: thread.permalink,
                    engagement
                });
            } else if (sentimentResult.category === 'negative') {
                report.sentiment.topNegative.push({
                    title: thread.title,
                    score: sentimentResult.score,
                    url: thread.permalink,
                    engagement
                });
            }
            
            // Track subreddits
            if (!report.engagement.topSubreddits[thread.subreddit]) {
                report.engagement.topSubreddits[thread.subreddit] = {
                    count: 0,
                    totalEngagement: 0,
                    sentiment: { positive: 0, negative: 0, neutral: 0 }
                };
            }
            report.engagement.topSubreddits[thread.subreddit].count++;
            report.engagement.topSubreddits[thread.subreddit].totalEngagement += engagement;
            report.engagement.topSubreddits[thread.subreddit].sentiment[sentimentResult.category]++;
            
            // Extract pain points
            const threadPains = this.painExtractor.extract(thread);
            painPoints.push(...threadPains);
            
            // Track viral posts (high engagement)
            if (engagement > 100) {
                report.engagement.viralPosts.push({
                    title: thread.title,
                    subreddit: thread.subreddit,
                    engagement,
                    url: thread.permalink
                });
            }
            
            // Extract topics and themes
            this.extractTopics(thread, report.topics);
            
            // Find competitor mentions
            this.findCompetitors(thread, report.competitors);
        }

        // Calculate overview metrics
        report.overview.uniqueAuthors = authors.size;
        report.overview.avgEngagement = Math.round(report.overview.totalEngagement / threads.length);
        
        // Calculate overall sentiment
        const sentimentAggregate = this.sentiment.analyzeMultiple(
            threads.map(t => t.title + ' ' + (t.text || ''))
        );
        report.sentiment.overall = sentimentAggregate.averageScore;
        
        // Sort and limit top posts
        report.sentiment.topPositive.sort((a, b) => b.engagement - a.engagement);
        report.sentiment.topPositive = report.sentiment.topPositive.slice(0, 5);
        report.sentiment.topNegative.sort((a, b) => b.engagement - a.engagement);
        report.sentiment.topNegative = report.sentiment.topNegative.slice(0, 5);
        
        // Sort viral posts
        report.engagement.viralPosts.sort((a, b) => b.engagement - a.engagement);
        report.engagement.viralPosts = report.engagement.viralPosts.slice(0, 10);
        
        // Analyze pain points
        if (painPoints.length > 0) {
            const painAnalysis = this.painExtractor.analyzePainPoints(painPoints);
            report.topics.painPoints = painAnalysis.topPainPoints;
        }
        
        // Identify influencers
        this.identifyInfluencers(threads, sentiments, report.influencers);
        
        // Generate insights
        report.opportunities = this.identifyOpportunities(report);
        report.risks = this.identifyRisks(report);
        report.recommendations = this.generateRecommendations(report);
        
        // Create report card summary
        report.reportCard = this.generateReportCard(report);
        
        return report;
    }

    getTimeRange(threads) {
        if (threads.length === 0) return 'N/A';
        
        const dates = threads.map(t => t.created).filter(d => d);
        if (dates.length === 0) return 'N/A';
        
        const oldest = new Date(Math.min(...dates));
        const newest = new Date(Math.max(...dates));
        
        return {
            start: oldest.toISOString().split('T')[0],
            end: newest.toISOString().split('T')[0],
            days: Math.ceil((newest - oldest) / (1000 * 60 * 60 * 24))
        };
    }

    extractTopics(thread, topics) {
        const text = `${thread.title} ${thread.text || ''}`.toLowerCase();
        
        // Feature-related keywords
        const featureKeywords = {
            'user interface': ['ui', 'interface', 'design', 'layout', 'theme'],
            'performance': ['speed', 'fast', 'slow', 'performance', 'lag'],
            'pricing': ['price', 'cost', 'expensive', 'cheap', 'free', 'subscription'],
            'support': ['support', 'help', 'customer service', 'response'],
            'features': ['feature', 'function', 'capability', 'tool'],
            'integration': ['integrate', 'integration', 'connect', 'api', 'plugin'],
            'mobile': ['mobile', 'app', 'ios', 'android', 'phone'],
            'security': ['security', 'privacy', 'secure', 'safe', 'data']
        };
        
        for (const [topic, keywords] of Object.entries(featureKeywords)) {
            keywords.forEach(keyword => {
                if (text.includes(keyword)) {
                    if (!topics.features[topic]) {
                        topics.features[topic] = 0;
                    }
                    topics.features[topic]++;
                }
            });
        }
        
        // Main themes
        const themeKeywords = {
            'product_quality': ['quality', 'reliable', 'stable', 'buggy', 'broken'],
            'user_experience': ['easy', 'difficult', 'intuitive', 'confusing', 'simple'],
            'value': ['worth', 'value', 'roi', 'investment', 'waste'],
            'innovation': ['innovative', 'new', 'cutting edge', 'outdated', 'modern'],
            'comparison': ['better than', 'worse than', 'alternative', 'competitor', 'vs']
        };
        
        for (const [theme, keywords] of Object.entries(themeKeywords)) {
            keywords.forEach(keyword => {
                if (text.includes(keyword)) {
                    if (!topics.mainThemes[theme]) {
                        topics.mainThemes[theme] = 0;
                    }
                    topics.mainThemes[theme]++;
                }
            });
        }
    }

    findCompetitors(thread, competitors) {
        const text = `${thread.title} ${thread.text || ''}`;
        
        // Common competitor patterns
        const competitorPatterns = [
            // Direct competitors (would be customized per brand)
            'notion', 'slack', 'trello', 'asana', 'monday', 'clickup',
            'jira', 'basecamp', 'airtable', 'todoist', 'evernote',
            // Generic patterns
            'competitor', 'alternative', 'instead of', 'switched from',
            'better than', 'worse than', 'compared to'
        ];
        
        competitorPatterns.forEach(pattern => {
            if (text.toLowerCase().includes(pattern)) {
                if (!competitors.mentioned[pattern]) {
                    competitors.mentioned[pattern] = 0;
                }
                competitors.mentioned[pattern]++;
                
                // Analyze sentiment when competitor is mentioned
                const sentiment = this.sentiment.analyze(text);
                if (!competitors.sentiment[pattern]) {
                    competitors.sentiment[pattern] = { positive: 0, negative: 0, neutral: 0 };
                }
                competitors.sentiment[pattern][sentiment.category]++;
            }
        });
    }

    identifyInfluencers(threads, sentiments, influencers) {
        const authorStats = {};
        
        threads.forEach((thread, index) => {
            if (!authorStats[thread.author]) {
                authorStats[thread.author] = {
                    posts: 0,
                    totalEngagement: 0,
                    avgSentiment: 0,
                    sentiments: []
                };
            }
            
            authorStats[thread.author].posts++;
            authorStats[thread.author].totalEngagement += thread.score + thread.comments;
            authorStats[thread.author].sentiments.push(sentiments[index]);
        });
        
        // Calculate average sentiment and identify influencer types
        Object.entries(authorStats).forEach(([author, stats]) => {
            const avgSentiment = stats.sentiments.reduce((sum, s) => sum + s.score, 0) / stats.sentiments.length;
            stats.avgSentiment = avgSentiment;
            
            const influencer = {
                author,
                posts: stats.posts,
                totalEngagement: stats.totalEngagement,
                avgEngagement: Math.round(stats.totalEngagement / stats.posts),
                sentiment: avgSentiment
            };
            
            // Categorize influencers
            if (stats.posts >= 2 || stats.totalEngagement > 100) {
                influencers.topContributors.push(influencer);
                
                if (avgSentiment > 0.3) {
                    influencers.brandAdvocates.push(influencer);
                } else if (avgSentiment < -0.3) {
                    influencers.critics.push(influencer);
                }
            }
        });
        
        // Sort by engagement
        influencers.topContributors.sort((a, b) => b.totalEngagement - a.totalEngagement);
        influencers.brandAdvocates.sort((a, b) => b.totalEngagement - a.totalEngagement);
        influencers.critics.sort((a, b) => b.totalEngagement - a.totalEngagement);
        
        // Limit to top 10
        influencers.topContributors = influencers.topContributors.slice(0, 10);
        influencers.brandAdvocates = influencers.brandAdvocates.slice(0, 5);
        influencers.critics = influencers.critics.slice(0, 5);
    }

    identifyOpportunities(report) {
        const opportunities = [];
        
        // High positive sentiment = amplification opportunity
        if (report.sentiment.overall > 0.3) {
            opportunities.push({
                type: 'amplification',
                priority: 'high',
                description: 'Strong positive sentiment - amplify success stories',
                action: 'Collect testimonials and case studies from positive mentions'
            });
        }
        
        // Brand advocates = partnership opportunity
        if (report.influencers.brandAdvocates.length > 0) {
            opportunities.push({
                type: 'advocacy',
                priority: 'medium',
                description: `${report.influencers.brandAdvocates.length} brand advocates identified`,
                action: 'Engage with advocates for testimonials or partnerships'
            });
        }
        
        // Viral posts = content opportunity
        if (report.engagement.viralPosts.length > 0) {
            opportunities.push({
                type: 'content',
                priority: 'high',
                description: 'Viral discussions provide content inspiration',
                action: 'Create content addressing viral topics'
            });
        }
        
        // Competitor comparisons = differentiation opportunity
        if (Object.keys(report.competitors.mentioned).length > 0) {
            opportunities.push({
                type: 'positioning',
                priority: 'medium',
                description: 'Users comparing to competitors',
                action: 'Create comparison content highlighting advantages'
            });
        }
        
        return opportunities;
    }

    identifyRisks(report) {
        const risks = [];
        
        // Negative sentiment = reputation risk
        const negativeRatio = report.sentiment.breakdown.negative / report.overview.totalMentions;
        if (negativeRatio > 0.3) {
            risks.push({
                type: 'reputation',
                severity: negativeRatio > 0.5 ? 'high' : 'medium',
                description: `${(negativeRatio * 100).toFixed(1)}% negative sentiment`,
                mitigation: 'Address negative feedback publicly and implement fixes'
            });
        }
        
        // Critics with high engagement = influence risk
        if (report.influencers.critics.length > 0 && 
            report.influencers.critics[0].totalEngagement > 50) {
            risks.push({
                type: 'influencer',
                severity: 'medium',
                description: 'Influential critics spreading negative sentiment',
                mitigation: 'Engage directly with critics to address concerns'
            });
        }
        
        // Pain points = churn risk
        if (report.topics.painPoints.length > 5) {
            risks.push({
                type: 'product',
                severity: 'high',
                description: `${report.topics.painPoints.length} significant pain points identified`,
                mitigation: 'Prioritize fixing top pain points'
            });
        }
        
        // Low engagement = awareness risk
        if (report.overview.avgEngagement < 10) {
            risks.push({
                type: 'awareness',
                severity: 'low',
                description: 'Low engagement suggests limited brand awareness',
                mitigation: 'Increase marketing and community engagement'
            });
        }
        
        return risks;
    }

    generateRecommendations(report) {
        const recommendations = [];
        
        // Based on sentiment
        if (report.sentiment.overall < 0) {
            recommendations.push({
                category: 'urgent',
                action: 'Crisis Management',
                description: 'Address negative sentiment immediately',
                steps: [
                    'Respond to top negative threads',
                    'Create FAQ addressing common complaints',
                    'Implement quick fixes for top pain points'
                ]
            });
        }
        
        // Based on pain points
        if (report.topics.painPoints.length > 0) {
            recommendations.push({
                category: 'product',
                action: 'Product Improvement',
                description: 'Fix identified pain points',
                steps: report.topics.painPoints.slice(0, 3).map(p => 
                    `Fix: ${p.context}`
                )
            });
        }
        
        // Based on engagement
        const topSubreddit = Object.entries(report.engagement.topSubreddits)
            .sort((a, b) => b[1].count - a[1].count)[0];
        
        if (topSubreddit) {
            recommendations.push({
                category: 'marketing',
                action: 'Community Engagement',
                description: `Focus on r/${topSubreddit[0]} for maximum impact`,
                steps: [
                    'Create subreddit-specific content',
                    'Engage with community members',
                    'Host AMA or community event'
                ]
            });
        }
        
        // Based on competitors
        if (Object.keys(report.competitors.mentioned).length > 2) {
            recommendations.push({
                category: 'positioning',
                action: 'Competitive Differentiation',
                description: 'Clarify unique value proposition',
                steps: [
                    'Create comparison content',
                    'Highlight unique features',
                    'Address switching concerns'
                ]
            });
        }
        
        return recommendations;
    }

    generateReportCard(report) {
        // Calculate grades
        const sentimentGrade = this.calculateGrade(report.sentiment.overall, 
            [0.5, 0.3, 0.1, -0.1, -0.3]);
        
        const engagementGrade = this.calculateGrade(report.overview.avgEngagement,
            [100, 50, 20, 10, 5]);
        
        const negativeRatio = report.sentiment.breakdown.negative / report.overview.totalMentions;
        const reputationGrade = this.calculateGrade(1 - negativeRatio,
            [0.9, 0.7, 0.5, 0.3, 0.1]);
        
        const advocateGrade = this.calculateGrade(report.influencers.brandAdvocates.length,
            [5, 3, 2, 1, 0]);
        
        return {
            overall: this.averageGrade([sentimentGrade, engagementGrade, reputationGrade, advocateGrade]),
            breakdown: {
                sentiment: sentimentGrade,
                engagement: engagementGrade,
                reputation: reputationGrade,
                advocacy: advocateGrade
            },
            summary: this.generateSummary(report),
            metrics: {
                mentions: report.overview.totalMentions,
                sentiment: `${(report.sentiment.overall * 100).toFixed(1)}%`,
                engagement: report.overview.avgEngagement,
                advocates: report.influencers.brandAdvocates.length,
                critics: report.influencers.critics.length
            }
        };
    }

    calculateGrade(value, thresholds) {
        const grades = ['A', 'B', 'C', 'D', 'F'];
        for (let i = 0; i < thresholds.length; i++) {
            if (value >= thresholds[i]) {
                return grades[i];
            }
        }
        return 'F';
    }

    averageGrade(grades) {
        const gradeValues = { 'A': 4, 'B': 3, 'C': 2, 'D': 1, 'F': 0 };
        const values = grades.map(g => gradeValues[g]);
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        
        if (avg >= 3.5) return 'A';
        if (avg >= 2.5) return 'B';
        if (avg >= 1.5) return 'C';
        if (avg >= 0.5) return 'D';
        return 'F';
    }

    generateSummary(report) {
        const sentiment = report.sentiment.overall > 0.1 ? 'positive' :
                         report.sentiment.overall < -0.1 ? 'negative' : 'neutral';
        
        const topIssues = report.topics.painPoints.slice(0, 2)
            .map(p => p.pattern).join(' and ');
        
        return `${report.brand} has ${sentiment} sentiment with ${report.overview.totalMentions} mentions. ` +
               `Average engagement is ${report.overview.avgEngagement}. ` +
               (topIssues ? `Main concerns: ${topIssues}. ` : '') +
               `${report.influencers.brandAdvocates.length} advocates and ${report.influencers.critics.length} critics identified.`;
    }
}

module.exports = BrandAnalyzer;