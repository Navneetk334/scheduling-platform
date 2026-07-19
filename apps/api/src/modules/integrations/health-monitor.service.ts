import {
  Injectable,
  Logger,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common';

import { AppConfigService } from '../../config/app-config.service';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';

import { IntegrationOrchestrator } from './integration-orchestrator.service';

const HEALTH_LOCK = 'integrations:health:monitor';
const BATCH_SIZE = 20;

/**
 * Periodically probes connections that have not been checked recently and
 * rolls up their health status. Also runs opportunistically whenever a
 * connection is used (see {@link IntegrationOrchestrator}).
 */
@Injectable()
export class HealthMonitorService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(HealthMonitorService.name);
  private timer: NodeJS.Timeout | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly config: AppConfigService,
    private readonly orchestrator: IntegrationOrchestrator,
  ) {}

  onModuleInit(): void {
    if (!this.config.get('INTEGRATIONS_BACKGROUND_JOBS')) return;
    const interval = this.config.get('INTEGRATIONS_HEALTH_INTERVAL_MS');
    this.timer = setInterval(() => {
      void this.tick();
    }, interval);
    this.timer.unref?.();
    this.logger.log(`Health monitor started (every ${interval}ms).`);
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  /** Probe a batch of connections that are due for a health check. */
  async tick(): Promise<number> {
    const release = await this.redis.acquireLock(HEALTH_LOCK, 60_000);
    if (!release) return 0;
    try {
      const staleBefore = new Date(Date.now() - this.config.get('INTEGRATIONS_HEALTH_INTERVAL_MS'));
      const due = await this.prisma.integrationConnection.findMany({
        where: {
          status: { in: ['ACTIVE', 'ERROR', 'EXPIRED'] },
          OR: [{ lastHealthCheckAt: null }, { lastHealthCheckAt: { lt: staleBefore } }],
        },
        orderBy: { lastHealthCheckAt: { sort: 'asc', nulls: 'first' } },
        take: BATCH_SIZE,
      });

      for (const connection of due) {
        await this.orchestrator.checkHealth(connection).catch((error: unknown) => {
          this.logger.warn(`Health check failed for ${connection.id}: ${(error as Error).message}`);
        });
      }
      return due.length;
    } finally {
      await release();
    }
  }
}
