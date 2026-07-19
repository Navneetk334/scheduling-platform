/** Consumption-tax calculation (GST / VAT / sales tax). Minor units throughout. */

export const TaxType = { None: 'NONE', GST: 'GST', VAT: 'VAT', SALES: 'SALES' } as const;
export type TaxType = (typeof TaxType)[keyof typeof TaxType];

export interface TaxRate {
  type: TaxType;
  /** Percentage, e.g. 20 for 20%. */
  rate: number;
  country: string;
  label: string;
}

/** A small, representative rate table. Real deployments source this live. */
const TAX_RATES: Record<string, TaxRate> = {
  IN: { type: TaxType.GST, rate: 18, country: 'IN', label: 'GST' },
  AU: { type: TaxType.GST, rate: 10, country: 'AU', label: 'GST' },
  GB: { type: TaxType.VAT, rate: 20, country: 'GB', label: 'VAT' },
  DE: { type: TaxType.VAT, rate: 19, country: 'DE', label: 'VAT' },
  FR: { type: TaxType.VAT, rate: 20, country: 'FR', label: 'VAT' },
  US: { type: TaxType.SALES, rate: 0, country: 'US', label: 'Sales Tax' },
};

export function resolveTaxRate(country: string): TaxRate {
  return TAX_RATES[country.toUpperCase()] ?? { type: TaxType.None, rate: 0, country, label: 'No Tax' };
}

export interface TaxResult {
  /** Pre-tax amount (minor units). */
  net: number;
  taxAmount: number;
  total: number;
  rate: number;
  type: TaxType;
}

/**
 * Compute tax on an amount. For `inclusive` amounts the tax is extracted from
 * the total; otherwise it is added on top.
 */
export function calculateTax(amount: number, rate: number, type: TaxType, inclusive = false): TaxResult {
  if (rate <= 0 || type === TaxType.None) {
    return { net: amount, taxAmount: 0, total: amount, rate: 0, type: TaxType.None };
  }
  if (inclusive) {
    const net = Math.round(amount / (1 + rate / 100));
    return { net, taxAmount: amount - net, total: amount, rate, type };
  }
  const taxAmount = Math.round((amount * rate) / 100);
  return { net: amount, taxAmount, total: amount + taxAmount, rate, type };
}
