#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const Scanner = require('./modules/scanner');
const RedditAPI = require('./modules/reddit-api');
const EnhancedScanner = require('./modules/enhanced-scanner');
const SentimentAnalyzer = require('./modules/sentiment');
const PainExtractor = require('./modules/pain-extractor');
const BrandAnalyzer = require('./modules/brand-analyzer');
const ContentCreator = require('./modules/content-creator');
const ImageGenerator = require('./modules/image-generator');
const SocialFormatter = require('./modules/social-formatter');
const WebServer = require('./modules/web-server');

class RedditIntelligenceSuite {
    constructor() {
        this.scanner = new Scanner();
        this.enhancedScanner = new EnhancedScanner();
        this.sentiment = new SentimentAnalyzer();
        this.painExtractor = new PainExtractor();
        this.brandAnalyzer = new BrandAnalyzer();
        this.contentCreator = new ContentCreator();
        this.imageGenerator = new ImageGenerator();
        this.socialFormatter = new SocialFormatter();
        this.config = this.loadConfig();
    }

    loadConfig() {
        const configPath = path.join(__dirname, 'config', 'settings.json');
        if (fs.existsSync(configPath)) {
            return JSON.parse(fs.readFileSync(configPath, 'utf8'));
        }
        return {
            scanDepth: 100,
            sentimentThreshold: 0.6,
            urgencyKeywords: ['urgent', 'asap', 'immediately', 'help', 'critical', 'emergency'],
            painIndicators: ['problem', 'issue', 'difficult', 'struggle', 'frustrating', 'annoying', 'broken', 'doesn\'t work', 'wish', 'need']
        };
    }

    async analyzeKeyword(keyword, options = {}) {
        console.log(`\n🔍 Analyzing keyword: "${keyword}"\n${'='.repeat(50)}`);
        
        // Use enhanced scanner for real search
        const threads = await this.enhancedScanner.searchPosts(keyword, options.limit || 50);
        
        if (!threads || threads.length === 0) {
            console.log('No threads found for this keyword.');
            return null;
        }

        // Analyze each thread
        const analysis = {
            keyword,
            timestamp: new Date().toISOString(),
            totalThreads: threads.length,
            totalComments: 0,
            sentimentBreakdown: { positive: 0, negative: 0, neutral: 0 },
            painPoints: [],
            needs: [],
            urgentIssues: [],
            topThreads: [],
            contentOpportunities: []
        };

        for (const thread of threads) {
            // Sentiment analysis
            const sentiment = this.sentiment.analyze(thread.title + ' ' + (thread.text || ''));
            analysis.sentimentBreakdown[sentiment.category]++;
            
            // Extract pain points
            const pains = this.painExtractor.extract(thread);
            analysis.painPoints.push(...pains);
            
            // Check urgency
            if (this.checkUrgency(thread)) {
                analysis.urgentIssues.push({
                    title: thread.title,
                    url: thread.permalink,
                    score: thread.score
                });
            }
            
            // Add to top threads
            analysis.topThreads.push({
                title: thread.title,
                subreddit: thread.subreddit,
                score: thread.score,
                comments: thread.comments,
                sentiment: sentiment.score,
                url: thread.permalink
            });
            
            analysis.totalComments += thread.comments || 0;
        }

        // Sort and deduplicate pain points
        analysis.painPoints = this.consolidatePainPoints(analysis.painPoints);
        
        // Generate content opportunities
        analysis.contentOpportunities = this.identifyContentOpportunities(analysis);
        
        // Save analysis
        this.saveAnalysis('keyword', keyword, analysis);
        
        return analysis;
    }

    async generateBrandReport(brandName, domain = null) {
        console.log(`\n📊 Generating Brand Report Card for: ${brandName}\n${'='.repeat(50)}`);
        
        const report = await this.brandAnalyzer.generateReport(brandName, domain);
        
        // Save report
        this.saveAnalysis('brand', brandName, report);
        
        return report;
    }

    async createContent(basedOn, data) {
        console.log(`\n✍️ Creating Content Based on: ${basedOn}\n${'='.repeat(50)}`);
        
        const content = await this.contentCreator.generate(basedOn, data);
        const formatted = await this.socialFormatter.formatForAllPlatforms(content);
        const images = await this.imageGenerator.createVisuals(content, data);
        
        const contentPackage = {
            original: content,
            formatted,
            images,
            timestamp: new Date().toISOString()
        };
        
        // Save content package
        this.saveContent(contentPackage);
        
        return contentPackage;
    }

    checkUrgency(thread) {
        const text = (thread.title + ' ' + (thread.text || '')).toLowerCase();
        const urgencyKeywords = this.config.urgencyKeywords || ['urgent', 'asap', 'help', 'immediately'];
        return urgencyKeywords.some(keyword => text.includes(keyword));
    }

    consolidatePainPoints(painPoints) {
        const grouped = {};
        
        painPoints.forEach(pain => {
            const key = pain.category || 'general';
            if (!grouped[key]) {
                grouped[key] = [];
            }
            grouped[key].push(pain);
        });
        
        // Sort by frequency and severity
        Object.keys(grouped).forEach(key => {
            grouped[key].sort((a, b) => (b.severity || 0) - (a.severity || 0));
        });
        
        return grouped;
    }

    identifyContentOpportunities(analysis) {
        const opportunities = [];
        
        // High urgency issues = immediate content opportunity
        if (analysis.urgentIssues.length > 0) {
            opportunities.push({
                type: 'urgent_response',
                priority: 'high',
                suggestion: 'Create immediate helpful content addressing urgent issues',
                topics: analysis.urgentIssues.slice(0, 3)
            });
        }
        
        // Negative sentiment = educational/solution content
        const negativeRatio = analysis.sentimentBreakdown.negative / analysis.totalThreads;
        if (negativeRatio > 0.3) {
            opportunities.push({
                type: 'solution_content',
                priority: 'high',
                suggestion: 'Create solution-focused content to address negative sentiment',
                sentimentRatio: negativeRatio
            });
        }
        
        // Common pain points = tutorial/guide content
        Object.keys(analysis.painPoints).forEach(category => {
            if (analysis.painPoints[category].length > 3) {
                opportunities.push({
                    type: 'tutorial',
                    priority: 'medium',
                    suggestion: `Create guide for ${category} issues`,
                    painCount: analysis.painPoints[category].length
                });
            }
        });
        
        return opportunities;
    }

    saveAnalysis(type, identifier, data) {
        const dir = path.join(__dirname, 'data', type === 'keyword' ? 'keywords' : 'brands');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        const filename = `${identifier.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.json`;
        const filepath = path.join(dir, filename);
        
        fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
        console.log(`\n💾 Analysis saved to: ${filepath}`);
    }

    saveContent(contentPackage) {
        const dir = path.join(__dirname, 'output', 'content');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        const filename = `content_${Date.now()}.json`;
        const filepath = path.join(dir, filename);
        
        fs.writeFileSync(filepath, JSON.stringify(contentPackage, null, 2));
        console.log(`\n💾 Content package saved to: ${filepath}`);
    }

    async startWebDashboard(port = 3000) {
        const server = new WebServer(this);
        await server.start(port);
        console.log(`\n🌐 Web dashboard running at: http://localhost:${port}`);
    }

    printHelp() {
        console.log(`
Reddit Intelligence & Content Creation Suite
============================================

Usage: node app.js [command] [options]

Commands:
  analyze --keyword "keyword" [--limit 50]
    Analyze a keyword/service across Reddit
    
  brand --name "brand" [--domain "example.com"]
    Generate brand report card
    
  create-content --from-analysis [analysis-file]
    Generate content from analysis data
    
  monitor --keyword "keyword" [--interval 3600]
    Monitor keyword in real-time
    
  server [--port 3000]
    Start web dashboard
    
  help
    Show this help message

Examples:
  node app.js analyze --keyword "project management"
  node app.js brand --name "notion" --domain "notion.so"
  node app.js create-content --from-analysis data/keywords/project_management.json
  node app.js server --port 8080
        `);
    }
}

// CLI handling
async function main() {
    const suite = new RedditIntelligenceSuite();
    const args = process.argv.slice(2);
    
    if (args.length === 0 || args[0] === 'help') {
        suite.printHelp();
        return;
    }
    
    const command = args[0];
    
    switch (command) {
        case 'analyze':
            const keywordIndex = args.indexOf('--keyword');
            if (keywordIndex === -1) {
                console.error('Error: --keyword parameter required');
                return;
            }
            const keyword = args[keywordIndex + 1];
            const limitIndex = args.indexOf('--limit');
            const limit = limitIndex !== -1 ? parseInt(args[limitIndex + 1]) : 50;
            
            const analysis = await suite.analyzeKeyword(keyword, { limit });
            console.log('\n📋 Analysis Summary:');
            console.log(JSON.stringify(analysis, null, 2));
            break;
            
        case 'brand':
            const brandIndex = args.indexOf('--name');
            if (brandIndex === -1) {
                console.error('Error: --name parameter required');
                return;
            }
            const brandName = args[brandIndex + 1];
            const domainIndex = args.indexOf('--domain');
            const domain = domainIndex !== -1 ? args[domainIndex + 1] : null;
            
            const report = await suite.generateBrandReport(brandName, domain);
            console.log('\n📋 Brand Report:');
            console.log(JSON.stringify(report, null, 2));
            break;
            
        case 'create-content':
            const fromIndex = args.indexOf('--from-analysis');
            if (fromIndex === -1) {
                console.error('Error: --from-analysis parameter required');
                return;
            }
            const analysisFile = args[fromIndex + 1];
            
            if (!fs.existsSync(analysisFile)) {
                console.error(`Error: Analysis file not found: ${analysisFile}`);
                return;
            }
            
            const analysisData = JSON.parse(fs.readFileSync(analysisFile, 'utf8'));
            const content = await suite.createContent('analysis', analysisData);
            console.log('\n📝 Generated Content Package:');
            console.log(JSON.stringify(content, null, 2));
            break;
            
        case 'server':
            const portIndex = args.indexOf('--port');
            const port = portIndex !== -1 ? parseInt(args[portIndex + 1]) : 3000;
            await suite.startWebDashboard(port);
            break;
            
        default:
            console.error(`Unknown command: ${command}`);
            suite.printHelp();
    }
}

// Export for use as module
module.exports = RedditIntelligenceSuite;

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}