import { applyDiscounts, type Discount } from './discounts';
import { calculateTax, TaxType } from './tax';

export interface InvoiceLineInput {
  description: string;
  quantity: number;
  unitAmount: number; // minor units
}

export interface InvoiceLine extends InvoiceLineInput {
  amount: number;
}

export interface InvoiceTaxInput {
  rate: number;
  type: TaxType;
  inclusive?: boolean;
}

export interface BuiltInvoice {
  lines: InvoiceLine[];
  subtotal: number;
  discountTotal: number;
  taxableAmount: number;
  taxTotal: number;
  total: number;
  currency: string;
}

/**
 * Assemble an invoice: line items → subtotal → discounts → tax → total.
 * Deterministic and framework-free, so the API can persist the result 1:1.
 */
export function buildInvoice(params: {
  lines: InvoiceLineInput[];
  discounts?: Discount[];
  tax?: InvoiceTaxInput;
  currency?: string;
}): BuiltInvoice {
  const lines: InvoiceLine[] = params.lines.map((l) => ({ ...l, amount: l.quantity * l.unitAmount }));
  const subtotal = lines.reduce((sum, l) => sum + l.amount, 0);

  const discount = applyDiscounts(subtotal, params.discounts ?? []);
  const taxableAmount = discount.net;

  const tax = params.tax
    ? calculateTax(taxableAmount, params.tax.rate, params.tax.type, params.tax.inclusive)
    : { taxAmount: 0, total: taxableAmount, net: taxableAmount, rate: 0, type: TaxType.None };

  return {
    lines,
    subtotal,
    discountTotal: discount.discountTotal,
    taxableAmount,
    taxTotal: tax.taxAmount,
    total: tax.total,
    currency: params.currency ?? 'usd',
  };
}
