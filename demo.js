#!/usr/bin/env node

/**
 * Demo script showing the Reddit Intelligence Suite capabilities
 * Uses real keywords that will return results
 */

const RedditIntelligenceSuite = require('./app');

async function runDemo() {
    console.log('\n🎯 Reddit Intelligence Suite - DEMO\n' + '='.repeat(50));
    
    const suite = new RedditIntelligenceSuite();
    
    // Demo 1: Analyze a trending topic
    console.log('\n📌 Demo 1: Analyzing trending topic "King Charles"');
    console.log('-'.repeat(50));
    
    const analysis1 = await suite.analyzeKeyword('king', { limit: 5 });
    if (analysis1) {
        console.log(`✅ Found ${analysis1.totalThreads} threads`);
        console.log(`📊 Sentiment: Positive(${analysis1.sentimentBreakdown.positive}), Negative(${analysis1.sentimentBreakdown.negative}), Neutral(${analysis1.sentimentBreakdown.neutral})`);
        if (analysis1.topThreads && analysis1.topThreads.length > 0) {
            console.log(`🔥 Top thread: "${analysis1.topThreads[0].title}" with ${analysis1.topThreads[0].score} upvotes`);
        }
    }
    
    // Demo 2: Brand analysis
    console.log('\n📌 Demo 2: Brand Report for "Trump"');
    console.log('-'.repeat(50));
    
    const brand1 = await suite.generateBrandReport('Trump');
    if (brand1 && brand1.overview) {
        console.log(`✅ Brand mentioned in ${brand1.overview.totalMentions} threads`);
        if (brand1.reportCard) {
            console.log(`📊 Overall Grade: ${brand1.reportCard.overall}`);
            console.log(`📝 Summary: ${brand1.reportCard.summary}`);
        }
    }
    
    // Demo 3: Content generation from common words
    console.log('\n📌 Demo 3: Content Generation');
    console.log('-'.repeat(50));
    
    const testData = {
        keyword: 'productivity',
        sentimentBreakdown: { positive: 10, negative: 5, neutral: 5 },
        painPoints: [
            { pattern: 'time management', context: 'struggling with time management', severity: 8 },
            { pattern: 'focus issues', context: 'cannot focus on tasks', severity: 7 }
        ],
        contentOpportunities: [
            { type: 'tutorial', suggestion: 'Create time management guide', priority: 'high' }
        ]
    };
    
    const content = await suite.createContent('pain_points', testData);
    if (content) {
        console.log(`✅ Generated content: "${content.original.title}"`);
        console.log(`📱 Formatted for ${Object.keys(content.formatted).length} platforms`);
        console.log(`🖼️ Created ${content.images.length} visuals`);
    }
    
    // Show available hot topics
    console.log('\n📌 Currently Trending Topics (that will return results):');
    console.log('-'.repeat(50));
    
    const hotTopics = [
        'wasp', 'king', 'trump', 'charles', 'guard', 'solar', 'wind',
        'silksong', 'button', 'claim', 'birthday', 'faints'
    ];
    
    console.log('Try these keywords for guaranteed results:');
    hotTopics.forEach(topic => {
        console.log(`  • ${topic}`);
    });
    
    console.log('\n💡 TIP: The Reddit34 API returns only hot/popular posts,');
    console.log('   so use keywords that appear in currently trending topics.');
    
    console.log('\n✅ Demo Complete!');
    console.log('='.repeat(50));
    console.log('\nTo run the web dashboard:');
    console.log('  node app.js server');
    console.log('\nTo analyze a keyword:');
    console.log('  node app.js analyze --keyword "king" --limit 10');
}

// Run demo
if (require.main === module) {
    runDemo().catch(console.error);
}

module.exports = runDemo;