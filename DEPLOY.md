# Deployment Instructions for Reddit Intelligence Suite

## Prerequisites
1. Node.js 14+ installed
2. Vercel CLI installed (`npm i -g vercel`)
3. RapidAPI key for Reddit34 API

## Setup Steps

### 1. Configure Environment Variables
1. Copy `.env.sample` to `.env`:
   ```bash
   cp .env.sample .env
   ```
2. Edit `.env` and add your RapidAPI key:
   ```
   RAPIDAPI_KEY=your_actual_rapidapi_key_here
   ```

### 2. Install Vercel CLI (if not already installed)
```bash
npm install -g vercel
```

### 3. Deploy to Vercel

#### Option A: Deploy via CLI
1. Run the deployment command:
   ```bash
   vercel
   ```
2. Follow the prompts:
   - Confirm the project settings
   - Choose project name
   - Select the directory (current directory)

3. Set up environment variables in Vercel:
   ```bash
   vercel env add RAPIDAPI_KEY
   ```
   Enter your RapidAPI key when prompted.

4. Deploy to production:
   ```bash
   vercel --prod
   ```

#### Option B: Deploy via GitHub
1. Push your code to GitHub
2. Import the project on [vercel.com](https://vercel.com)
3. Add environment variable `RAPIDAPI_KEY` in project settings
4. Deploy

## Project Structure
```
reddit-intelligence-suite/
├── api/                 # Serverless API endpoints
│   ├── analyze.js      # Keyword analysis endpoint
│   └── brand.js        # Brand monitoring endpoint
├── modules/            # Core functionality modules
├── public/             # Static frontend files
│   └── index.html      # Web dashboard
├── data/               # Data storage directory
├── vercel.json         # Vercel configuration
├── package.json        # Project dependencies
└── .env.sample         # Environment variables template
```

## Available Endpoints
- `GET /` - Web dashboard
- `POST /api/analyze` - Keyword analysis
- `POST /api/brand` - Brand monitoring

## API Usage Examples

### Keyword Analysis
```javascript
fetch('https://your-app.vercel.app/api/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    keyword: 'roofing',
    limit: 50
  })
})
```

### Brand Monitoring
```javascript
fetch('https://your-app.vercel.app/api/brand', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    brandName: 'YourBrand',
    domain: 'yourdomain.com'
  })
})
```

## Local Development
1. Install dependencies (if any):
   ```bash
   npm install
   ```

2. Run locally with Vercel dev:
   ```bash
   npm run dev
   ```

3. Or run the Node.js server directly:
   ```bash
   npm start
   ```

## Troubleshooting

### API Key Issues
- Ensure your RapidAPI key is valid
- Check that the environment variable is set correctly in Vercel
- Verify the key has access to Reddit34 API

### Deployment Errors
- Check `vercel.json` configuration
- Ensure all required files are present
- Review Vercel deployment logs

### No Results Found
- The Reddit34 API may have rate limits
- Try different, more common keywords
- Check API response in browser developer tools

## Support
For issues or questions, please check:
- Vercel documentation: https://vercel.com/docs
- RapidAPI Reddit34: https://rapidapi.com/reddit34/api/reddit34