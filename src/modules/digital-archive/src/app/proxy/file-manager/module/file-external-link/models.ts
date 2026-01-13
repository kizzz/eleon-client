import type { ExternalLinkEto } from '../../../messaging/module/eto/models';
import type { EntityDto } from '@eleon/proxy-utils.lib';
import type { FileShareStatus } from '../../../common/module/constants/file-share-status.enum';
import type { LinkShareStatus } from '../../../common/module/constants/link-share-status.enum';
import type { FileReviewerType } from '../../../common/module/constants/file-reviewer-type.enum';

export interface CreateOrUpdateReviewerDto {
  fileExternalLinkId?: string;
  updatedReviewer: FileExternalLinkReviewerDto;
  externalLink: ExternalLinkEto;
}

export interface FileExternalLinkDto extends EntityDto<string> {
  permissionType: FileShareStatus;
  archiveId?: string;
  fileId?: string;
  webUrl?: string;
  externalFileId?: string;
  reviewers: FileExternalLinkReviewerDto[];
  tenantId?: string;
}

export interface FileExternalLinkReviewerDto extends EntityDto<string> {
  reviewerStatus: LinkShareStatus;
  expirationDateTime?: string;
  reviewerType: FileReviewerType;
  reviewerKey?: string;
  reviewerKeyLabel?: string;
  lastReviewDates?: string;
  externalLinkCode?: string;
  url?: string;
  externalLink: ExternalLinkEto;
}

export interface FileExternalLinkReviewerInfoDto {
  fileName?: string;
  reviewerType: FileReviewerType;
  reviewerStatus: LinkShareStatus;
}
