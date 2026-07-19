import { Module } from '@nestjs/common';

import { OrganizationsModule } from '../organizations/organizations.module';

import { BillingAnalyticsService } from './billing-analytics.service';
import { BillingController } from './billing.controller';
import { CouponsService } from './coupons.service';
import { DunningService } from './dunning.service';
import { EntitlementsService } from './entitlements.service';
import { ManualGateway, PaymentGatewayRegistry, StripeGateway } from './payment-gateway';
import { PlansController } from './plans.controller';
import { SubscriptionsService } from './subscriptions.service';
import { TaxService } from './tax.service';

@Module({
  imports: [OrganizationsModule],
  controllers: [BillingController, PlansController],
  providers: [
    SubscriptionsService,
    EntitlementsService,
    CouponsService,
    TaxService,
    BillingAnalyticsService,
    DunningService,
    StripeGateway,
    ManualGateway,
    PaymentGatewayRegistry,
  ],
  exports: [EntitlementsService, DunningService, SubscriptionsService],
})
export class BillingModule {}
