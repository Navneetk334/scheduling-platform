import { startOAuthSchema, oauthCallbackSchema, type StartOAuthInput } from '@invincible/utils';
import { Body, Controller, Get, Post, Query, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';

import type { SessionContext } from '../../auth/auth.service';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { SessionAuthGuard } from '../../auth/guards/session-auth.guard';
import { ActiveOrganizationId } from '../../common/decorators/active-organization.decorator';
import { OrgMembershipGuard } from '../../common/guards/org-membership.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';

import { OAuthService } from './oauth.service';

@Controller({ path: 'integrations/oauth', version: '1' })
export class OAuthController {
  constructor(private readonly oauth: OAuthService) {}

  /** Begin an OAuth authorize flow; returns the provider consent URL. */
  @Post('authorize')
  @UseGuards(SessionAuthGuard, OrgMembershipGuard)
  authorize(
    @ActiveOrganizationId() organizationId: string,
    @CurrentUser() user: SessionContext['user'],
    @Body(new ZodValidationPipe(startOAuthSchema)) body: StartOAuthInput,
  ) {
    return this.oauth.authorize(organizationId, user.id, body.provider, body.returnTo);
  }

  /**
   * OAuth redirect target. Public (the third party redirects the user's
   * browser here); security comes from the signed/opaque `state` value.
   */
  @Get('callback')
  async callback(
    @Query() query: Record<string, string>,
    @Res() res: Response,
  ): Promise<void> {
    const { code, state } = oauthCallbackSchema.parse(query);
    const { returnTo } = await this.oauth.handleCallback(code, state);
    res.redirect(returnTo);
  }
}
