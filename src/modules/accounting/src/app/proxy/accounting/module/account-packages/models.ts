import type { AccountStatus } from '../../../common/module/constants/account-status.enum';
import type { BillingPeriodType } from '../../../common/module/constants/billing-period-type.enum';
import type { PackageTemplateDto } from '../package-templates/models';
import type { PagedAndSortedResultRequestDto } from '@eleon/proxy-utils.lib';

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
  packageTemplate: PackageTemplateDto;
}

export interface AccountPackageListRequestDto extends PagedAndSortedResultRequestDto {
  accountId?: string;
}

export interface CreateAccountPackageDto {
  id?: string;
  autoSuspention: boolean;
  autoRenewal: boolean;
  expiringDate?: string;
  packageTemplateEntityId?: string;
  billingPeriodType: BillingPeriodType;
  oneTimeDiscount: number;
  permanentDiscount: number;
}

export interface LinkedTenantDto {
  id?: string;
  accountPackageEntityId?: string;
  tenantMemberEntityId?: string;
}

export interface LinkedUserDto {
  id?: string;
  accountPackageEntityId?: string;
  userMemberEntityId?: string;
}
