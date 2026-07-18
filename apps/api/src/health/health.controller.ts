import { Controller, Get } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

interface HealthReport {
  status: 'ok' | 'degraded';
  uptime: number;
  timestamp: string;
  checks: Record<string, 'up' | 'down'>;
}

@Controller({ path: 'health', version: '1' })
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  /** Liveness probe — process is running. */
  @Get('live')
  live(): { status: 'ok' } {
    return { status: 'ok' };
  }

  /** Readiness probe — dependencies are reachable. */
  @Get('ready')
  async ready(): Promise<HealthReport> {
    const checks: Record<string, 'up' | 'down'> = { database: 'down', redis: 'down' };

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      checks.database = 'up';
    } catch {
      checks.database = 'down';
    }

    try {
      const pong = await this.redis.client.ping();
      checks.redis = pong === 'PONG' ? 'up' : 'down';
    } catch {
      checks.redis = 'down';
    }

    const healthy = Object.values(checks).every((c) => c === 'up');
    return {
      status: healthy ? 'ok' : 'degraded',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      checks,
    };
  }
}
