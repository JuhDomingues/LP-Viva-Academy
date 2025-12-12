import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = {
  runtime: 'nodejs',
  maxDuration: 10,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow in development or with special header for security
  const debugKey = req.headers['x-debug-key'];
  if (process.env.NODE_ENV === 'production' && debugKey !== process.env.DEBUG_KEY) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    // Check which environment variables are available
    const envVars = {
      hasPostgresConnectionString: !!process.env.POSTGRES_CONNECTION_STRING,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      hasPostgresUrl: !!process.env.POSTGRES_URL,
      hasPostgresUrlNonPooling: !!process.env.POSTGRES_URL_NON_POOLING,
    };

    // Show last part of URLs (without password) for debugging
    const getUrlInfo = (url: string | undefined) => {
      if (!url) return null;
      try {
        const parsed = new URL(url);
        return {
          host: parsed.host,
          port: parsed.port,
          database: parsed.pathname,
          params: parsed.search,
        };
      } catch {
        return 'invalid_url';
      }
    };

    const urlInfo = {
      postgresConnectionString: getUrlInfo(process.env.POSTGRES_CONNECTION_STRING),
      databaseUrl: getUrlInfo(process.env.DATABASE_URL),
      postgresUrl: getUrlInfo(process.env.POSTGRES_URL),
      postgresUrlNonPooling: getUrlInfo(process.env.POSTGRES_URL_NON_POOLING),
    };

    // Which one would be used
    const usedVar = process.env.POSTGRES_CONNECTION_STRING
      ? 'POSTGRES_CONNECTION_STRING'
      : process.env.DATABASE_URL
      ? 'DATABASE_URL'
      : 'POSTGRES_URL';

    return res.status(200).json({
      envVars,
      urlInfo,
      usedVar,
      nodeEnv: process.env.NODE_ENV,
    });
  } catch (error: any) {
    return res.status(500).json({
      error: 'Debug failed',
      message: error.message,
    });
  }
}
