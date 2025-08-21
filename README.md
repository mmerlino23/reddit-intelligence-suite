# Reddit Intelligence & Content Creation Suite 🔍

A comprehensive tool that transforms Reddit data into actionable business insights, generates content, and creates social media campaigns - all from a single keyword or brand name.

## 🚀 Features

### 1. **Market Intelligence Engine**
- **Keyword Analysis**: Deep dive into any keyword/service across Reddit
- **Sentiment Analysis**: Real-time community sentiment tracking
- **Pain Point Extraction**: Identify user problems, needs, and urgency levels
- **Trend Detection**: Spot emerging topics before they go viral

### 2. **Brand Report Card**
- **Comprehensive Brand Analysis**: Complete assessment of brand presence on Reddit
- **Competitor Tracking**: Monitor and compare against competitors
- **Influencer Identification**: Find brand advocates and critics
- **Engagement Metrics**: Track virality and discussion patterns
- **Risk Assessment**: Identify reputation risks and opportunities

### 3. **Content Generation**
- **AI-Powered Creation**: Generate content based on real user insights
- **Multiple Formats**: Blog posts, social media, tutorials, comparisons
- **Solution-Focused**: Address actual pain points from the community
- **SEO Optimized**: Keywords and structure for maximum visibility

### 4. **Visual Generation**
- **Automated Infographics**: Transform data into visual insights
- **Sentiment Charts**: Beautiful visualization of community feelings
- **Comparison Tables**: Clear competitive analysis visuals
- **Social Media Graphics**: Platform-optimized images

### 5. **Social Media Formatter**
- **Multi-Platform Optimization**: Format for Reddit, Twitter, LinkedIn, Instagram, Facebook, TikTok
- **Platform-Specific**: Respect character limits, hashtags, best practices
- **Posting Schedule**: Recommendations for optimal engagement times
- **A/B Testing**: Multiple content variations for testing

## 📦 Installation

```bash
# Clone the repository
git clone [repository-url]
cd reddit-intelligence-suite

# No dependencies required - uses native Node.js!
# Just run:
npm start
```

## 🎯 Quick Start

### Command Line Usage

```bash
# Analyze a keyword
node app.js analyze --keyword "project management" --limit 50

# Generate brand report
node app.js brand --name "notion" --domain "notion.so"

# Create content from analysis
node app.js create-content --from-analysis data/keywords/project_management.json

# Start web dashboard
node app.js server --port 3000
```

### Web Dashboard

1. Start the server:
```bash
npm start
# or
node app.js server
```

2. Open browser to: `http://localhost:3000`

3. Use the dashboard to:
   - Analyze keywords
   - Generate brand reports
   - Create content
   - Monitor trends

## 💡 Use Cases

### For Marketers
- **Content Strategy**: Create content that addresses real user needs
- **Campaign Planning**: Base campaigns on actual community insights
- **Competitor Analysis**: Understand competitive positioning
- **Trend Monitoring**: Stay ahead of industry trends

### For Product Teams
- **Feature Prioritization**: Identify most requested features
- **Bug Discovery**: Find issues users are discussing
- **User Research**: Understand user sentiment and needs
- **Feedback Analysis**: Aggregate and analyze user feedback

### For Customer Success
- **Pain Point Resolution**: Proactively address common issues
- **FAQ Creation**: Build FAQs from actual questions
- **Support Content**: Create helpful guides and tutorials
- **Community Engagement**: Respond to community concerns

### For Sales Teams
- **Lead Generation**: Identify potential customers discussing problems
- **Objection Handling**: Understand common objections
- **Competitive Intelligence**: Know what users say about competitors
- **Value Proposition**: Refine messaging based on user language

## 📊 Example Outputs

### Keyword Analysis Result
```json
{
  "keyword": "project management software",
  "totalThreads": 50,
  "sentimentBreakdown": {
    "positive": 15,
    "negative": 20,
    "neutral": 15
  },
  "topPainPoints": [
    "Too expensive for small teams",
    "Steep learning curve",
    "Poor mobile experience"
  ],
  "contentOpportunities": [
    {
      "type": "tutorial",
      "suggestion": "Create beginner's guide",
      "priority": "high"
    }
  ]
}
```

### Brand Report Card
```
Brand: Notion
Grade: B+

Sentiment: 72% Positive
Mentions: 487 across 156 threads
Top Advocates: 12 identified
Main Concerns: Mobile performance, pricing

Opportunities:
- Create mobile optimization guide
- Launch student discount program
- Engage with top advocates
```

### Generated Content Package
- **Reddit Post**: Optimized for community engagement
- **Twitter Thread**: 5-7 tweets with visuals
- **LinkedIn Article**: Professional tone, 800 words
- **Instagram Carousel**: 5 slides with key points
- **TikTok Script**: 30-60 second video outline

## 🛠️ API Endpoints

The suite provides REST API endpoints for integration:

```
POST /api/analyze
  Body: { keyword: string, limit: number }
  
POST /api/brand
  Body: { brandName: string, domain?: string }
  
POST /api/create-content
  Body: { basedOn: string, data: object }
  
GET /api/status
  Returns: System status and module health
```

## 📁 Project Structure

```
reddit-intelligence-suite/
├── app.js                 # Main application
├── modules/
│   ├── scanner.js        # Reddit data scanner
│   ├── sentiment.js      # Sentiment analyzer
│   ├── pain-extractor.js # Pain point extraction
│   ├── brand-analyzer.js # Brand report generator
│   ├── content-creator.js # Content generation
│   ├── image-generator.js # Visual creation
│   ├── social-formatter.js # Platform formatting
│   └── web-server.js     # Dashboard server
├── config/
│   └── settings.json     # Configuration
├── data/                 # Data storage
├── output/              # Generated content
└── web/                 # Dashboard files
```

## ⚙️ Configuration

Edit `config/settings.json` to customize:

- API keys and endpoints
- Analysis parameters
- Content generation settings
- Social media platforms
- Monitoring intervals
- Storage options

## 🔒 Security & Privacy

- No data is sent to external services (except Reddit API)
- All processing happens locally
- API keys are stored locally
- Generated content is saved locally

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

MIT License - Use freely for any purpose

## 🆘 Support

- **Documentation**: See `/docs` folder
- **Issues**: Report bugs via GitHub Issues
- **Questions**: Open a discussion

## 🎉 Examples & Demos

### Example 1: Startup Validation
```bash
# Validate your startup idea
node app.js analyze --keyword "your product idea" --limit 100

# See what problems people have
# Understand market sentiment
# Find early adopters
```

### Example 2: Content Calendar
```bash
# Generate a month of content
node app.js analyze --keyword "your niche"
node app.js create-content --from-analysis data/keywords/your_niche.json

# Get content for all platforms
# Address real user needs
# Stay relevant
```

### Example 3: Competitive Intelligence
```bash
# Compare against competitors
node app.js brand --name "YourBrand"
node app.js brand --name "Competitor1"
node app.js brand --name "Competitor2"

# See sentiment differences
# Find competitive advantages
# Identify market gaps
```

## 🚦 Getting Started Checklist

- [ ] Clone the repository
- [ ] Run `npm start` to launch dashboard
- [ ] Try analyzing a keyword relevant to your business
- [ ] Generate your first brand report
- [ ] Create content from the insights
- [ ] Share on social media
- [ ] Monitor results

## 💪 Pro Tips

1. **Start Broad**: Begin with general keywords, then narrow down
2. **Regular Monitoring**: Set up weekly brand reports
3. **Content Testing**: Use A/B variations for better engagement
4. **Combine Insights**: Mix pain points with trending topics
5. **Visual Impact**: Always include generated visuals
6. **Timing Matters**: Post at recommended times for each platform
7. **Engage Quickly**: Respond to comments within first hour
8. **Track Results**: Monitor which content performs best

---

**Built with ❤️ for marketers, product teams, and content creators who want data-driven insights from Reddit**