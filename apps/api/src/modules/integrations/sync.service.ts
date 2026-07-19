import type { IntegrationConnection } from '@invincible/database';
import { isCalendarProvider } from '@invincible/integrations';
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

const SYNC_LOCK = 'integrations:background:sync';
const BATCH_SIZE = 10;

/**
 * Background sync worker. For calendar connections that expose incremental
 * `sync()`, it pulls remote changes using the persisted sync cursor and
 * advances it — keeping availability fresh without polling on the hot path.
 */
@Injectable()
export class SyncService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SyncService.name);
  private timer: NodeJS.Timeout | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly config: AppConfigService,
    private readonly orchestrator: IntegrationOrchestrator,
  ) {}

  onModuleInit(): void {
    if (!this.config.get('INTEGRATIONS_BACKGROUND_JOBS')) return;
    const interval = this.config.get('INTEGRATIONS_SYNC_INTERVAL_MS');
    this.timer = setInterval(() => {
      void this.tick();
    }, interval);
    this.timer.unref?.();
    this.logger.log(`Background sync started (every ${interval}ms).`);
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  /** Sync a batch of calendar connections due for a refresh. */
  async tick(): Promise<number> {
    const release = await this.redis.acquireLock(SYNC_LOCK, 120_000);
    if (!release) return 0;
    try {
      const staleBefore = new Date(Date.now() - this.config.get('INTEGRATIONS_SYNC_INTERVAL_MS'));
      const due = await this.prisma.integrationConnection.findMany({
        where: {
          category: 'CALENDAR',
          status: 'ACTIVE',
          OR: [{ lastSyncedAt: null }, { lastSyncedAt: { lt: staleBefore } }],
        },
        orderBy: { lastSyncedAt: { sort: 'asc', nulls: 'first' } },
        take: BATCH_SIZE,
      });

      let synced = 0;
      for (const connection of due) {
        if (await this.syncOne(connection)) synced += 1;
      }
      return synced;
    } finally {
      await release();
    }
  }

  private async syncOne(connection: IntegrationConnection): Promise<boolean> {
    try {
      const result = await this.orchestrator.run(
        connection,
        { action: 'sync', direction: 'INTERNAL' },
        async (provider, ctx) => {
          if (!isCalendarProvider(provider) || !provider.sync) return null;
          return provider.sync(ctx, connection.syncCursor ?? undefined);
        },
      );
      await this.prisma.integrationConnection.update({
        where: { id: connection.id },
        data: {
          lastSyncedAt: new Date(),
          ...(result?.cursor ? { syncCursor: result.cursor } : {}),
        },
      });
      return true;
    } catch (error) {
      this.logger.warn(`Sync failed for ${connection.id}: ${(error as Error).message}`);
      return false;
    }
  }
}
