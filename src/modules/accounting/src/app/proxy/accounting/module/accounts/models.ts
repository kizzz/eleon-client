import type { BillingInformationDto } from '../billing-informations/models';
import type { AccountPackageDto } from '../account-packages/models';
import type { InvoiceDto } from '../invoices/models';
import type { AccountStatus } from '../../../common/module/constants/account-status.enum';
import type { PagedAndSortedResultRequestDto } from '@eleon/proxy-utils.lib';
import type { AccountListRequestType } from '../constants/account-list-request-type.enum';
import type { LifecycleActorTypes } from '../../../common/module/constants/lifecycle-actor-types.enum';
import type { MemberType } from '../constants/member-type.enum';

export interface AccountDto extends AccountHeaderDto {
  billingInformation: BillingInformationDto;
  members: MemberDto[];
  accountPackages: AccountPackageDto[];
  invoices: InvoiceDto[];
}

export interface AccountHeaderDto {
  id?: string;
  dataSourceUid?: string;
  dataSourceName?: string;
  companyUid?: string;
  companyName?: string;
  organizationUnitId?: string;
  organizationUnitName?: string;
  currentBalance: number;
  accountName?: string;
  accountStatus: AccountStatus;
  creatorId?: string;
  creationTime?: string;
  ownerId?: string;
  tenantId?: string;
}

export interface AccountListRequestDto extends PagedAndSortedResultRequestDto {
  searchQuery?: string;
  requestType: AccountListRequestType;
  creationDateFilterStart?: string;
  creationDateFilterEnd?: string;
  initiatorNameFilter?: string;
  accountStatusFilter: AccountStatus[];
  actorTypeFilter?: LifecycleActorTypes;
  actorRefIdFilter?: string;
  approvalNeededFilter?: boolean;
  organizationUnitFilter: string[];
}

export interface CreateAccountDto {
  dataSourceUid?: string;
  dataSourceName?: string;
  companyUid?: string;
  companyName?: string;
  organizationUnitId?: string;
  organizationUnitName?: string;
  ownerId?: string;
}

export interface MemberDto {
  id?: string;
  refId?: string;
  type: MemberType;
}
