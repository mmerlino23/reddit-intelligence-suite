# 🚀 Quick Start Guide

## Installation
```bash
# No dependencies needed - uses native Node.js!
cd reddit-intelligence-suite
```

## Start the Web Dashboard
```bash
node app.js server
# Dashboard available at: http://localhost:3000
```

## Command Line Examples

### 1. Analyze a Keyword
```bash
node app.js analyze --keyword "your topic" --limit 50

# Example:
node app.js analyze --keyword "productivity" --limit 25
```

### 2. Generate Brand Report
```bash
node app.js brand --name "YourBrand" --domain "yourdomain.com"

# Example:
node app.js brand --name "Notion" --domain "notion.so"
```

### 3. Create Content from Analysis
```bash
# First run an analysis, then:
node app.js create-content --from-analysis data/keywords/your_keyword_*.json
```

## Web Dashboard Features

1. **Keyword Analysis Tab**
   - Enter any keyword or service
   - Get sentiment analysis
   - Find pain points
   - Discover content opportunities

2. **Brand Report Tab**
   - Enter brand name
   - Get complete report card
   - See sentiment scores
   - Find brand advocates and critics

3. **Content Creation Tab**
   - Generate content from analysis
   - Get formatted posts for all platforms
   - Download visuals and graphics

4. **Real-time Monitor Tab**
   - Track keywords continuously
   - Get alerts for urgent issues
   - Monitor sentiment changes

## Common Use Cases

### Find Product-Market Fit
```bash
node app.js analyze --keyword "your product idea"
# See if people are asking for it
```

### Competitive Analysis
```bash
node app.js brand --name "Competitor1"
node app.js brand --name "YourBrand"
# Compare sentiment and engagement
```

### Content Calendar
```bash
node app.js analyze --keyword "your niche"
# Find trending topics and pain points to address
```

## Tips

1. **Start Broad**: Use general keywords first, then narrow down
2. **Check Sentiment**: Negative sentiment = opportunity to help
3. **Monitor Urgency**: "urgent" mentions = immediate content opportunity
4. **Track Competitors**: See what users say about alternatives
5. **Export Everything**: Save analysis for future reference

## Troubleshooting

### No Results Found?
- Try more common keywords
- Remove special characters
- Use single words instead of phrases

### Port Already in Use?
```bash
# Use a different port:
node app.js server --port 3001
```

### Need Help?
```bash
node app.js help
```

## Output Locations

- **Analysis Data**: `data/keywords/`
- **Brand Reports**: `data/brands/`
- **Generated Content**: `output/content/`
- **Images/Graphics**: `output/images/`

## Next Steps

1. Run your first analysis
2. Generate a brand report
3. Create content from insights
4. Share on social media
5. Monitor results

---

**Ready to transform Reddit data into actionable insights!** 🎯