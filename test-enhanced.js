#!/usr/bin/env node

const EnhancedScanner = require('./modules/enhanced-scanner');

async function testEnhancedFeatures() {
    console.log('\n🚀 Testing Enhanced Reddit Scanner\n' + '='.repeat(50));
    
    const scanner = new EnhancedScanner();
    
    // Test 1: Real Search!
    console.log('\n📌 Test 1: Search for "nike"');
    console.log('-'.repeat(30));
    const searchResults = await scanner.searchPosts('nike', 3);
    if (searchResults.length > 0) {
        console.log(`✅ Found ${searchResults.length} posts about Nike!`);
        searchResults.forEach((post, i) => {
            console.log(`  ${i+1}. "${post.title}" in r/${post.subreddit}`);
        });
    } else {
        console.log('❌ No search results');
    }
    
    // Test 2: Subreddit posts
    console.log('\n📌 Test 2: Get posts from r/technology');
    console.log('-'.repeat(30));
    const techPosts = await scanner.getSubredditPosts('technology', 'hot', 3);
    if (techPosts.length > 0) {
        console.log(`✅ Found ${techPosts.length} posts from r/technology!`);
        techPosts.forEach((post, i) => {
            console.log(`  ${i+1}. "${post.title}" (${post.score} upvotes)`);
        });
    } else {
        console.log('❌ No subreddit posts');
    }
    
    // Test 3: Rising posts
    console.log('\n📌 Test 3: Get rising posts');
    console.log('-'.repeat(30));
    const risingPosts = await scanner.getRisingPosts(3);
    if (risingPosts.length > 0) {
        console.log(`✅ Found ${risingPosts.length} rising posts!`);
        risingPosts.forEach((post, i) => {
            console.log(`  ${i+1}. "${post.title}" in r/${post.subreddit}`);
        });
    } else {
        console.log('❌ No rising posts');
    }
    
    // Test 4: Top posts of the year
    console.log('\n📌 Test 4: Get top posts of the year');
    console.log('-'.repeat(30));
    const topPosts = await scanner.getTopPosts('year', 3);
    if (topPosts.length > 0) {
        console.log(`✅ Found ${topPosts.length} top posts!`);
        topPosts.forEach((post, i) => {
            console.log(`  ${i+1}. "${post.title}" (${post.score} upvotes)`);
        });
    } else {
        console.log('❌ No top posts');
    }
    
    // Test 5: Popular subreddits
    console.log('\n📌 Test 5: Get popular subreddits');
    console.log('-'.repeat(30));
    const popularSubs = await scanner.getPopularSubreddits();
    if (popularSubs && popularSubs.subreddits) {
        console.log(`✅ Found ${popularSubs.subreddits.length} popular subreddits!`);
        popularSubs.subreddits.slice(0, 5).forEach((sub, i) => {
            console.log(`  ${i+1}. r/${sub.data.display_name} - ${sub.data.subscribers} subscribers`);
        });
    } else {
        console.log('❌ No popular subreddits');
    }
    
    // Test 6: Comprehensive search
    console.log('\n📌 Test 6: Comprehensive search for "AI"');
    console.log('-'.repeat(30));
    const comprehensiveResults = await scanner.comprehensiveSearch('AI', {
        includeSubreddits: ['technology', 'MachineLearning'],
        limit: 5
    });
    if (comprehensiveResults.length > 0) {
        console.log(`✅ Found ${comprehensiveResults.length} comprehensive results!`);
        comprehensiveResults.forEach((post, i) => {
            console.log(`  ${i+1}. "${post.title}" in r/${post.subreddit} (${post.score} upvotes)`);
        });
    } else {
        console.log('❌ No comprehensive results');
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ Enhanced Scanner Test Complete!');
    console.log('\n💡 Now you can search for ANY keyword!');
}

// Run tests
if (require.main === module) {
    testEnhancedFeatures().catch(console.error);
}

module.exports = testEnhancedFeatures;