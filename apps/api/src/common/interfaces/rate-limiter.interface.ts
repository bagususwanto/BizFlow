export interface RateLimiter {
  check(key: string, limit: number, windowMs: number): Promise<boolean>;
  reset(key: string): Promise<void>;
}

export const RATE_LIMITER = 'RATE_LIMITER';
