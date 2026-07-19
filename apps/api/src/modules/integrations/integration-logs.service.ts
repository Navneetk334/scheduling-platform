import type {
  IntegrationCategory,
  IntegrationLogDirection,
  IntegrationLogStatus,
  Prisma,
} from '@invincible/database';
import { Injectable, Logger } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

export interface RecordLogInput {
  organizationId: string;
  connectionId?: string | null;
  provider: string;
  category: IntegrationCategory;
  direction: IntegrationLogDirection;
  action: string;
  status: IntegrationLogStatus;
  httpStatus?: number | null;
  durationMs?: number | null;
  attempt?: number;
  requestSummary?: Prisma.InputJsonValue;
  responseSummary?: Prisma.InputJsonValue;
  error?: string | null;
}

/**
 * Append-only writer + reader for the integration audit trail. Writes are
 * best-effort: a logging failure must never break the underlying operation.
 */
@Injectable()
export class IntegrationLogsService {
  private readonly logger = new Logger(IntegrationLogsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async record(input: RecordLogInput): Promise<void> {
    try {
      await this.prisma.integrationLog.create({
        data: {
          organizationId: input.organizationId,
          connectionId: input.connectionId ?? null,
          provider: input.provider,
          category: input.category,
          direction: input.direction,
          action: input.action,
          status: input.status,
          httpStatus: input.httpStatus ?? null,
          durationMs: input.durationMs ?? null,
          attempt: input.attempt ?? 1,
          ...(input.requestSummary !== undefined ? { requestSummary: input.requestSummary } : {}),
          ...(input.responseSummary !== undefined
            ? { responseSummary: input.responseSummary }
            : {}),
          error: input.error ?? null,
        },
      });
    } catch (error) {
      this.logger.warn(`Failed to write integration log: ${(error as Error).message}`);
    }
  }

  list(
    organizationId: string,
    filter: {
      connectionId?: string;
      provider?: string;
      status?: IntegrationLogStatus;
      limit?: number;
    } = {},
  ) {
    return this.prisma.integrationLog.findMany({
      where: {
        organizationId,
        ...(filter.connectionId ? { connectionId: filter.connectionId } : {}),
        ...(filter.provider ? { provider: filter.provider } : {}),
        ...(filter.status ? { status: filter.status } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: filter.limit ?? 50,
    });
  }
}
