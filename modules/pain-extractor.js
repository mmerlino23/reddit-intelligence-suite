class PainExtractor {
    constructor() {
        // Pain indicators and patterns
        this.painPatterns = {
            frustration: [
                'frustrated', 'frustrating', 'annoying', 'annoyed', 'irritating',
                'driving me crazy', 'sick of', 'tired of', 'fed up', "can't stand"
            ],
            difficulty: [
                'difficult', 'hard', 'complicated', 'complex', 'confusing',
                'struggle', 'struggling', "can't figure out", "don't understand",
                'challenging', 'overwhelming'
            ],
            failure: [
                'not working', "doesn't work", 'broken', 'failed', 'failing',
                'error', 'bug', 'crash', 'crashes', 'freezes', 'stuck',
                'won\'t', 'cannot', "can't"
            ],
            inefficiency: [
                'slow', 'takes forever', 'waste of time', 'inefficient',
                'tedious', 'repetitive', 'manual', 'time consuming',
                'takes too long', 'hours'
            ],
            cost: [
                'expensive', 'overpriced', 'costs too much', "can't afford",
                'budget', 'cheaper', 'free alternative', 'price', 'pricing'
            ],
            missing_features: [
                'wish it had', 'needs', 'missing', 'lacks', "doesn't have",
                'should have', 'would be nice', 'if only', 'hoping for',
                'feature request'
            ],
            comparison: [
                'better than', 'worse than', 'not as good as', 'prefer',
                'switched from', 'alternative to', 'instead of', 'compared to'
            ]
        };

        this.urgencyIndicators = [
            'urgent', 'asap', 'immediately', 'right now', 'emergency',
            'critical', 'desperate', 'help', 'please help', 'need help'
        ];

        this.needIndicators = [
            'need', 'want', 'looking for', 'searching for', 'trying to find',
            'require', 'must have', 'essential', 'necessary', 'important'
        ];
    }

    extract(thread) {
        const text = `${thread.title} ${thread.text || ''}`.toLowerCase();
        const painPoints = [];

        // Extract pain points by category
        for (const [category, patterns] of Object.entries(this.painPatterns)) {
            patterns.forEach(pattern => {
                if (text.includes(pattern)) {
                    const context = this.extractContext(text, pattern);
                    painPoints.push({
                        category,
                        pattern,
                        context,
                        severity: this.calculateSeverity(text, pattern),
                        frequency: 1,
                        thread: {
                            title: thread.title,
                            url: thread.permalink,
                            score: thread.score
                        }
                    });
                }
            });
        }

        // Extract specific problems mentioned
        const problems = this.extractProblems(text);
        problems.forEach(problem => {
            painPoints.push({
                category: 'specific_problem',
                pattern: problem.type,
                context: problem.description,
                severity: problem.severity,
                frequency: 1,
                thread: {
                    title: thread.title,
                    url: thread.permalink,
                    score: thread.score
                }
            });
        });

        // Extract needs and wants
        const needs = this.extractNeeds(text);
        needs.forEach(need => {
            painPoints.push({
                category: 'unmet_need',
                pattern: need.type,
                context: need.description,
                severity: need.urgency,
                frequency: 1,
                thread: {
                    title: thread.title,
                    url: thread.permalink,
                    score: thread.score
                }
            });
        });

        return painPoints;
    }

    extractContext(text, pattern, windowSize = 50) {
        const index = text.indexOf(pattern);
        if (index === -1) return '';

        const start = Math.max(0, index - windowSize);
        const end = Math.min(text.length, index + pattern.length + windowSize);
        
        let context = text.substring(start, end);
        
        // Clean up context
        if (start > 0) context = '...' + context;
        if (end < text.length) context = context + '...';
        
        return context.trim();
    }

    calculateSeverity(text, pattern) {
        let severity = 5; // Base severity

        // Increase severity for urgency indicators
        this.urgencyIndicators.forEach(indicator => {
            if (text.includes(indicator)) severity += 2;
        });

        // Increase for emotional language
        const emotionalWords = ['hate', 'terrible', 'awful', 'worst', 'never'];
        emotionalWords.forEach(word => {
            if (text.includes(word)) severity += 1;
        });

        // Increase for exclamation marks
        const exclamations = (text.match(/!/g) || []).length;
        severity += Math.min(exclamations, 3);

        // Increase for ALL CAPS
        const capsWords = (text.match(/\b[A-Z]{2,}\b/g) || []).length;
        severity += Math.min(capsWords, 2);

        return Math.min(severity, 10); // Cap at 10
    }

    extractProblems(text) {
        const problems = [];
        
        // Pattern: "problem with X"
        const problemWithPattern = /problem with ([^.!?,]+)/gi;
        const problemMatches = text.matchAll(problemWithPattern);
        for (const match of problemMatches) {
            problems.push({
                type: 'problem_with',
                description: match[0],
                severity: 6
            });
        }

        // Pattern: "X is broken"
        const brokenPattern = /([^.!?,]+) (?:is|are) (?:broken|not working)/gi;
        const brokenMatches = text.matchAll(brokenPattern);
        for (const match of brokenMatches) {
            problems.push({
                type: 'broken_feature',
                description: match[0],
                severity: 8
            });
        }

        // Pattern: "can't X"
        const cantPattern = /(?:can't|cannot|unable to) ([^.!?,]+)/gi;
        const cantMatches = text.matchAll(cantPattern);
        for (const match of cantMatches) {
            problems.push({
                type: 'inability',
                description: match[0],
                severity: 7
            });
        }

        return problems;
    }

    extractNeeds(text) {
        const needs = [];
        
        // Pattern: "need X"
        const needPattern = /(?:need|want|looking for) ([^.!?,]+)/gi;
        const needMatches = text.matchAll(needPattern);
        for (const match of needMatches) {
            needs.push({
                type: 'stated_need',
                description: match[0],
                urgency: text.includes('urgent') || text.includes('asap') ? 9 : 5
            });
        }

        // Pattern: "how to X"
        const howToPattern = /how (?:to|do i|can i) ([^.!?]+)/gi;
        const howToMatches = text.matchAll(howToPattern);
        for (const match of howToMatches) {
            needs.push({
                type: 'knowledge_gap',
                description: match[0],
                urgency: 4
            });
        }

        // Pattern: "is there a way to X"
        const wayToPattern = /is there (?:a way|any way|some way) to ([^.!?]+)/gi;
        const wayToMatches = text.matchAll(wayToPattern);
        for (const match of wayToMatches) {
            needs.push({
                type: 'solution_seeking',
                description: match[0],
                urgency: 5
            });
        }

        return needs;
    }

    analyzePainPoints(painPoints) {
        // Group and analyze pain points
        const analysis = {
            totalPainPoints: painPoints.length,
            byCategory: {},
            bySeverity: {
                high: [],
                medium: [],
                low: []
            },
            topPainPoints: [],
            patterns: [],
            recommendations: []
        };

        // Group by category
        painPoints.forEach(pain => {
            if (!analysis.byCategory[pain.category]) {
                analysis.byCategory[pain.category] = [];
            }
            analysis.byCategory[pain.category].push(pain);

            // Group by severity
            if (pain.severity >= 8) {
                analysis.bySeverity.high.push(pain);
            } else if (pain.severity >= 5) {
                analysis.bySeverity.medium.push(pain);
            } else {
                analysis.bySeverity.low.push(pain);
            }
        });

        // Find top pain points (most severe and frequent)
        const painScores = {};
        painPoints.forEach(pain => {
            const key = `${pain.category}_${pain.pattern}`;
            if (!painScores[key]) {
                painScores[key] = {
                    pain,
                    score: 0,
                    count: 0
                };
            }
            painScores[key].score += pain.severity;
            painScores[key].count++;
        });

        analysis.topPainPoints = Object.values(painScores)
            .sort((a, b) => b.score - a.score)
            .slice(0, 5)
            .map(item => ({
                ...item.pain,
                totalScore: item.score,
                frequency: item.count
            }));

        // Identify patterns
        analysis.patterns = this.identifyPatterns(painPoints);

        // Generate recommendations
        analysis.recommendations = this.generateRecommendations(analysis);

        return analysis;
    }

    identifyPatterns(painPoints) {
        const patterns = [];

        // Check for systemic issues (multiple pain points in same category)
        const categories = {};
        painPoints.forEach(pain => {
            categories[pain.category] = (categories[pain.category] || 0) + 1;
        });

        Object.entries(categories).forEach(([category, count]) => {
            if (count >= 3) {
                patterns.push({
                    type: 'systemic',
                    description: `Multiple ${category} issues detected (${count} instances)`,
                    severity: 'high'
                });
            }
        });

        // Check for user journey issues
        const journeyPains = painPoints.filter(p => 
            p.category === 'difficulty' || p.category === 'frustration'
        );
        if (journeyPains.length >= 2) {
            patterns.push({
                type: 'user_experience',
                description: 'User experience friction detected',
                severity: 'medium'
            });
        }

        // Check for competitive disadvantage
        const comparisonPains = painPoints.filter(p => p.category === 'comparison');
        if (comparisonPains.length > 0) {
            patterns.push({
                type: 'competitive',
                description: 'Users comparing to competitors',
                severity: 'medium'
            });
        }

        return patterns;
    }

    generateRecommendations(analysis) {
        const recommendations = [];

        // High severity issues need immediate attention
        if (analysis.bySeverity.high.length > 0) {
            recommendations.push({
                priority: 'critical',
                action: 'Address high-severity issues immediately',
                description: `${analysis.bySeverity.high.length} critical pain points require urgent attention`,
                painPoints: analysis.bySeverity.high.slice(0, 3)
            });
        }

        // Systemic issues need strategic solutions
        const systemicPatterns = analysis.patterns.filter(p => p.type === 'systemic');
        if (systemicPatterns.length > 0) {
            recommendations.push({
                priority: 'high',
                action: 'Develop comprehensive solutions for systemic issues',
                description: 'Multiple related pain points suggest deeper problems',
                patterns: systemicPatterns
            });
        }

        // Missing features represent opportunities
        if (analysis.byCategory.missing_features && analysis.byCategory.missing_features.length > 2) {
            recommendations.push({
                priority: 'medium',
                action: 'Consider feature development',
                description: 'Users requesting specific features',
                features: analysis.byCategory.missing_features
            });
        }

        // Cost concerns need pricing strategy review
        if (analysis.byCategory.cost && analysis.byCategory.cost.length > 0) {
            recommendations.push({
                priority: 'medium',
                action: 'Review pricing strategy',
                description: 'Cost concerns detected',
                concerns: analysis.byCategory.cost
            });
        }

        return recommendations;
    }

    generatePainPointReport(painPoints) {
        const analysis = this.analyzePainPoints(painPoints);
        
        const report = {
            executive_summary: {
                total_issues: analysis.totalPainPoints,
                critical_issues: analysis.bySeverity.high.length,
                main_categories: Object.keys(analysis.byCategory).slice(0, 3),
                user_sentiment: this.calculateOverallSentiment(painPoints)
            },
            detailed_analysis: analysis,
            action_items: this.prioritizeActions(analysis),
            content_opportunities: this.identifyContentOpportunities(analysis)
        };

        return report;
    }

    calculateOverallSentiment(painPoints) {
        if (painPoints.length === 0) return 'neutral';
        
        const avgSeverity = painPoints.reduce((sum, p) => sum + p.severity, 0) / painPoints.length;
        
        if (avgSeverity >= 7) return 'very negative';
        if (avgSeverity >= 5) return 'negative';
        if (avgSeverity >= 3) return 'mixed';
        return 'neutral';
    }

    prioritizeActions(analysis) {
        const actions = [];
        
        // Priority 1: Critical issues
        analysis.bySeverity.high.forEach(pain => {
            actions.push({
                priority: 1,
                type: 'fix',
                description: `Fix: ${pain.context}`,
                category: pain.category,
                impact: 'high'
            });
        });

        // Priority 2: Quick wins
        analysis.bySeverity.medium
            .filter(p => p.category === 'missing_features')
            .forEach(pain => {
                actions.push({
                    priority: 2,
                    type: 'implement',
                    description: `Add feature: ${pain.context}`,
                    category: 'feature',
                    impact: 'medium'
                });
            });

        // Priority 3: Long-term improvements
        Object.entries(analysis.byCategory).forEach(([category, pains]) => {
            if (pains.length >= 3) {
                actions.push({
                    priority: 3,
                    type: 'strategic',
                    description: `Overhaul ${category} experience`,
                    category,
                    impact: 'high'
                });
            }
        });

        return actions.sort((a, b) => a.priority - b.priority);
    }

    identifyContentOpportunities(analysis) {
        const opportunities = [];

        // Tutorial content for difficulty issues
        if (analysis.byCategory.difficulty && analysis.byCategory.difficulty.length > 0) {
            opportunities.push({
                type: 'tutorial',
                topic: 'Step-by-step guides for complex features',
                painPoints: analysis.byCategory.difficulty.length,
                potential_impact: 'high'
            });
        }

        // Troubleshooting content for failures
        if (analysis.byCategory.failure && analysis.byCategory.failure.length > 0) {
            opportunities.push({
                type: 'troubleshooting',
                topic: 'Common issues and solutions',
                painPoints: analysis.byCategory.failure.length,
                potential_impact: 'high'
            });
        }

        // Comparison content for competitive concerns
        if (analysis.byCategory.comparison && analysis.byCategory.comparison.length > 0) {
            opportunities.push({
                type: 'comparison',
                topic: 'Why we\'re better than alternatives',
                painPoints: analysis.byCategory.comparison.length,
                potential_impact: 'medium'
            });
        }

        // FAQ content for common needs
        if (analysis.topPainPoints.length > 0) {
            opportunities.push({
                type: 'faq',
                topic: 'Addressing top user concerns',
                painPoints: analysis.topPainPoints.length,
                potential_impact: 'medium'
            });
        }

        return opportunities;
    }
}

module.exports = PainExtractor;