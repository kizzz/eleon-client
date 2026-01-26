import type { ExternalLinkLoginType } from '../../../common/module/constants/external-link-login-type.enum';
import type { LinkShareStatus } from '../../../common/module/constants/link-share-status.enum';

export interface ExternalLinkEto {
  id?: string;
  tenantId?: string;
  expirationDateTime?: string;
  publicParams?: string;
  privateParams?: string;
  loginType: ExternalLinkLoginType;
  documentType?: string;
  loginKey?: string;
  loginKeyLabel?: string;
  loginAttempts: number;
  lastLoginSuccessDate?: string;
  lastLoginAttemptDate?: string;
  lastPublicRequestDate?: string;
  status: LinkShareStatus;
  isOneTimeLink: boolean;
  externalLinkCode?: string;
  externalLinkUrl?: string;
  fullLink?: string;
}
