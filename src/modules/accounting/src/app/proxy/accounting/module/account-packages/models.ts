import type { AccountStatus } from '../../../common/module/constants/account-status.enum';
import type { BillingPeriodType } from '../../../common/module/constants/billing-period-type.enum';
import type { MemberDto } from '../accounts/models';

export interface AccountPackageDto {
  id?: string;
  nextBillingDate?: string;
  lastBillingDate?: string;
  autoSuspention: boolean;
  autoRenewal: boolean;
  expiringDate?: string;
  status: AccountStatus;
  name?: string;
  packageTemplateEntityId?: string;
  billingPeriodType: BillingPeriodType;
  oneTimeDiscount: number;
  permanentDiscount: number;
  linkedMembers: MemberDto[];
}
