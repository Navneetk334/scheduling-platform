import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { z } from 'zod';

import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { CurrentUser } from '../decorators/current-user.decorator';
import { SessionAuthGuard } from '../guards/session-auth.guard';
import type { SessionContext } from '../auth.service';

import { TokensService } from './tokens.service';

const refreshSchema = z.object({ refreshToken: z.string().min(1) });

/**
 * JWT token endpoints. Exchange an authenticated session for a bearer token
 * pair, then rotate/revoke without cookies — ideal for mobile and server
 * clients.
 */
@Controller({ path: 'auth', version: '1' })
export class TokensController {
  constructor(private readonly tokens: TokensService) {}

  /** Mint an access + refresh token pair for the authenticated user. */
  @Post('token')
  @UseGuards(SessionAuthGuard)
  issue(@CurrentUser() user: SessionContext['user']) {
    return this.tokens.issue({ id: user.id, email: user.email, name: user.name });
  }

  @Post('refresh')
  refresh(@Body(new ZodValidationPipe(refreshSchema)) body: { refreshToken: string }) {
    return this.tokens.refresh(body.refreshToken);
  }

  @Post('revoke')
  async revoke(@Body(new ZodValidationPipe(refreshSchema)) body: { refreshToken: string }) {
    await this.tokens.revoke(body.refreshToken);
    return { revoked: true };
  }
}
