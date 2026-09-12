interface RateLimitOptions {
  limit: number; // max requests
  windowMs: number; // sliding window duration in ms
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetMs: number;
}

// In-memory sliding-window store (§12 & §15)
const requestStore = new Map<string, number[]>();

/**
 * Sliding-window rate limiter per §12 of the EMBERKEEP Blueprint.
 * Default: 10 mutating requests per 10 seconds per user.
 */
export function checkRateLimit(
  key: string,
  options: RateLimitOptions = { limit: 10, windowMs: 10_000 }
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - options.windowMs;

  let timestamps = requestStore.get(key) || [];

  // Remove timestamps outside the current sliding window
  timestamps = timestamps.filter((t) => t > windowStart);

  if (timestamps.length >= options.limit) {
    const oldestTimestamp = timestamps[0];
    const resetMs = Math.max(0, oldestTimestamp + options.windowMs - now);

    return {
      success: false,
      limit: options.limit,
      remaining: 0,
      resetMs,
    };
  }

  // Record this valid request
  timestamps.push(now);
  requestStore.set(key, timestamps);

  // Periodic memory sweep
  if (requestStore.size > 10_000) {
    for (const [k, ts] of requestStore.entries()) {
      if (ts.length === 0 || ts[ts.length - 1] <= windowStart) {
        requestStore.delete(k);
      }
    }
  }

  return {
    success: true,
    limit: options.limit,
    remaining: options.limit - timestamps.length,
    resetMs: options.windowMs,
  };
}
