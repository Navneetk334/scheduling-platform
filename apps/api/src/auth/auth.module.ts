import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AppConfigService } from '../config/app-config.service';

import { ApiKeyGuard } from './api-keys/api-key.guard';
import { ApiKeysService } from './api-keys/api-keys.service';
import { AuthService } from './auth.service';
import { SessionAuthGuard } from './guards/session-auth.guard';
import { TokensController } from './tokens/tokens.controller';
import { TokensService } from './tokens/tokens.service';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        secret: config.get('JWT_SECRET'),
      }),
    }),
  ],
  controllers: [TokensController],
  providers: [AuthService, SessionAuthGuard, TokensService, ApiKeysService, ApiKeyGuard],
  exports: [AuthService, SessionAuthGuard, TokensService, ApiKeysService, ApiKeyGuard],
})
export class AuthModule {}
