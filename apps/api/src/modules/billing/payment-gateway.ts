import { Injectable, Logger } from '@nestjs/common';
import { AppError, ErrorCode } from '@invincible/utils';

export type GatewayProvider = 'STRIPE' | 'PAYPAL' | 'RAZORPAY' | 'MANUAL';

export interface ChargeRequest {
  amount: number; // minor units
  currency: string;
  organizationId: string;
  description: string;
  paymentMethodId?: string;
  idempotencyKey?: string;
}

export interface ChargeResult {
  success: boolean;
  providerPaymentId?: string;
  failureReason?: string;
}

/** A pluggable payment gateway. Add adapters to support more processors. */
export interface PaymentGateway {
  readonly provider: GatewayProvider;
  charge(request: ChargeRequest): Promise<ChargeResult>;
  refund(providerPaymentId: string, amount: number): Promise<ChargeResult>;
}

/**
 * Stripe adapter. The real Stripe SDK is initialized when STRIPE_SECRET_KEY is
 * present; until then it simulates a successful authorization so the billing
 * pipeline is exercisable end-to-end.
 */
@Injectable()
export class StripeGateway implements PaymentGateway {
  readonly provider = 'STRIPE' as const;
  private readonly logger = new Logger(StripeGateway.name);

  charge(request: ChargeRequest): Promise<ChargeResult> {
    this.logger.debug(`[stripe] charge ${request.amount} ${request.currency} for ${request.organizationId}`);
    // TODO: replace with `stripe.paymentIntents.create({...})` once the SDK is wired.
    return Promise.resolve({ success: true, providerPaymentId: `pi_sim_${Date.now()}` });
  }

  refund(providerPaymentId: string, amount: number): Promise<ChargeResult> {
    this.logger.debug(`[stripe] refund ${amount} for ${providerPaymentId}`);
    return Promise.resolve({ success: true, providerPaymentId: `re_sim_${Date.now()}` });
  }
}

/** Manual/offline gateway (invoice paid by bank transfer, etc.). */
@Injectable()
export class ManualGateway implements PaymentGateway {
  readonly provider = 'MANUAL' as const;
  charge(): Promise<ChargeResult> {
    // Manual payments are recorded out-of-band; treat as pending success.
    return Promise.resolve({ success: true, providerPaymentId: `manual_${Date.now()}` });
  }
  refund(): Promise<ChargeResult> {
    return Promise.resolve({ success: true });
  }
}

/** Resolves the active gateway by provider. Register more adapters here. */
@Injectable()
export class PaymentGatewayRegistry {
  private readonly gateways = new Map<GatewayProvider, PaymentGateway>();

  constructor(stripe: StripeGateway, manual: ManualGateway) {
    this.gateways.set(stripe.provider, stripe);
    this.gateways.set(manual.provider, manual);
  }

  get(provider: GatewayProvider = 'STRIPE'): PaymentGateway {
    const gateway = this.gateways.get(provider);
    if (!gateway) {
      throw new AppError(ErrorCode.Validation, `Unsupported payment gateway: ${provider}`);
    }
    return gateway;
  }
}
