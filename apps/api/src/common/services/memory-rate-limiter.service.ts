import { Injectable } from '@nestjs/common';
import type { RateLimiter } from '../interfaces/rate-limiter.interface';

@Injectable()
export class MemoryRateLimiterService implements RateLimiter {
  private requestCounts = new Map<
    string,
    { count: number; timestamp: number }
  >();

  async check(key: string, limit: number, windowMs: number): Promise<boolean> {
    const record = this.requestCounts.get(key);
    const now = Date.now();

    if (!record) {
      this.requestCounts.set(key, { count: 1, timestamp: now });
      return true;
    }

    if (now - record.timestamp > windowMs) {
      // Reset if window passed
      this.requestCounts.set(key, { count: 1, timestamp: now });
      return true;
    }

    if (record.count >= limit) {
      return false;
    }

    record.count++;
    this.requestCounts.set(key, record);
    return true;
  }

  async reset(key: string): Promise<void> {
    this.requestCounts.delete(key);
  }
}
