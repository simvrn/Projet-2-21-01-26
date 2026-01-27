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

  const { symbol, symbols } = req.query;

  try {
    // Multiple symbols (comma-separated or array)
    if (symbols) {
      const symbolList = Array.isArray(symbols)
        ? symbols
        : (symbols as string).split(',').map(s => s.trim());

      const results: Record<string, { price: number; currency: string; change: number; changePercent: number } | null> = {};

      await Promise.all(
        symbolList.map(async (sym) => {
          try {
            const quote = await yahooFinance.quote(sym);
            if (quote && quote.regularMarketPrice) {
              results[sym] = {
                price: quote.regularMarketPrice,
                currency: quote.currency || 'USD',
                change: quote.regularMarketChange || 0,
                changePercent: quote.regularMarketChangePercent || 0,
              };
            } else {
              results[sym] = null;
            }
          } catch {
            results[sym] = null;
          }
        })
      );

      return res.status(200).json({ success: true, data: results });
    }

    // Single symbol
    if (symbol && typeof symbol === 'string') {
      const quote = await yahooFinance.quote(symbol);

      if (!quote || !quote.regularMarketPrice) {
        return res.status(404).json({
          success: false,
          error: `No data found for symbol: ${symbol}`
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          symbol: quote.symbol,
          price: quote.regularMarketPrice,
          currency: quote.currency || 'USD',
          change: quote.regularMarketChange || 0,
          changePercent: quote.regularMarketChangePercent || 0,
          previousClose: quote.regularMarketPreviousClose,
          open: quote.regularMarketOpen,
          dayHigh: quote.regularMarketDayHigh,
          dayLow: quote.regularMarketDayLow,
          volume: quote.regularMarketVolume,
          marketCap: quote.marketCap,
          name: quote.shortName || quote.longName,
        },
      });
    }

    return res.status(400).json({
      success: false,
      error: 'Missing symbol or symbols parameter'
    });

  } catch (error) {
    console.error('Yahoo Finance API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch stock price'
    });
  }
}
