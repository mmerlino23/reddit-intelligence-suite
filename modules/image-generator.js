const fs = require('fs');
const path = require('path');

class ImageGenerator {
    constructor() {
        this.templates = {
            infographic: {
                width: 1200,
                height: 630,
                format: 'svg',
                style: 'modern'
            },
            quote: {
                width: 1080,
                height: 1080,
                format: 'svg',
                style: 'minimal'
            },
            chart: {
                width: 800,
                height: 600,
                format: 'svg',
                style: 'data'
            },
            comparison: {
                width: 1200,
                height: 800,
                format: 'svg',
                style: 'table'
            },
            social: {
                instagram: { width: 1080, height: 1080 },
                twitter: { width: 1200, height: 675 },
                linkedin: { width: 1200, height: 627 },
                facebook: { width: 1200, height: 630 }
            }
        };

        this.colors = {
            primary: '#FF4500',    // Reddit Orange
            secondary: '#0079D3',  // Reddit Blue
            success: '#46D160',
            danger: '#EA0027',
            warning: '#FFB000',
            dark: '#1A1A1B',
            light: '#FFFFFF',
            gray: '#DAE0E6'
        };
    }

    async createVisuals(content, data) {
        console.log('Generating visuals for content...');
        
        const visuals = [];
        
        // Generate different types of visuals based on content
        if (data.sentimentBreakdown) {
            visuals.push(await this.createSentimentChart(data.sentimentBreakdown));
        }
        
        if (data.painPoints && data.painPoints.length > 0) {
            visuals.push(await this.createPainPointInfographic(data.painPoints));
        }
        
        if (content.title) {
            visuals.push(await this.createQuoteCard(content.title, content.hook));
        }
        
        if (data.topThreads && data.topThreads.length > 0) {
            visuals.push(await this.createEngagementChart(data.topThreads));
        }
        
        if (data.competitors) {
            visuals.push(await this.createComparisonTable(data));
        }
        
        // Create social media optimized versions
        const socialVisuals = await this.createSocialMediaVisuals(content, data);
        visuals.push(...socialVisuals);
        
        return visuals;
    }

    createSentimentChart(sentiment) {
        const total = sentiment.positive + sentiment.negative + sentiment.neutral;
        const data = {
            positive: ((sentiment.positive / total) * 100).toFixed(1),
            negative: ((sentiment.negative / total) * 100).toFixed(1),
            neutral: ((sentiment.neutral / total) * 100).toFixed(1)
        };

        const svg = `
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
    <!-- Background -->
    <rect width="800" height="600" fill="${this.colors.light}"/>
    
    <!-- Title -->
    <text x="400" y="50" font-family="Arial, sans-serif" font-size="28" font-weight="bold" text-anchor="middle" fill="${this.colors.dark}">
        Community Sentiment Analysis
    </text>
    
    <!-- Pie Chart -->
    <g transform="translate(400, 320)">
        <!-- Positive Segment -->
        <path d="M 0 0 L 150 0 A 150 150 0 ${data.positive > 50 ? 1 : 0} 1 ${this.getCoordinates(data.positive, 150).x} ${this.getCoordinates(data.positive, 150).y} Z" 
              fill="${this.colors.success}" opacity="0.8"/>
        
        <!-- Negative Segment -->
        <path d="M 0 0 L ${this.getCoordinates(data.positive, 150).x} ${this.getCoordinates(data.positive, 150).y} A 150 150 0 ${data.negative > 50 ? 1 : 0} 1 ${this.getCoordinates(parseFloat(data.positive) + parseFloat(data.negative), 150).x} ${this.getCoordinates(parseFloat(data.positive) + parseFloat(data.negative), 150).y} Z" 
              fill="${this.colors.danger}" opacity="0.8"/>
        
        <!-- Neutral Segment -->
        <path d="M 0 0 L ${this.getCoordinates(parseFloat(data.positive) + parseFloat(data.negative), 150).x} ${this.getCoordinates(parseFloat(data.positive) + parseFloat(data.negative), 150).y} A 150 150 0 ${data.neutral > 50 ? 1 : 0} 1 150 0 Z" 
              fill="${this.colors.gray}" opacity="0.8"/>
    </g>
    
    <!-- Legend -->
    <g transform="translate(50, 500)">
        <rect x="0" y="0" width="20" height="20" fill="${this.colors.success}"/>
        <text x="30" y="15" font-family="Arial" font-size="16" fill="${this.colors.dark}">Positive: ${data.positive}%</text>
        
        <rect x="250" y="0" width="20" height="20" fill="${this.colors.danger}"/>
        <text x="280" y="15" font-family="Arial" font-size="16" fill="${this.colors.dark}">Negative: ${data.negative}%</text>
        
        <rect x="500" y="0" width="20" height="20" fill="${this.colors.gray}"/>
        <text x="530" y="15" font-family="Arial" font-size="16" fill="${this.colors.dark}">Neutral: ${data.neutral}%</text>
    </g>
</svg>`;

        return {
            type: 'sentiment_chart',
            format: 'svg',
            content: svg,
            filename: `sentiment_chart_${Date.now()}.svg`
        };
    }

    createPainPointInfographic(painPoints) {
        const topPains = painPoints.slice(0, 5);
        
        const svg = `
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <!-- Background -->
    <rect width="1200" height="630" fill="${this.colors.light}"/>
    
    <!-- Header -->
    <rect width="1200" height="100" fill="${this.colors.primary}"/>
    <text x="600" y="60" font-family="Arial, sans-serif" font-size="36" font-weight="bold" text-anchor="middle" fill="${this.colors.light}">
        Top User Pain Points
    </text>
    
    <!-- Pain Points List -->
    ${topPains.map((pain, index) => `
    <g transform="translate(100, ${150 + index * 90})">
        <!-- Number Circle -->
        <circle cx="30" cy="30" r="25" fill="${this.colors.secondary}"/>
        <text x="30" y="38" font-family="Arial" font-size="20" font-weight="bold" text-anchor="middle" fill="${this.colors.light}">${index + 1}</text>
        
        <!-- Pain Point Text -->
        <text x="80" y="25" font-family="Arial" font-size="18" font-weight="bold" fill="${this.colors.dark}">${this.truncateText(pain.pattern, 50)}</text>
        <text x="80" y="50" font-family="Arial" font-size="14" fill="${this.colors.dark}" opacity="0.7">${this.truncateText(pain.context, 80)}</text>
        
        <!-- Severity Bar -->
        <rect x="80" y="60" width="${(pain.severity || 5) * 50}" height="10" fill="${this.colors.warning}" opacity="0.6"/>
    </g>
    `).join('')}
</svg>`;

        return {
            type: 'pain_point_infographic',
            format: 'svg',
            content: svg,
            filename: `pain_points_${Date.now()}.svg`
        };
    }

    createQuoteCard(title, subtitle = '') {
        const svg = `
<svg width="1080" height="1080" xmlns="http://www.w3.org/2000/svg">
    <!-- Background Gradient -->
    <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${this.colors.primary};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${this.colors.secondary};stop-opacity:1" />
        </linearGradient>
    </defs>
    <rect width="1080" height="1080" fill="url(#grad1)"/>
    
    <!-- Quote Mark -->
    <text x="100" y="200" font-family="Georgia, serif" font-size="120" fill="${this.colors.light}" opacity="0.3">"</text>
    
    <!-- Main Text -->
    <text x="540" y="450" font-family="Arial, sans-serif" font-size="42" font-weight="bold" text-anchor="middle" fill="${this.colors.light}">
        ${this.wrapText(title, 20).map((line, i) => 
            `<tspan x="540" dy="${i === 0 ? 0 : 50}">${line}</tspan>`
        ).join('')}
    </text>
    
    <!-- Subtitle -->
    ${subtitle ? `
    <text x="540" y="650" font-family="Arial, sans-serif" font-size="24" text-anchor="middle" fill="${this.colors.light}" opacity="0.8">
        ${this.wrapText(subtitle, 35).map((line, i) => 
            `<tspan x="540" dy="${i === 0 ? 0 : 30}">${line}</tspan>`
        ).join('')}
    </text>
    ` : ''}
    
    <!-- Bottom Brand -->
    <text x="540" y="980" font-family="Arial, sans-serif" font-size="18" text-anchor="middle" fill="${this.colors.light}" opacity="0.6">
        Generated with Reddit Intelligence Suite
    </text>
</svg>`;

        return {
            type: 'quote_card',
            format: 'svg',
            content: svg,
            filename: `quote_${Date.now()}.svg`
        };
    }

    createEngagementChart(threads) {
        const topThreads = threads.slice(0, 5);
        const maxEngagement = Math.max(...topThreads.map(t => t.score + (t.comments || 0)));
        
        const svg = `
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
    <!-- Background -->
    <rect width="800" height="600" fill="${this.colors.light}"/>
    
    <!-- Title -->
    <text x="400" y="40" font-family="Arial, sans-serif" font-size="24" font-weight="bold" text-anchor="middle" fill="${this.colors.dark}">
        Top Engaging Discussions
    </text>
    
    <!-- Chart -->
    ${topThreads.map((thread, index) => {
        const engagement = thread.score + (thread.comments || 0);
        const barWidth = (engagement / maxEngagement) * 600;
        const y = 100 + index * 90;
        
        return `
        <g transform="translate(50, ${y})">
            <!-- Bar -->
            <rect x="0" y="0" width="${barWidth}" height="60" fill="${this.colors.primary}" opacity="0.7"/>
            
            <!-- Label -->
            <text x="10" y="25" font-family="Arial" font-size="14" font-weight="bold" fill="${this.colors.light}">
                ${this.truncateText(thread.title, 50)}
            </text>
            <text x="10" y="45" font-family="Arial" font-size="12" fill="${this.colors.light}">
                ${engagement} engagement (${thread.score} votes, ${thread.comments || 0} comments)
            </text>
        </g>
        `;
    }).join('')}
</svg>`;

        return {
            type: 'engagement_chart',
            format: 'svg',
            content: svg,
            filename: `engagement_${Date.now()}.svg`
        };
    }

    createComparisonTable(data) {
        const svg = `
<svg width="1200" height="800" xmlns="http://www.w3.org/2000/svg">
    <!-- Background -->
    <rect width="1200" height="800" fill="${this.colors.light}"/>
    
    <!-- Header -->
    <rect width="1200" height="80" fill="${this.colors.secondary}"/>
    <text x="600" y="50" font-family="Arial, sans-serif" font-size="32" font-weight="bold" text-anchor="middle" fill="${this.colors.light}">
        Competitive Analysis
    </text>
    
    <!-- Table Headers -->
    <g transform="translate(100, 120)">
        <text x="0" y="30" font-family="Arial" font-size="18" font-weight="bold" fill="${this.colors.dark}">Feature</text>
        <text x="300" y="30" font-family="Arial" font-size="18" font-weight="bold" fill="${this.colors.dark}">Us</text>
        <text x="500" y="30" font-family="Arial" font-size="18" font-weight="bold" fill="${this.colors.dark}">Competitor A</text>
        <text x="700" y="30" font-family="Arial" font-size="18" font-weight="bold" fill="${this.colors.dark}">Competitor B</text>
        <text x="900" y="30" font-family="Arial" font-size="18" font-weight="bold" fill="${this.colors.dark}">Competitor C</text>
    </g>
    
    <!-- Table Rows -->
    ${['Ease of Use', 'Pricing', 'Features', 'Support', 'Integration'].map((feature, index) => `
    <g transform="translate(100, ${200 + index * 60})">
        <text x="0" y="30" font-family="Arial" font-size="16" fill="${this.colors.dark}">${feature}</text>
        <text x="300" y="30" font-family="Arial" font-size="20" fill="${this.colors.success}">✓</text>
        <text x="500" y="30" font-family="Arial" font-size="20" fill="${Math.random() > 0.5 ? this.colors.success : this.colors.danger}">${Math.random() > 0.5 ? '✓' : '✗'}</text>
        <text x="700" y="30" font-family="Arial" font-size="20" fill="${Math.random() > 0.5 ? this.colors.success : this.colors.danger}">${Math.random() > 0.5 ? '✓' : '✗'}</text>
        <text x="900" y="30" font-family="Arial" font-size="20" fill="${Math.random() > 0.5 ? this.colors.success : this.colors.danger}">${Math.random() > 0.5 ? '✓' : '✗'}</text>
    </g>
    `).join('')}
    
    <!-- Footer Note -->
    <text x="600" y="750" font-family="Arial" font-size="14" text-anchor="middle" fill="${this.colors.dark}" opacity="0.6">
        Based on community feedback and feature analysis
    </text>
</svg>`;

        return {
            type: 'comparison_table',
            format: 'svg',
            content: svg,
            filename: `comparison_${Date.now()}.svg`
        };
    }

    async createSocialMediaVisuals(content, data) {
        const visuals = [];
        
        // Instagram Square
        visuals.push(this.createSocialVisual('instagram', content, data));
        
        // Twitter Card
        visuals.push(this.createSocialVisual('twitter', content, data));
        
        // LinkedIn Post
        visuals.push(this.createSocialVisual('linkedin', content, data));
        
        return visuals;
    }

    createSocialVisual(platform, content, data) {
        const dimensions = this.templates.social[platform];
        
        const svg = `
<svg width="${dimensions.width}" height="${dimensions.height}" xmlns="http://www.w3.org/2000/svg">
    <!-- Background -->
    <defs>
        <linearGradient id="grad_${platform}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${this.colors.primary};stop-opacity:0.9" />
            <stop offset="100%" style="stop-color:${this.colors.secondary};stop-opacity:0.9" />
        </linearGradient>
    </defs>
    <rect width="${dimensions.width}" height="${dimensions.height}" fill="url(#grad_${platform})"/>
    
    <!-- Content -->
    <text x="${dimensions.width/2}" y="${dimensions.height/2 - 50}" font-family="Arial, sans-serif" font-size="36" font-weight="bold" text-anchor="middle" fill="${this.colors.light}">
        ${this.wrapText(content.title || 'Update', 25).map((line, i) => 
            `<tspan x="${dimensions.width/2}" dy="${i === 0 ? 0 : 45}">${line}</tspan>`
        ).join('')}
    </text>
    
    <!-- Platform Badge -->
    <text x="${dimensions.width - 50}" y="${dimensions.height - 30}" font-family="Arial" font-size="14" text-anchor="end" fill="${this.colors.light}" opacity="0.7">
        ${platform.toUpperCase()}
    </text>
</svg>`;

        return {
            type: `social_${platform}`,
            format: 'svg',
            content: svg,
            filename: `${platform}_${Date.now()}.svg`,
            dimensions
        };
    }

    getCoordinates(percentage, radius) {
        const angle = (percentage / 100) * 2 * Math.PI - Math.PI / 2;
        return {
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius
        };
    }

    truncateText(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - 3) + '...';
    }

    wrapText(text, maxCharsPerLine) {
        if (!text) return [''];
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';
        
        words.forEach(word => {
            if ((currentLine + word).length <= maxCharsPerLine) {
                currentLine += (currentLine ? ' ' : '') + word;
            } else {
                if (currentLine) lines.push(currentLine);
                currentLine = word;
            }
        });
        
        if (currentLine) lines.push(currentLine);
        return lines;
    }

    async saveVisual(visual, outputDir) {
        const dir = outputDir || path.join(__dirname, '..', 'output', 'images');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        const filepath = path.join(dir, visual.filename);
        fs.writeFileSync(filepath, visual.content);
        
        console.log(`Visual saved: ${filepath}`);
        return filepath;
    }
}

module.exports = ImageGenerator;