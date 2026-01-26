import type { InvoiceStatus } from '../../../common/module/constants/invoice-status.enum';
import type { InvoiceLineType } from '../../../common/module/constants/invoice-line-type.enum';
import type { PaymentType } from '../../../common/module/constants/payment-type.enum';
import type { PagedAndSortedResultRequestDto } from '@eleon/proxy-utils.lib';

export interface InvoiceDto {
  id?: string;
  accountEntityId?: string;
  invoiceNumber?: string;
  status: InvoiceStatus;
  issuedUtc?: string;
  dueUtc?: string;
  billingPeriodStartUtc?: string;
  billingPeriodEndUtc?: string;
  currency?: string;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  total: number;
  amountDue: number;
  fxRateApplied?: number;
  subtotalMinor: number;
  discountTotalMinor: number;
  taxTotalMinor: number;
  totalMinor: number;
  amountDueMinor: number;
  customerName?: string;
  companyCID?: string;
  billingAddress?: string;
  billingCity?: string;
  billingState?: string;
  billingCountry?: string;
  billingPostalCode?: string;
  invoiceRows: InvoiceRowDto[];
  receipt: ReceiptDto;
}

export interface InvoiceRowDto {
  id?: string;
  invoiceEntityId?: string;
  lineType: InvoiceLineType;
  description?: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  unitPriceMinor: number;
  amountMinor: number;
  sourceRefType?: string;
  taxCategory?: string;
  taxRateApplied?: number;
  taxAmount?: number;
  sourceRef?: string;
  metadataJson?: string;
  count: number;
  price: number;
  rowTotal: number;
}

export interface ReceiptDto {
  id?: string;
  tenantId?: string;
  invoiceEntityId?: string;
  paymentDate?: string;
  amount: number;
  paymentType: PaymentType;
  transaction?: string;
}

export interface CreateInvoiceDto {
  accountId?: string;
  billingPeriodStartUtc?: string;
  billingPeriodEndUtc?: string;
}

export interface InvoiceListRequestDto extends PagedAndSortedResultRequestDto {
  accountId?: string;
  status?: InvoiceStatus;
}
