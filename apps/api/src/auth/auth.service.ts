import { Injectable, type OnModuleInit } from '@nestjs/common';
import { betterAuth, type BetterAuthOptions } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { fromNodeHeaders, toNodeHandler } from 'better-auth/node';
import type { IncomingHttpHeaders } from 'node:http';

import { AppConfigService } from '../config/app-config.service';
import { PrismaService } from '../prisma/prisma.service';

export type AuthInstance = ReturnType<typeof betterAuth>;

export interface SessionContext {
  user: {
    id: string;
    email: string;
    name: string;
    image?: string | null;
  };
  session: {
    id: string;
    userId: string;
    activeOrganizationId?: string | null;
  };
}

/**
 * Owns the Better Auth instance. Better Auth is framework-agnostic; we expose
 * its request handler (mounted in `main.ts`) and a typed session resolver used
 * by the auth guard.
 */
@Injectable()
export class AuthService implements OnModuleInit {
  private instance!: AuthInstance;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: AppConfigService,
  ) {}

  onModuleInit(): void {
    const options: BetterAuthOptions = {
      appName: 'INVINCIBLE PROS',
      secret: this.config.get('BETTER_AUTH_SECRET'),
      baseURL: this.config.get('BETTER_AUTH_URL'),
      basePath: '/api/auth',
      trustedOrigins: [this.config.get('WEB_URL')],
      database: prismaAdapter(this.prisma, { provider: 'postgresql' }),
      emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
        minPasswordLength: 10,
      },
      user: {
        additionalFields: {
          timeZone: { type: 'string', required: false, defaultValue: 'UTC' },
        },
      },
      session: {
        expiresIn: 60 * 60 * 24 * 7,
        updateAge: 60 * 60 * 24,
      },
    };

    this.instance = betterAuth(options);
  }

  /** Express-compatible handler for mounting the Better Auth routes. */
  get nodeHandler(): ReturnType<typeof toNodeHandler> {
    return toNodeHandler(this.instance);
  }

  /** Resolve the current session from raw Node request headers, or null. */
  async getSession(headers: IncomingHttpHeaders): Promise<SessionContext | null> {
    const result = await this.instance.api.getSession({
      headers: fromNodeHeaders(headers),
    });
    if (!result) return null;
    return result as unknown as SessionContext;
  }
}
