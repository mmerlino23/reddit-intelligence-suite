// Direct test of Reddit API from Vercel
module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    const keyword = req.query.q || 'roofing';
    
    try {
        // Try using fetch which might work differently on Vercel
        const response = await fetch(`https://www.reddit.com/search.json?q=${keyword}&limit=10`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            return res.status(200).json({
                error: 'Reddit blocked',
                status: response.status,
                statusText: response.statusText
            });
        }
        
        const data = await response.json();
        const posts = data?.data?.children || [];
        
        res.status(200).json({
            success: true,
            keyword: keyword,
            found: posts.length,
            titles: posts.slice(0, 3).map(p => p.data.title)
        });
    } catch (error) {
        res.status(200).json({
            error: error.message,
            keyword: keyword
        });
    }
};