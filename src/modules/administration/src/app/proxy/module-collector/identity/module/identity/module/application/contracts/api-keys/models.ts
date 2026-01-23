import type { ApiKeyType } from '../../../../../../../../common/module/constants/api-key-type.enum';

export interface ApiKeyRequestDto {
  keyTypes: ApiKeyType[];
}

export interface CreateApiKeyDto {
  name?: string;
  refId?: string;
  type: ApiKeyType;
  expiresAt?: string;
  allowAuthorize: boolean;
  data?: string;
}

export interface IdentityApiKeyDto {
  id?: string;
  tenantId?: string;
  name?: string;
  refId?: string;
  key?: string;
  invalidated: boolean;
  type: ApiKeyType;
  expiresAt?: string;
  creationTime?: string;
  allowAuthorize: boolean;
  keySecret?: string;
  data?: string;
}

export interface UpdateApiKeyDto {
  id?: string;
  name?: string;
  refId?: string;
  allowAuthorize: boolean;
  data?: string;
}
