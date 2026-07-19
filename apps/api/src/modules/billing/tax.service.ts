import { Injectable } from '@nestjs/common';
import { TaxType, calculateTax, resolveTaxRate, type TaxRate } from '@invincible/utils';

@Injectable()
export class TaxService {
  /** Resolve the applicable tax (GST/VAT/sales) for a billing country. */
  resolve(country?: string | null): TaxRate {
    if (!country) return { type: TaxType.None, rate: 0, country: '', label: 'No Tax' };
    return resolveTaxRate(country);
  }

  calculate(amount: number, country?: string | null, inclusive = false) {
    const rate = this.resolve(country);
    return { ...calculateTax(amount, rate.rate, rate.type, inclusive), label: rate.label };
  }
}
