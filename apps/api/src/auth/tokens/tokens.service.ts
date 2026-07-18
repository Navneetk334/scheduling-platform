import { randomUUID } from 'node:crypto';

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppError, ErrorCode } from '@invincible/utils';

import { AppConfigService } from '../../config/app-config.service';
import { RedisService } from '../../redis/redis.service';

export interface AccessTokenClaims {
  sub: string;
  email: string;
  name: string;
  type: 'access';
}

interface RefreshClaims {
  sub: string;
  jti: string;
  type: 'refresh';
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: string;
}

/**
 * Issues and rotates JWT access + refresh tokens. Access tokens are stateless
 * and short-lived; refresh tokens are long-lived JWTs whose `jti` is
 * allow-listed in Redis, enabling rotation and revocation.
 */
@Injectable()
export class TokensService {
  constructor(
    private readonly jwt: JwtService,
    private readonly redis: RedisService,
    private readonly config: AppConfigService,
  ) {}

  private refreshKey(userId: string, jti: string): string {
    return `refresh:${userId}:${jti}`;
  }

  async issue(user: { id: string; email: string; name: string }): Promise<TokenPair> {
    const accessTtl = this.config.get('JWT_ACCESS_TTL');
    const refreshDays = this.config.get('JWT_REFRESH_TTL_DAYS');
    const jti = randomUUID();

    const accessToken = await this.jwt.signAsync(
      { sub: user.id, email: user.email, name: user.name, type: 'access' } satisfies AccessTokenClaims,
      { expiresIn: accessTtl },
    );
    const refreshToken = await this.jwt.signAsync(
      { sub: user.id, jti, type: 'refresh' } satisfies RefreshClaims,
      { expiresIn: `${refreshDays}d` },
    );

    await this.redis.client.set(this.refreshKey(user.id, jti), '1', 'EX', refreshDays * 86400);
    return { accessToken, refreshToken, tokenType: 'Bearer', expiresIn: accessTtl };
  }

  /** Verify a stateless access token; returns claims or throws Unauthorized. */
  async verifyAccess(token: string): Promise<AccessTokenClaims> {
    try {
      const claims = await this.jwt.verifyAsync<AccessTokenClaims>(token);
      if (claims.type !== 'access') throw new Error('wrong token type');
      return claims;
    } catch {
      throw new AppError(ErrorCode.Unauthorized, 'Invalid or expired access token.');
    }
  }

  /** Rotate a refresh token: validate, revoke the old jti, issue a new pair. */
  async refresh(refreshToken: string): Promise<TokenPair> {
    let claims: RefreshClaims;
    try {
      claims = await this.jwt.verifyAsync<RefreshClaims>(refreshToken);
      if (claims.type !== 'refresh') throw new Error('wrong token type');
    } catch {
      throw new AppError(ErrorCode.Unauthorized, 'Invalid or expired refresh token.');
    }

    const key = this.refreshKey(claims.sub, claims.jti);
    const exists = await this.redis.client.del(key);
    if (exists === 0) {
      throw new AppError(ErrorCode.Unauthorized, 'Refresh token has been revoked or already used.');
    }
    // Access-token claims (email/name) are refreshed lazily; sub is authoritative.
    return this.issue({ id: claims.sub, email: '', name: '' });
  }

  async revoke(refreshToken: string): Promise<void> {
    try {
      const claims = await this.jwt.verifyAsync<RefreshClaims>(refreshToken);
      await this.redis.client.del(this.refreshKey(claims.sub, claims.jti));
    } catch {
      // Revoking an invalid token is a no-op.
    }
  }
}
