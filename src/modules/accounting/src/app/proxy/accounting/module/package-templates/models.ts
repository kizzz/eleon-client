import type { BillingPeriodType } from '../../../common/module/constants/billing-period-type.enum';
import type { PackageType } from '../../../common/module/constants/package-type.enum';
import type { PackageModuleType } from '../../../common/module/constants/package-module-type.enum';
import type { PagedAndSortedResultRequestDto } from '@eleon/proxy-utils.lib';

export interface PackageTemplateDto {
  id?: string;
  packageName?: string;
  creatorId?: string;
  creationTime?: string;
  billingPeriodType: BillingPeriodType;
  packageTemplateModules: PackageTemplateModuleDto[];
  packageType: PackageType;
  description?: string;
  maxMembers: number;
  price: number;
  systemCurrency?: string;
}

export interface PackageTemplateModuleDto {
  id?: string;
  packageTemplateEntityId?: string;
  name?: string;
  refId?: string;
  moduleType: PackageModuleType;
  description?: string;
  moduleData?: string;
}

export interface PackageTemplateListRequestDto extends PagedAndSortedResultRequestDto {
  searchQuery?: string;
  dateFilterStart?: string;
  dateFilterEnd?: string;
  billingPeriodTypeFilter: BillingPeriodType[];
}
