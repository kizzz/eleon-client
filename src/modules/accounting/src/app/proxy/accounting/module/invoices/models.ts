import type { PaymentType } from '../../../common/module/constants/payment-type.enum';

export interface InvoiceDto {
  id?: string;
  accountEntityId?: string;
  customerName?: string;
  companyCID?: string;
  billingAddress?: string;
  billingCity?: string;
  billingState?: string;
  billingCountry?: string;
  billingPostalCode?: string;
  currency?: string;
  total: number;
  invoiceRows: InvoiceRowDto[];
  receipt: ReceiptDto;
}

export interface InvoiceRowDto {
  id?: string;
  invoiceEntityId?: string;
  count: number;
  price: number;
  description?: string;
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
