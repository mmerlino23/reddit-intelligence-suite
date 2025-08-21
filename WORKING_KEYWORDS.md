# 🎯 Working Keywords & Usage Guide

## Important: API Limitation
The Reddit34 API only returns **currently hot/popular posts**, not search results. This means you need to use keywords that appear in trending content.

## ✅ Currently Working Keywords (Updated Daily)

### Guaranteed to Return Results:
- **king** - Royal guard/King Charles posts
- **trump** - Political discussions  
- **wasp** - Viral wasp sting post
- **charles** - King Charles content
- **solar** - Energy/environment posts
- **wind** - Power/energy discussions
- **guard** - Royal guard content
- **birthday** - Celebration posts

### How to Find More Working Keywords:

1. **Check Current Hot Posts:**
```bash
node simple-reddit-client.js
```
This shows what's actually trending right now.

2. **Use Partial Words:**
Instead of "King Charles", just use "king" or "charles"

3. **Try Common Words:**
Words that appear frequently in titles like:
- the, was, when, how, why
- today, new, first, best
- people, world, time

## 📊 Best Practices

### For Keyword Analysis:
```bash
# Use single words from trending topics
node app.js analyze --keyword "king" --limit 10

# Try common words
node app.js analyze --keyword "the" --limit 5
```

### For Brand Reports:
```bash
# Use well-known brands/names
node app.js brand --name "Trump"
node app.js brand --name "Biden"
node app.js brand --name "Apple"
```

### For Testing:
```bash
# Run the demo to see working examples
node demo.js
```

## 🔄 Workaround for Specific Topics

Since we can't search for specific topics, here's how to work around it:

1. **Analyze Broad Keywords First**
   - Start with common words
   - Filter results manually for your topic

2. **Use the Pain Point Extractor**
   - Even unrelated posts reveal common pain points
   - These insights apply across industries

3. **Focus on Sentiment Patterns**
   - Sentiment analysis works on any content
   - Use it to understand community mood

4. **Generate Content Anyway**
   - Use the content creator with mock data
   - Base it on your knowledge of the topic

## 💡 Alternative Approach

For real Reddit search capabilities, consider:

1. **Reddit's Official API** - Requires registration
2. **PRAW (Python)** - More comprehensive
3. **Snoowrap (JavaScript)** - Full Reddit API wrapper

## 📝 Example Workflow

```bash
# 1. Find what's trending
node simple-reddit-client.js

# 2. Pick a keyword from the titles
node app.js analyze --keyword "guard" --limit 10

# 3. Generate content from the analysis
node app.js create-content --from-analysis data/keywords/guard_*.json

# 4. View in dashboard
node app.js server
# Open http://localhost:3000
```

## 🚀 Making It Useful Despite Limitations

### Use Case 1: Trend Monitoring
- Track what's viral RIGHT NOW
- Understand current sentiment
- Ride trending waves

### Use Case 2: Content Inspiration
- See what gets engagement
- Learn from viral posts
- Create similar content

### Use Case 3: Sentiment Practice
- Test sentiment analysis
- Understand pain extraction
- Practice content generation

## 📊 Dashboard Tips

When using the web dashboard:

1. **Start with these keywords:**
   - king, trump, wasp, solar

2. **For "No Data" errors:**
   - Try simpler, single words
   - Check the hot posts first
   - Use words from current titles

3. **Brand Reports:**
   - Stick to famous brands/people
   - Single words work better

---

**Remember:** This tool works best for analyzing CURRENT trends, not historical searches. Use it to understand what's hot NOW and generate content based on real-time insights!