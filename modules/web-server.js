const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const querystring = require('querystring');

class WebServer {
    constructor(suite) {
        this.suite = suite;
        this.server = null;
        this.routes = {
            '/': this.serveHomepage.bind(this),
            '/api/analyze': this.handleAnalyze.bind(this),
            '/api/brand': this.handleBrandReport.bind(this),
            '/api/create-content': this.handleContentCreation.bind(this),
            '/api/status': this.handleStatus.bind(this),
            '/dashboard': this.serveDashboard.bind(this),
            '/assets/style.css': this.serveCSS.bind(this),
            '/assets/app.js': this.serveJS.bind(this)
        };
    }

    async start(port = 3000) {
        this.server = http.createServer((req, res) => {
            const parsedUrl = url.parse(req.url, true);
            const pathname = parsedUrl.pathname;
            
            // Enable CORS
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
            
            if (req.method === 'OPTIONS') {
                res.writeHead(200);
                res.end();
                return;
            }
            
            // Route request
            const handler = this.routes[pathname];
            if (handler) {
                handler(req, res, parsedUrl);
            } else {
                this.serve404(res);
            }
        });
        
        this.server.listen(port, () => {
            console.log(`Web server running on http://localhost:${port}`);
        });
    }

    serveHomepage(req, res) {
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reddit Intelligence Suite</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
        }
        .container {
            text-align: center;
            padding: 2rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            backdrop-filter: blur(10px);
            max-width: 600px;
        }
        h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        .subtitle {
            font-size: 1.2rem;
            margin-bottom: 2rem;
            opacity: 0.9;
        }
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin: 2rem 0;
        }
        .feature {
            background: rgba(255, 255, 255, 0.1);
            padding: 1rem;
            border-radius: 10px;
            transition: transform 0.3s;
        }
        .feature:hover {
            transform: translateY(-5px);
            background: rgba(255, 255, 255, 0.2);
        }
        .feature-icon {
            font-size: 2rem;
            margin-bottom: 0.5rem;
        }
        .btn {
            display: inline-block;
            padding: 1rem 2rem;
            background: #fff;
            color: #667eea;
            text-decoration: none;
            border-radius: 50px;
            font-weight: bold;
            margin: 0.5rem;
            transition: transform 0.3s, box-shadow 0.3s;
        }
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.2);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔍 Reddit Intelligence Suite</h1>
        <p class="subtitle">Transform Reddit Data into Actionable Insights</p>
        
        <div class="features">
            <div class="feature">
                <div class="feature-icon">📊</div>
                <h3>Sentiment Analysis</h3>
                <p>Real-time community sentiment tracking</p>
            </div>
            <div class="feature">
                <div class="feature-icon">🎯</div>
                <h3>Pain Point Extraction</h3>
                <p>Identify user problems & needs</p>
            </div>
            <div class="feature">
                <div class="feature-icon">📈</div>
                <h3>Brand Analytics</h3>
                <p>Complete brand report cards</p>
            </div>
            <div class="feature">
                <div class="feature-icon">✍️</div>
                <h3>Content Creation</h3>
                <p>AI-powered content generation</p>
            </div>
            <div class="feature">
                <div class="feature-icon">🖼️</div>
                <h3>Visual Generation</h3>
                <p>Automated infographics & charts</p>
            </div>
            <div class="feature">
                <div class="feature-icon">📱</div>
                <h3>Social Formatting</h3>
                <p>Multi-platform optimization</p>
            </div>
        </div>
        
        <div>
            <a href="/dashboard" class="btn">Open Dashboard</a>
            <a href="#" onclick="showAPIInfo()" class="btn">API Documentation</a>
        </div>
    </div>
    
    <script>
        function showAPIInfo() {
            alert(\`API Endpoints:\\n\\n/api/analyze - Analyze keywords\\n/api/brand - Generate brand report\\n/api/create-content - Create content\\n/api/status - System status\`);
        }
    </script>
</body>
</html>`;
        
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
    }

    serveDashboard(req, res) {
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reddit Intelligence Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f7fa;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 1rem 2rem;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header h1 {
            font-size: 1.5rem;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 2rem;
        }
        .tabs {
            display: flex;
            gap: 1rem;
            margin-bottom: 2rem;
            border-bottom: 2px solid #e0e0e0;
        }
        .tab {
            padding: 1rem 2rem;
            background: none;
            border: none;
            font-size: 1rem;
            cursor: pointer;
            border-bottom: 3px solid transparent;
            transition: all 0.3s;
        }
        .tab.active {
            border-bottom-color: #667eea;
            color: #667eea;
            font-weight: bold;
        }
        .panel {
            display: none;
            background: white;
            padding: 2rem;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        .panel.active {
            display: block;
        }
        .form-group {
            margin-bottom: 1.5rem;
        }
        label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 600;
            color: #333;
        }
        input, textarea, select {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 1rem;
        }
        textarea {
            min-height: 100px;
            resize: vertical;
        }
        .btn {
            padding: 0.75rem 2rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 1rem;
            cursor: pointer;
            transition: transform 0.3s;
        }
        .btn:hover {
            transform: translateY(-2px);
        }
        .btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        .results {
            margin-top: 2rem;
            padding: 1.5rem;
            background: #f8f9fa;
            border-radius: 5px;
            max-height: 500px;
            overflow-y: auto;
        }
        .result-item {
            background: white;
            padding: 1rem;
            margin-bottom: 1rem;
            border-radius: 5px;
            border-left: 4px solid #667eea;
        }
        .loading {
            text-align: center;
            padding: 2rem;
        }
        .spinner {
            border: 3px solid #f3f3f3;
            border-top: 3px solid #667eea;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
        }
        .stat-card {
            background: white;
            padding: 1.5rem;
            border-radius: 10px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }
        .stat-value {
            font-size: 2rem;
            font-weight: bold;
            color: #667eea;
        }
        .stat-label {
            color: #666;
            margin-top: 0.5rem;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔍 Reddit Intelligence Dashboard</h1>
    </div>
    
    <div class="container">
        <div class="tabs">
            <button class="tab active" onclick="switchTab('analyze')">Keyword Analysis</button>
            <button class="tab" onclick="switchTab('brand')">Brand Report</button>
            <button class="tab" onclick="switchTab('content')">Content Creation</button>
            <button class="tab" onclick="switchTab('monitor')">Real-time Monitor</button>
        </div>
        
        <!-- Keyword Analysis Panel -->
        <div id="analyze-panel" class="panel active">
            <h2>Keyword Analysis</h2>
            <form id="analyze-form">
                <div class="form-group">
                    <label for="keyword">Keyword or Service:</label>
                    <input type="text" id="keyword" name="keyword" placeholder="e.g., project management, AI tools, SaaS pricing" required>
                </div>
                <div class="form-group">
                    <label for="limit">Number of Posts to Analyze:</label>
                    <select id="limit" name="limit">
                        <option value="25">25 posts</option>
                        <option value="50" selected>50 posts</option>
                        <option value="100">100 posts</option>
                    </select>
                </div>
                <button type="submit" class="btn">Analyze</button>
            </form>
            <div id="analyze-results" class="results" style="display: none;"></div>
        </div>
        
        <!-- Brand Report Panel -->
        <div id="brand-panel" class="panel">
            <h2>Brand Report Card</h2>
            <form id="brand-form">
                <div class="form-group">
                    <label for="brand-name">Brand Name:</label>
                    <input type="text" id="brand-name" name="brandName" placeholder="e.g., Notion, Slack, Stripe" required>
                </div>
                <div class="form-group">
                    <label for="domain">Domain (optional):</label>
                    <input type="text" id="domain" name="domain" placeholder="e.g., notion.so">
                </div>
                <button type="submit" class="btn">Generate Report</button>
            </form>
            <div id="brand-results" class="results" style="display: none;"></div>
        </div>
        
        <!-- Content Creation Panel -->
        <div id="content-panel" class="panel">
            <h2>Content Creation</h2>
            <form id="content-form">
                <div class="form-group">
                    <label for="content-base">Create Content Based On:</label>
                    <select id="content-base" name="basedOn">
                        <option value="pain_points">Pain Points</option>
                        <option value="sentiment">Sentiment Analysis</option>
                        <option value="trending">Trending Topics</option>
                        <option value="comparison">Competitor Comparison</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="content-data">Analysis Data (JSON):</label>
                    <textarea id="content-data" name="data" placeholder="Paste analysis results here or run an analysis first"></textarea>
                </div>
                <button type="submit" class="btn">Generate Content</button>
            </form>
            <div id="content-results" class="results" style="display: none;"></div>
        </div>
        
        <!-- Real-time Monitor Panel -->
        <div id="monitor-panel" class="panel">
            <h2>Real-time Monitoring</h2>
            <div class="stats">
                <div class="stat-card">
                    <div class="stat-value" id="total-monitored">0</div>
                    <div class="stat-label">Keywords Monitored</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" id="total-threads">0</div>
                    <div class="stat-label">Threads Analyzed</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" id="avg-sentiment">0%</div>
                    <div class="stat-label">Average Sentiment</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" id="pain-points">0</div>
                    <div class="stat-label">Pain Points Found</div>
                </div>
            </div>
            <form id="monitor-form">
                <div class="form-group">
                    <label for="monitor-keyword">Add Keyword to Monitor:</label>
                    <input type="text" id="monitor-keyword" name="keyword" placeholder="Enter keyword to monitor">
                </div>
                <button type="submit" class="btn">Start Monitoring</button>
            </form>
            <div id="monitor-results" class="results" style="display: none;"></div>
        </div>
    </div>
    
    <script>
        function switchTab(tabName) {
            // Hide all panels
            document.querySelectorAll('.panel').forEach(panel => {
                panel.classList.remove('active');
            });
            
            // Remove active class from all tabs
            document.querySelectorAll('.tab').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Show selected panel
            document.getElementById(tabName + '-panel').classList.add('active');
            
            // Activate selected tab
            event.target.classList.add('active');
        }
        
        // Handle form submissions
        document.getElementById('analyze-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const resultsDiv = document.getElementById('analyze-results');
            
            resultsDiv.innerHTML = '<div class="loading"><div class="spinner"></div><p>Analyzing Reddit discussions...</p></div>';
            resultsDiv.style.display = 'block';
            
            try {
                const response = await fetch('/api/analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        keyword: formData.get('keyword'),
                        limit: parseInt(formData.get('limit'))
                    })
                });
                
                const data = await response.json();
                displayAnalysisResults(data, resultsDiv);
            } catch (error) {
                resultsDiv.innerHTML = '<div class="error">Error: ' + error.message + '</div>';
            }
        });
        
        document.getElementById('brand-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const resultsDiv = document.getElementById('brand-results');
            
            resultsDiv.innerHTML = '<div class="loading"><div class="spinner"></div><p>Generating brand report...</p></div>';
            resultsDiv.style.display = 'block';
            
            try {
                const response = await fetch('/api/brand', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        brandName: formData.get('brandName'),
                        domain: formData.get('domain')
                    })
                });
                
                const data = await response.json();
                displayBrandResults(data, resultsDiv);
            } catch (error) {
                resultsDiv.innerHTML = '<div class="error">Error: ' + error.message + '</div>';
            }
        });
        
        function displayAnalysisResults(data, container) {
            let html = '<h3>Analysis Results</h3>';
            
            if (!data) {
                container.innerHTML = '<div class="result-item"><p>No data found for this keyword. Try a more common term or check your spelling.</p></div>';
                return;
            }
            
            if (data.sentimentBreakdown) {
                html += '<div class="result-item"><h4>Sentiment Analysis</h4>';
                html += '<p>Positive: ' + data.sentimentBreakdown.positive + '</p>';
                html += '<p>Negative: ' + data.sentimentBreakdown.negative + '</p>';
                html += '<p>Neutral: ' + data.sentimentBreakdown.neutral + '</p></div>';
            }
            
            if (data.painPoints) {
                html += '<div class="result-item"><h4>Top Pain Points</h4><ul>';
                Object.entries(data.painPoints).forEach(([category, points]) => {
                    points.slice(0, 3).forEach(point => {
                        html += '<li>' + point.pattern + '</li>';
                    });
                });
                html += '</ul></div>';
            }
            
            if (data.contentOpportunities) {
                html += '<div class="result-item"><h4>Content Opportunities</h4><ul>';
                data.contentOpportunities.forEach(opp => {
                    html += '<li>' + opp.suggestion + ' (Priority: ' + opp.priority + ')</li>';
                });
                html += '</ul></div>';
            }
            
            container.innerHTML = html;
        }
        
        function displayBrandResults(data, container) {
            let html = '<h3>Brand Report Card</h3>';
            
            if (!data) {
                container.innerHTML = '<div class="result-item"><p>No data found for this brand. Try a different brand name.</p></div>';
                return;
            }
            
            if (data.status === 'no_data') {
                container.innerHTML = '<div class="result-item"><p>' + (data.message || 'No mentions found for this brand') + '</p></div>';
                return;
            }
            
            if (data.reportCard) {
                html += '<div class="result-item"><h4>Overall Grade: ' + data.reportCard.overall + '</h4>';
                html += '<p>' + data.reportCard.summary + '</p></div>';
            }
            
            if (data.sentiment) {
                html += '<div class="result-item"><h4>Sentiment Score</h4>';
                html += '<p>Overall: ' + (data.sentiment.overall * 100).toFixed(1) + '%</p></div>';
            }
            
            if (data.opportunities) {
                html += '<div class="result-item"><h4>Opportunities</h4><ul>';
                data.opportunities.forEach(opp => {
                    html += '<li>' + opp.description + '</li>';
                });
                html += '</ul></div>';
            }
            
            container.innerHTML = html;
        }
    </script>
</body>
</html>`;
        
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
    }

    async handleAnalyze(req, res, parsedUrl) {
        if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', async () => {
                try {
                    const data = JSON.parse(body);
                    const analysis = await this.suite.analyzeKeyword(data.keyword, { limit: data.limit });
                    
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(analysis));
                } catch (error) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: error.message }));
                }
            });
        } else {
            res.writeHead(405);
            res.end('Method not allowed');
        }
    }

    async handleBrandReport(req, res) {
        if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', async () => {
                try {
                    const data = JSON.parse(body);
                    const report = await this.suite.generateBrandReport(data.brandName, data.domain);
                    
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(report));
                } catch (error) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: error.message }));
                }
            });
        } else {
            res.writeHead(405);
            res.end('Method not allowed');
        }
    }

    async handleContentCreation(req, res) {
        if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', async () => {
                try {
                    const data = JSON.parse(body);
                    const content = await this.suite.createContent(data.basedOn, data.data);
                    
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(content));
                } catch (error) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: error.message }));
                }
            });
        } else {
            res.writeHead(405);
            res.end('Method not allowed');
        }
    }

    handleStatus(req, res) {
        const status = {
            status: 'operational',
            timestamp: new Date().toISOString(),
            modules: {
                scanner: 'ready',
                sentiment: 'ready',
                painExtractor: 'ready',
                brandAnalyzer: 'ready',
                contentCreator: 'ready',
                imageGenerator: 'ready',
                socialFormatter: 'ready'
            }
        };
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(status));
    }

    serveCSS(req, res) {
        res.writeHead(200, { 'Content-Type': 'text/css' });
        res.end('/* Custom styles */');
    }

    serveJS(req, res) {
        res.writeHead(200, { 'Content-Type': 'application/javascript' });
        res.end('// Custom scripts');
    }

    serve404(res) {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 - Page Not Found</h1>');
    }
}

module.exports = WebServer;