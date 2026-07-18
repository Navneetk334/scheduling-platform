import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { Redis } from 'ioredis';

import { AppConfigService } from '../config/app-config.service';

/**
 * Wraps a single shared ioredis connection. Used for caching, rate limiting,
 * and (later) BullMQ job queues. Distributed locks for booking concurrency
 * are also acquired here.
 */
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  readonly client: Redis;

  constructor(private readonly config: AppConfigService) {
    this.client = new Redis(this.config.get('REDIS_URL'), {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      enableReadyCheck: true,
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.client.connect();
      this.logger.log('Redis connected.');
    } catch (error) {
      this.logger.error('Redis connection failed.', error as Error);
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit();
  }

  /**
   * Best-effort distributed lock (SET NX PX). Returns a release function, or
   * null if the lock is already held. Used to serialize concurrent booking
   * attempts for the same slot.
   */
  async acquireLock(key: string, ttlMs = 10_000): Promise<(() => Promise<void>) | null> {
    const token = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const result = await this.client.set(key, token, 'PX', ttlMs, 'NX');
    if (result !== 'OK') return null;

    return async () => {
      // Release only if we still own the lock (compare-and-delete).
      const lua =
        "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end";
      await this.client.eval(lua, 1, key, token);
    };
  }
}
