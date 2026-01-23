import type { AccountStatus } from '../../../common/module/constants/account-status.enum';
import type { BillingPeriodType } from '../../../common/module/constants/billing-period-type.enum';

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
  linkedMembers: LinkedMemberDto[];
}

export interface LinkedMemberDto {
  id?: string;
  accountPackageEntityId?: string;
  memberEntityId?: string;
}
