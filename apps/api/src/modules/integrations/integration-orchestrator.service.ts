import type { IntegrationConnection, IntegrationLogDirection } from '@invincible/database';
import {
  isCalendarProvider,
  isCrmProvider,
  isEmailProvider,
  isMessagingProvider,
  isPaymentProvider,
  isSmsProvider,
  isVideoProvider,
  isAutomationProvider,
  isIntegrationError,
  IntegrationErrorKind,
  type BaseProvider,
  type CalendarProvider,
  type CrmProvider,
  type EmailProvider,
  type MessagingProvider,
  type PaymentProvider,
  type ProviderRegistry,
  type ProviderRuntimeContext,
  type SmsProvider,
  type VideoProvider,
  type AutomationProvider,
} from '@invincible/integrations';
import { AppError, ErrorCode } from '@invincible/utils';
import { Inject, Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import { IntegrationLogsService } from './integration-logs.service';
import { PROVIDER_REGISTRY } from './integrations.constants';
import { ProviderContextService } from './provider-context.service';

interface RunOptions {
  readonly action: string;
  readonly direction?: IntegrationLogDirection;
}

/**
 * The single execution path for provider operations. It resolves a runtime
 * context (decrypt + refresh), runs the operation, records an audit log entry,
 * and reconciles the connection's status/health on success or failure. The
 * underlying HTTP retry/backoff lives in the provider HTTP client.
 */
@Injectable()
export class IntegrationOrchestrator {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logs: IntegrationLogsService,
    private readonly context: ProviderContextService,
    @Inject(PROVIDER_REGISTRY) private readonly registry: ProviderRegistry,
  ) {}

  /** Execute an operation against a connection with full logging + recovery. */
  async run<T>(
    connection: IntegrationConnection,
    options: RunOptions,
    fn: (provider: BaseProvider, ctx: ProviderRuntimeContext) => Promise<T>,
  ): Promise<T> {
    const provider = this.registry.get(connection.provider);
    const startedAt = Date.now();

    try {
      const ctx = await this.context.build(connection);
      const result = await fn(provider, ctx);

      await Promise.all([
        this.logs.record({
          organizationId: connection.organizationId,
          connectionId: connection.id,
          provider: connection.provider,
          category: connection.category,
          direction: options.direction ?? 'OUTBOUND',
          action: options.action,
          status: 'SUCCESS',
          durationMs: Date.now() - startedAt,
        }),
        this.markHealthy(connection),
      ]);
      return result;
    } catch (error) {
      await this.handleFailure(connection, options, startedAt, error);
      throw this.toAppError(error);
    }
  }

  // --- Capability-narrowing helpers ----------------------------------------

  runCalendar<T>(
    connection: IntegrationConnection,
    action: string,
    fn: (p: CalendarProvider, ctx: ProviderRuntimeContext) => Promise<T>,
  ): Promise<T> {
    return this.run(connection, { action }, (provider, ctx) => {
      if (!isCalendarProvider(provider)) throw this.notCapable(provider, 'calendar');
      return fn(provider, ctx);
    });
  }

  runVideo<T>(
    connection: IntegrationConnection,
    action: string,
    fn: (p: VideoProvider, ctx: ProviderRuntimeContext) => Promise<T>,
  ): Promise<T> {
    return this.run(connection, { action }, (provider, ctx) => {
      if (!isVideoProvider(provider)) throw this.notCapable(provider, 'video');
      return fn(provider, ctx);
    });
  }

  runPayment<T>(
    connection: IntegrationConnection,
    action: string,
    fn: (p: PaymentProvider, ctx: ProviderRuntimeContext) => Promise<T>,
  ): Promise<T> {
    return this.run(connection, { action }, (provider, ctx) => {
      if (!isPaymentProvider(provider)) throw this.notCapable(provider, 'payment');
      return fn(provider, ctx);
    });
  }

  runEmail<T>(
    connection: IntegrationConnection,
    action: string,
    fn: (p: EmailProvider, ctx: ProviderRuntimeContext) => Promise<T>,
  ): Promise<T> {
    return this.run(connection, { action }, (provider, ctx) => {
      if (!isEmailProvider(provider)) throw this.notCapable(provider, 'email');
      return fn(provider, ctx);
    });
  }

  runSms<T>(
    connection: IntegrationConnection,
    action: string,
    fn: (p: SmsProvider, ctx: ProviderRuntimeContext) => Promise<T>,
  ): Promise<T> {
    return this.run(connection, { action }, (provider, ctx) => {
      if (!isSmsProvider(provider)) throw this.notCapable(provider, 'sms');
      return fn(provider, ctx);
    });
  }

  runCrm<T>(
    connection: IntegrationConnection,
    action: string,
    fn: (p: CrmProvider, ctx: ProviderRuntimeContext) => Promise<T>,
  ): Promise<T> {
    return this.run(connection, { action }, (provider, ctx) => {
      if (!isCrmProvider(provider)) throw this.notCapable(provider, 'crm');
      return fn(provider, ctx);
    });
  }

  runMessaging<T>(
    connection: IntegrationConnection,
    action: string,
    fn: (p: MessagingProvider, ctx: ProviderRuntimeContext) => Promise<T>,
  ): Promise<T> {
    return this.run(connection, { action }, (provider, ctx) => {
      if (!isMessagingProvider(provider)) throw this.notCapable(provider, 'messaging');
      return fn(provider, ctx);
    });
  }

  runAutomation<T>(
    connection: IntegrationConnection,
    action: string,
    fn: (p: AutomationProvider, ctx: ProviderRuntimeContext) => Promise<T>,
  ): Promise<T> {
    return this.run(connection, { action }, (provider, ctx) => {
      if (!isAutomationProvider(provider)) throw this.notCapable(provider, 'automation');
      return fn(provider, ctx);
    });
  }

  /**
   * Probe a connection's health. Unlike {@link run}, a provider returning
   * `{ healthy: false }` (without throwing) is treated as DEGRADED rather than
   * success, and thrown errors mark the connection UNHEALTHY/EXPIRED.
   */
  async checkHealth(
    connection: IntegrationConnection,
  ): Promise<{ status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY'; latencyMs: number | null; message: string | null }> {
    const provider = this.registry.get(connection.provider);
    const startedAt = Date.now();
    try {
      const ctx = await this.context.build(connection);
      const result = await provider.healthCheck(ctx);
      const status = result.healthy ? 'HEALTHY' : 'DEGRADED';
      const latencyMs = result.latencyMs ?? Date.now() - startedAt;
      await Promise.all([
        this.prisma.integrationConnection.update({
          where: { id: connection.id },
          data: {
            healthStatus: status,
            lastHealthCheckAt: new Date(),
            lastError: result.healthy ? null : (result.message ?? null),
            ...(result.healthy ? { status: 'ACTIVE' } : {}),
          },
        }),
        this.logs.record({
          organizationId: connection.organizationId,
          connectionId: connection.id,
          provider: connection.provider,
          category: connection.category,
          direction: 'INTERNAL',
          action: 'health_check',
          status: result.healthy ? 'SUCCESS' : 'FAILURE',
          durationMs: latencyMs,
          error: result.healthy ? null : (result.message ?? null),
        }),
      ]);
      return { status, latencyMs, message: result.message ?? null };
    } catch (error) {
      const isAuth = isIntegrationError(error) && error.kind === IntegrationErrorKind.Auth;
      const message = error instanceof Error ? error.message : String(error);
      await Promise.all([
        this.prisma.integrationConnection.update({
          where: { id: connection.id },
          data: {
            healthStatus: 'UNHEALTHY',
            lastHealthCheckAt: new Date(),
            lastError: message.slice(0, 1000),
            ...(isAuth ? { status: 'EXPIRED' } : {}),
          },
        }),
        this.logs.record({
          organizationId: connection.organizationId,
          connectionId: connection.id,
          provider: connection.provider,
          category: connection.category,
          direction: 'INTERNAL',
          action: 'health_check',
          status: 'FAILURE',
          durationMs: Date.now() - startedAt,
          error: message.slice(0, 1000),
        }),
      ]);
      return { status: 'UNHEALTHY', latencyMs: null, message };
    }
  }

  // --- Internal reconciliation ---------------------------------------------

  private async handleFailure(
    connection: IntegrationConnection,
    options: RunOptions,
    startedAt: number,
    error: unknown,
  ): Promise<void> {
    const isAuth = isIntegrationError(error) && error.kind === IntegrationErrorKind.Auth;
    const httpStatus = isIntegrationError(error) ? (error.httpStatus ?? null) : null;
    const message = error instanceof Error ? error.message : String(error);

    await Promise.all([
      this.logs.record({
        organizationId: connection.organizationId,
        connectionId: connection.id,
        provider: connection.provider,
        category: connection.category,
        direction: options.direction ?? 'OUTBOUND',
        action: options.action,
        status: 'FAILURE',
        httpStatus,
        durationMs: Date.now() - startedAt,
        error: message.slice(0, 1000),
      }),
      this.prisma.integrationConnection.update({
        where: { id: connection.id },
        data: {
          lastError: message.slice(0, 1000),
          healthStatus: isAuth ? 'UNHEALTHY' : 'DEGRADED',
          ...(isAuth ? { status: 'EXPIRED' } : {}),
        },
      }),
    ]);
  }

  private async markHealthy(connection: IntegrationConnection): Promise<void> {
    if (connection.healthStatus === 'HEALTHY' && connection.status === 'ACTIVE') return;
    await this.prisma.integrationConnection.update({
      where: { id: connection.id },
      data: { healthStatus: 'HEALTHY', status: 'ACTIVE', lastError: null },
    });
  }

  private notCapable(provider: BaseProvider, capability: string): AppError {
    return new AppError(
      ErrorCode.Validation,
      `Provider "${provider.descriptor.id}" is not a ${capability} provider.`,
    );
  }

  private toAppError(error: unknown): AppError {
    if (error instanceof AppError) return error;
    if (isIntegrationError(error)) {
      const code =
        error.kind === IntegrationErrorKind.Auth
          ? ErrorCode.Unauthorized
          : error.kind === IntegrationErrorKind.Config
            ? ErrorCode.Validation
            : ErrorCode.Internal;
      return new AppError(code, error.message, { details: { kind: error.kind } });
    }
    return new AppError(ErrorCode.Internal, (error as Error)?.message ?? 'Integration failed.');
  }
}
