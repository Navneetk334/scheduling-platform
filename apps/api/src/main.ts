import 'reflect-metadata';

import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { type NestExpressApplication } from '@nestjs/platform-express';
import express from 'express';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { AuthService } from './auth/auth.service';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { AppConfigService } from './config/app-config.service';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');

  // Better Auth needs the raw request body, so disable Nest's global body
  // parser and re-add JSON parsing for everything except the auth routes.
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
  });

  const config = app.get(AppConfigService);
  const auth = app.get(AuthService);

  app.use(helmet());
  app.enableCors({
    origin: [config.get('WEB_URL')],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'x-organization-id', 'x-request-id'],
  });

  const expressApp = app.getHttpAdapter().getInstance();
  // Mount Better Auth first (raw body), then JSON-parse the rest.
  expressApp.all('/api/auth/*', auth.nodeHandler);
  // Capture the raw request body so integration webhook handlers can verify
  // provider signatures (Stripe/Razorpay/etc.) against the exact bytes.
  expressApp.use(
    express.json({
      limit: '1mb',
      verify: (req: express.Request & { rawBody?: string }, _res, buf: Buffer) => {
        req.rawBody = buf.toString('utf8');
      },
    }),
  );
  expressApp.use(express.urlencoded({ extended: true }));

  app.setGlobalPrefix('api', { exclude: ['api/auth/(.*)'] });
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.enableShutdownHooks();

  const port = config.get('API_PORT');
  await app.listen(port);
  logger.log(`API listening on ${config.get('API_URL')} (port ${port})`);
}

void bootstrap();
