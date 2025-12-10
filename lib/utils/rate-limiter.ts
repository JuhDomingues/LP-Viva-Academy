import { kv } from '@vercel/kv';

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter?: number;
}

export async function rateLimit(identifier: string, max: number = 20, windowMs: number = 60000): Promise<RateLimitResult> {
  const key = `rate_limit:${identifier}`;
  const now = Date.now();
  const windowStart = now - windowMs;

  try {
    // Get current count
    const data = await kv.get<{ count: number; resetAt: number }>(key);

    if (!data) {
      // First request, initialize
      await kv.set(key, { count: 1, resetAt: now + windowMs }, { px: windowMs });
      return {
        allowed: true,
        remaining: max - 1,
      };
    }

    // Check if window has expired
    if (now > data.resetAt) {
      // Reset window
      await kv.set(key, { count: 1, resetAt: now + windowMs }, { px: windowMs });
      return {
        allowed: true,
        remaining: max - 1,
      };
    }

    // Check if limit exceeded
    if (data.count >= max) {
      const retryAfter = Math.ceil((data.resetAt - now) / 1000);
      return {
        allowed: false,
        remaining: 0,
        retryAfter,
      };
    }

    // Increment count
    await kv.set(key, { count: data.count + 1, resetAt: data.resetAt }, { px: data.resetAt - now });

    return {
      allowed: true,
      remaining: max - data.count - 1,
    };
  } catch (error) {
    console.error('Rate limiter error:', error);
    // On error, allow the request (fail open)
    return {
      allowed: true,
      remaining: max,
    };
  }
}

// Specific rate limiters
export async function rateLimitWeb(ip: string): Promise<RateLimitResult> {
  const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '20');
  const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000');
  return rateLimit(`web:${ip}`, maxRequests, windowMs);
}

export async function rateLimitWhatsApp(phoneNumber: string): Promise<RateLimitResult> {
  // WhatsApp users get higher limit
  return rateLimit(`whatsapp:${phoneNumber}`, 50, 60000);
}
