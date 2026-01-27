import type { VercelRequest, VercelResponse } from '@vercel/node';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query } = req.query;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ success: false, error: 'Missing query parameter' });
  }

  try {
    const results = await yahooFinance.search(query);

    const stocks = results.quotes
      .filter((q: { quoteType?: string }) => q.quoteType === 'EQUITY')
      .slice(0, 10)
      .map((q: { symbol: string; shortname?: string; longname?: string; exchange?: string }) => ({
        symbol: q.symbol,
        name: q.shortname || q.longname || q.symbol,
        exchange: q.exchange,
      }));

    return res.json({ success: true, data: stocks });
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ success: false, error: 'Search failed' });
  }
}
