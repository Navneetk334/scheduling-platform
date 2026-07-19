import { randomBytes } from 'node:crypto';

import { Injectable } from '@nestjs/common';
import {
  AppError,
  buildInvoice,
  comparePlans,
  computeSubscriptionCost,
  getPlan,
  isPlanTier,
  nextRenewalDate,
  prorate,
  trialEnd,
  unitPrice,
  type BillingInterval,
  type Discount,
  type PlanTier,
} from '@invincible/utils';

import { PrismaService } from '../../prisma/prisma.service';

import { CouponsService } from './coupons.service';
import { PaymentGatewayRegistry, type GatewayProvider } from './payment-gateway';
import { TaxService } from './tax.service';

export interface SubscribeInput {
  planKey: string;
  interval: BillingInterval;
  seats: number;
  couponCode?: string;
  country?: string;
  gateway?: GatewayProvider;
}

export interface ChangePlanInput {
  planKey: string;
  interval?: BillingInterval;
  seats?: number;
}

const DAY_MS = 86_400_000;

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly coupons: CouponsService,
    private readonly tax: TaxService,
    private readonly gateways: PaymentGatewayRegistry,
  ) {}

  getSubscription(organizationId: string) {
    return this.prisma.subscription.findUnique({
      where: { organizationId },
      include: { plan: true },
    });
  }

  listInvoices(organizationId: string) {
    return this.prisma.invoice.findMany({
      where: { organizationId },
      include: { lineItems: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  /** Ensure a persisted Plan row exists for a catalog tier (FK target). */
  private async ensurePlanRow(tier: PlanTier): Promise<string> {
    const plan = getPlan(tier);
    const row = await this.prisma.plan.upsert({
      where: { key: tier },
      update: { name: plan.name, priceAmount: plan.pricing.monthly, currency: plan.pricing.currency },
      create: {
        key: tier,
        name: plan.name,
        description: plan.description,
        priceAmount: plan.pricing.monthly,
        currency: plan.pricing.currency,
        interval: 'MONTH',
      },
    });
    return row.id;
  }

  private toTier(planKey: string): PlanTier {
    if (!isPlanTier(planKey)) throw AppError.notFound('Plan', planKey);
    return planKey;
  }

  private async invoiceNumber(): Promise<string> {
    const year = new Date().getUTCFullYear();
    return `INV-${year}-${randomBytes(4).toString('hex').toUpperCase()}`;
  }

  /**
   * Create (or replace) a subscription: computes cost, applies a coupon + tax,
   * issues an invoice, provisions a trial or charges immediately.
   */
  async subscribe(organizationId: string, input: SubscribeInput) {
    const tier = this.toTier(input.planKey);
    const plan = getPlan(tier);
    const planId = await this.ensurePlanRow(tier);

    const discounts: Discount[] = [];
    if (input.couponCode) {
      const discount = await this.coupons.resolveDiscount(organizationId, input.couponCode);
      if (discount) discounts.push(discount);
    }

    const taxRate = this.tax.resolve(input.country);
    const invoice = buildInvoice({
      lines: [
        {
          description: `${plan.name} (${input.interval.toLowerCase()}${plan.features.seatBased ? `, ${input.seats} seat(s)` : ''})`,
          quantity: plan.features.seatBased ? input.seats : 1,
          unitAmount: unitPrice(plan, input.interval),
        },
      ],
      discounts,
      tax: { rate: taxRate.rate, type: taxRate.type },
      currency: plan.pricing.currency,
    });

    const now = new Date();
    const trialEndsAt = trialEnd(now, plan.trialDays);
    const isTrial = trialEndsAt !== null;
    const periodEnd = nextRenewalDate(now, input.interval);
    const willCharge = !isTrial && invoice.total > 0;

    const result = await this.prisma.$transaction(async (tx) => {
      const subscription = await tx.subscription.upsert({
        where: { organizationId },
        update: {
          planId,
          interval: input.interval,
          seats: input.seats,
          status: isTrial ? 'TRIALING' : 'ACTIVE',
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          trialEndsAt,
          cancelAtPeriodEnd: false,
          canceledAt: null,
        },
        create: {
          organizationId,
          planId,
          interval: input.interval,
          seats: input.seats,
          status: isTrial ? 'TRIALING' : 'ACTIVE',
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          trialEndsAt,
        },
      });

      const invoiceRow = await tx.invoice.create({
        data: {
          organizationId,
          number: await this.invoiceNumber(),
          status: willCharge ? 'PAID' : isTrial ? 'DRAFT' : 'OPEN',
          currency: invoice.currency,
          subtotal: invoice.subtotal,
          discountTotal: invoice.discountTotal,
          taxTotal: invoice.taxTotal,
          total: invoice.total,
          amountPaid: willCharge ? invoice.total : 0,
          amountDue: willCharge ? 0 : invoice.total,
          taxType: taxRate.type,
          taxRatePct: taxRate.rate,
          taxCountry: input.country ?? null,
          issuedAt: now,
          paidAt: willCharge ? now : null,
          lineItems: {
            create: invoice.lines.map((l) => ({
              description: l.description,
              quantity: l.quantity,
              unitAmount: l.unitAmount,
              amount: l.amount,
            })),
          },
        },
      });

      return { subscription, invoiceRow };
    });

    if (willCharge) {
      const gateway = this.gateways.get(input.gateway);
      const charge = await gateway.charge({
        amount: invoice.total,
        currency: invoice.currency,
        organizationId,
        description: `${plan.name} subscription`,
      });
      await this.prisma.payment.create({
        data: {
          organizationId,
          invoiceId: result.invoiceRow.id,
          amount: invoice.total,
          currency: invoice.currency,
          status: charge.success ? 'SUCCEEDED' : 'FAILED',
          provider: gateway.provider,
          providerPaymentId: charge.providerPaymentId ?? null,
          failureReason: charge.failureReason ?? null,
        },
      });
      if (input.couponCode && discounts.length > 0) {
        await this.coupons.recordRedemption(organizationId, input.couponCode, invoice.discountTotal);
      }
    }

    return result;
  }

  /** Upgrade/downgrade or change seats/interval with mid-cycle proration. */
  async changePlan(organizationId: string, input: ChangePlanInput) {
    const current = await this.prisma.subscription.findUnique({
      where: { organizationId },
      include: { plan: true },
    });
    if (!current) throw AppError.notFound('Subscription', organizationId);

    const oldTier = isPlanTier(current.plan.key) ? current.plan.key : 'free';
    const newTier = this.toTier(input.planKey);
    const interval = input.interval ?? current.interval;
    const seats = input.seats ?? current.seats;

    const oldPlan = getPlan(oldTier);
    const newPlan = getPlan(newTier);
    const oldAmount = computeSubscriptionCost(oldPlan, current.interval, current.seats).base;
    const newAmount = computeSubscriptionCost(newPlan, interval, seats).base;

    const now = new Date();
    const periodStart = current.currentPeriodStart ?? now;
    const periodEnd = current.currentPeriodEnd ?? nextRenewalDate(periodStart, interval);
    const daysInPeriod = Math.max(1, Math.round((periodEnd.getTime() - periodStart.getTime()) / DAY_MS));
    const daysRemaining = Math.max(0, Math.round((periodEnd.getTime() - now.getTime()) / DAY_MS));

    const proration = prorate({ oldAmount, newAmount, daysRemaining, daysInPeriod });
    const direction = comparePlans(newTier, oldTier);
    const planId = await this.ensurePlanRow(newTier);

    const subscription = await this.prisma.$transaction(async (tx) => {
      // A positive net creates an immediate proration invoice; a credit is
      // recorded as a $0 invoice line for the customer's records.
      if (proration.net !== 0) {
        await tx.invoice.create({
          data: {
            organizationId,
            number: await this.invoiceNumber(),
            status: proration.net > 0 ? 'OPEN' : 'PAID',
            currency: newPlan.pricing.currency,
            subtotal: Math.abs(proration.net),
            total: Math.max(0, proration.net),
            amountDue: Math.max(0, proration.net),
            issuedAt: now,
            lineItems: {
              create: [
                {
                  description: `Proration: ${oldPlan.name} → ${newPlan.name} (${direction >= 0 ? 'upgrade' : 'downgrade'})`,
                  quantity: 1,
                  unitAmount: proration.net,
                  amount: proration.net,
                },
              ],
            },
          },
        });
      }

      return tx.subscription.update({
        where: { organizationId },
        data: { planId, interval, seats, status: 'ACTIVE' },
        include: { plan: true },
      });
    });

    return { subscription, proration, direction: direction >= 0 ? 'upgrade' : 'downgrade' };
  }

  async cancel(organizationId: string, atPeriodEnd = true) {
    const sub = await this.getSubscription(organizationId);
    if (!sub) throw AppError.notFound('Subscription', organizationId);
    return this.prisma.subscription.update({
      where: { organizationId },
      data: atPeriodEnd
        ? { cancelAtPeriodEnd: true }
        : { status: 'CANCELED', canceledAt: new Date(), cancelAtPeriodEnd: false },
      include: { plan: true },
    });
  }

  async resume(organizationId: string) {
    const sub = await this.getSubscription(organizationId);
    if (!sub) throw AppError.notFound('Subscription', organizationId);
    return this.prisma.subscription.update({
      where: { organizationId },
      data: { cancelAtPeriodEnd: false, canceledAt: null, status: 'ACTIVE' },
      include: { plan: true },
    });
  }
}
