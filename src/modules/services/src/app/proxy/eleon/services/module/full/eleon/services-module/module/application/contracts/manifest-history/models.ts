import type { EntityDto, PagedAndSortedResultRequestDto } from '@eleon/proxy-utils.lib';

export interface GetManifestHistoriesRequestDto extends PagedAndSortedResultRequestDto {
  serviceId?: string;
}

export interface ManifestHistoryDto extends EntityDto<string> {
  serviceId?: string;
  manifest?: string;
  updateDateUtc?: string;
}
