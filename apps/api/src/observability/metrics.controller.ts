import { Controller, Get, Header, VERSION_NEUTRAL } from '@nestjs/common';

import { SkipRateLimit } from '../common/security/rate-limit.guard';

import { MetricsService } from './metrics.service';

@Controller({ path: 'metrics', version: VERSION_NEUTRAL })
export class MetricsController {
  constructor(private readonly metrics: MetricsService) {}

  /** Prometheus scrape endpoint (text exposition format). */
  @Get()
  @SkipRateLimit()
  @Header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
  render(): Promise<string> {
    return this.metrics.render();
  }
}
