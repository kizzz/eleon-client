import type { PaymentMethod } from '../../../common/module/constants/payment-method.enum';
import type { InvoiceDto } from '../invoices/models';
import type { AccountStatus } from '../../../common/module/constants/account-status.enum';
import type { PagedAndSortedResultRequestDto } from '@eleon/proxy-utils.lib';
import type { AccountListRequestType } from '../constants/account-list-request-type.enum';
import type { LifecycleActorTypes } from '../../../common/module/constants/lifecycle-actor-types.enum';

export interface AccountDto extends AccountHeaderDto {
  billingName?: string;
  companyCID?: string;
  billingAddressLine1?: string;
  billingAddressLine2?: string;
  city?: string;
  stateOrProvince?: string;
  postalCode?: string;
  country?: string;
  contactPersonEmail?: string;
  contactPersonTelephone?: string;
  paymentMethod: PaymentMethod;
  description?: string;
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
  name?: string;
  active: boolean;
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
  name?: string;
  contactPersonEmail?: string;
}

export interface CreateLinkedTenantDto {
  tenantMemberEntityId?: string;
}

export interface CreateLinkedUserDto {
  userMemberEntityId?: string;
}

export interface CreateTenantMemberDto {
  refTenantId?: string;
}

export interface CreateUserMemberDto {
  userId?: string;
}

export interface LinkedTenantListRequestDto extends PagedAndSortedResultRequestDto {
  accountPackageId?: string;
}

export interface LinkedUserListRequestDto extends PagedAndSortedResultRequestDto {
  accountPackageId?: string;
}

export interface TenantMemberDto {
  id?: string;
  refTenantId?: string;
}

export interface TenantMemberListRequestDto extends PagedAndSortedResultRequestDto {
  accountId?: string;
}

export interface UserMemberDto {
  id?: string;
  userId?: string;
}

export interface UserMemberListRequestDto extends PagedAndSortedResultRequestDto {
  accountId?: string;
}
