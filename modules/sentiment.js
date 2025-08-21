class SentimentAnalyzer {
    constructor() {
        // Sentiment word lists
        this.positiveWords = [
            'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'best',
            'awesome', 'perfect', 'beautiful', 'happy', 'glad', 'helpful', 'useful', 'brilliant',
            'outstanding', 'superior', 'positive', 'success', 'working', 'solved', 'fixed',
            'recommend', 'worth', 'valuable', 'impressive', 'satisfied', 'pleasant', 'enjoy'
        ];
        
        this.negativeWords = [
            'bad', 'terrible', 'awful', 'horrible', 'worst', 'hate', 'dislike', 'poor',
            'useless', 'broken', 'failed', 'failure', 'disappointing', 'frustrated', 'angry',
            'annoying', 'problem', 'issue', 'bug', 'error', 'wrong', 'incorrect', 'difficult',
            'complicated', 'confusing', 'slow', 'expensive', 'waste', 'scam', 'sucks'
        ];
        
        this.intensifiers = ['very', 'extremely', 'really', 'absolutely', 'totally', 'completely'];
        this.negations = ['not', 'no', 'never', 'neither', 'nor', 'nowhere', 'nothing', "n't"];
        
        // Emoji sentiment mapping
        this.positiveEmojis = ['😊', '😃', '😄', '😁', '😍', '❤️', '👍', '✅', '🎉', '🙌', '💪', '🔥'];
        this.negativeEmojis = ['😢', '😭', '😡', '😠', '💔', '👎', '❌', '😤', '😩', '🤦'];
    }

    analyze(text) {
        if (!text) {
            return { score: 0, category: 'neutral', confidence: 0 };
        }

        const words = text.toLowerCase().split(/\s+/);
        let score = 0;
        let wordCount = 0;
        let positiveCount = 0;
        let negativeCount = 0;
        
        // Analyze each word
        for (let i = 0; i < words.length; i++) {
            const word = words[i].replace(/[^a-z]/g, '');
            if (!word) continue;
            
            let wordScore = 0;
            let intensity = 1;
            
            // Check for intensifiers
            if (i > 0 && this.intensifiers.includes(words[i - 1])) {
                intensity = 1.5;
            }
            
            // Check for negation
            let negated = false;
            if (i > 0 && this.negations.some(neg => words[i - 1].includes(neg))) {
                negated = true;
            }
            
            // Score the word
            if (this.positiveWords.includes(word)) {
                wordScore = negated ? -1 : 1;
                if (!negated) positiveCount++;
                else negativeCount++;
            } else if (this.negativeWords.includes(word)) {
                wordScore = negated ? 1 : -1;
                if (negated) positiveCount++;
                else negativeCount++;
            }
            
            score += wordScore * intensity;
            if (wordScore !== 0) wordCount++;
        }
        
        // Check for emojis
        const emojiScore = this.analyzeEmojis(text);
        score += emojiScore.score;
        
        // Normalize score
        const normalizedScore = wordCount > 0 ? score / wordCount : 0;
        
        // Determine category
        let category = 'neutral';
        if (normalizedScore > 0.2) category = 'positive';
        else if (normalizedScore < -0.2) category = 'negative';
        
        // Calculate confidence (0-1)
        const confidence = Math.min(Math.abs(normalizedScore), 1);
        
        return {
            score: normalizedScore,
            category,
            confidence,
            details: {
                positiveWords: positiveCount,
                negativeWords: negativeCount,
                totalWords: words.length,
                emojiSentiment: emojiScore.category
            }
        };
    }

    analyzeEmojis(text) {
        let emojiScore = 0;
        let emojiCount = 0;
        
        this.positiveEmojis.forEach(emoji => {
            const count = (text.match(new RegExp(emoji, 'g')) || []).length;
            emojiScore += count;
            emojiCount += count;
        });
        
        this.negativeEmojis.forEach(emoji => {
            const count = (text.match(new RegExp(emoji, 'g')) || []).length;
            emojiScore -= count;
            emojiCount += count;
        });
        
        return {
            score: emojiScore,
            category: emojiScore > 0 ? 'positive' : emojiScore < 0 ? 'negative' : 'neutral',
            count: emojiCount
        };
    }

    analyzeMultiple(texts) {
        const results = texts.map(text => this.analyze(text));
        
        const aggregate = {
            averageScore: 0,
            distribution: {
                positive: 0,
                negative: 0,
                neutral: 0
            },
            mostPositive: null,
            mostNegative: null
        };
        
        let totalScore = 0;
        let mostPositiveScore = -Infinity;
        let mostNegativeScore = Infinity;
        
        results.forEach((result, index) => {
            totalScore += result.score;
            aggregate.distribution[result.category]++;
            
            if (result.score > mostPositiveScore) {
                mostPositiveScore = result.score;
                aggregate.mostPositive = { text: texts[index], score: result.score };
            }
            
            if (result.score < mostNegativeScore) {
                mostNegativeScore = result.score;
                aggregate.mostNegative = { text: texts[index], score: result.score };
            }
        });
        
        aggregate.averageScore = results.length > 0 ? totalScore / results.length : 0;
        
        return aggregate;
    }

    detectEmotion(text) {
        const emotions = {
            joy: ['happy', 'joy', 'cheerful', 'delighted', 'excited', 'thrilled', 'ecstatic'],
            anger: ['angry', 'mad', 'furious', 'outraged', 'irritated', 'annoyed', 'pissed'],
            sadness: ['sad', 'depressed', 'miserable', 'heartbroken', 'lonely', 'disappointed'],
            fear: ['afraid', 'scared', 'terrified', 'anxious', 'worried', 'nervous', 'panic'],
            surprise: ['surprised', 'shocked', 'amazed', 'astonished', 'stunned', 'unexpected'],
            disgust: ['disgusted', 'revolted', 'repulsed', 'sick', 'gross', 'yuck']
        };
        
        const detected = {};
        const lowerText = text.toLowerCase();
        
        for (const [emotion, words] of Object.entries(emotions)) {
            const count = words.filter(word => lowerText.includes(word)).length;
            if (count > 0) {
                detected[emotion] = count;
            }
        }
        
        return detected;
    }

    getTone(text) {
        const analysis = this.analyze(text);
        const emotions = this.detectEmotion(text);
        
        const tones = [];
        
        // Sentiment-based tones
        if (analysis.category === 'positive' && analysis.confidence > 0.6) {
            tones.push('enthusiastic');
        } else if (analysis.category === 'negative' && analysis.confidence > 0.6) {
            tones.push('critical');
        }
        
        // Question detection
        if (text.includes('?')) {
            tones.push('inquisitive');
        }
        
        // Urgency detection
        if (text.match(/urgent|asap|immediately|now|quick/i)) {
            tones.push('urgent');
        }
        
        // Formal/informal detection
        if (text.match(/please|kindly|would|could|appreciate/i)) {
            tones.push('formal');
        } else if (text.match(/gonna|wanna|yeah|lol|omg/i)) {
            tones.push('informal');
        }
        
        // Emotion-based tones
        const dominantEmotion = Object.entries(emotions)
            .sort((a, b) => b[1] - a[1])[0];
        
        if (dominantEmotion && dominantEmotion[1] > 0) {
            tones.push(dominantEmotion[0]);
        }
        
        return tones.length > 0 ? tones : ['neutral'];
    }

    generateSentimentReport(texts) {
        const analysis = this.analyzeMultiple(texts);
        
        const report = {
            summary: {
                totalAnalyzed: texts.length,
                averageSentiment: analysis.averageScore.toFixed(2),
                overallSentiment: analysis.averageScore > 0.1 ? 'Positive' : 
                                 analysis.averageScore < -0.1 ? 'Negative' : 'Neutral',
                confidence: Math.abs(analysis.averageScore).toFixed(2)
            },
            distribution: {
                positive: `${((analysis.distribution.positive / texts.length) * 100).toFixed(1)}%`,
                negative: `${((analysis.distribution.negative / texts.length) * 100).toFixed(1)}%`,
                neutral: `${((analysis.distribution.neutral / texts.length) * 100).toFixed(1)}%`
            },
            highlights: {
                mostPositive: analysis.mostPositive,
                mostNegative: analysis.mostNegative
            },
            recommendations: this.generateRecommendations(analysis)
        };
        
        return report;
    }

    generateRecommendations(analysis) {
        const recommendations = [];
        
        const negativeRatio = analysis.distribution.negative / 
                            (analysis.distribution.positive + analysis.distribution.negative + analysis.distribution.neutral);
        
        if (negativeRatio > 0.4) {
            recommendations.push({
                priority: 'high',
                action: 'Address negative sentiment',
                description: 'High negative sentiment detected. Consider creating content that addresses concerns and provides solutions.'
            });
        }
        
        if (analysis.distribution.neutral > analysis.distribution.positive + analysis.distribution.negative) {
            recommendations.push({
                priority: 'medium',
                action: 'Increase engagement',
                description: 'High neutral sentiment suggests low emotional engagement. Create more compelling, emotionally resonant content.'
            });
        }
        
        if (analysis.averageScore > 0.5) {
            recommendations.push({
                priority: 'low',
                action: 'Leverage positive momentum',
                description: 'Strong positive sentiment detected. Amplify successful messaging and gather testimonials.'
            });
        }
        
        return recommendations;
    }
}

module.exports = SentimentAnalyzer;