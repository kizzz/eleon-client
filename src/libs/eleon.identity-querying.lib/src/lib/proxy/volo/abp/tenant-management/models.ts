import type { ExtensibleEntityDto, PagedAndSortedResultRequestDto } from '@eleon/proxy-utils.lib';

export interface GetTenantsInput extends PagedAndSortedResultRequestDto {
  filter?: string;
}

export interface TenantDto extends ExtensibleEntityDto<string> {
  name?: string;
  concurrencyStamp?: string;
}
