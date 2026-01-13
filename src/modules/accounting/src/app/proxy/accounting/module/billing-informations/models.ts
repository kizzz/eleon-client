import type { PaymentMethod } from '../../../common/module/constants/payment-method.enum';

export interface BillingInformationDto {
  id?: string;
  companyName?: string;
  companyCID?: string;
  billingAddressLine1?: string;
  billingAddressLine2?: string;
  city?: string;
  stateOrProvince?: string;
  postalCode?: string;
  country?: string;
  contactPersonName?: string;
  contactPersonEmail?: string;
  contactPersonTelephone?: string;
  paymentMethod: PaymentMethod;
}
