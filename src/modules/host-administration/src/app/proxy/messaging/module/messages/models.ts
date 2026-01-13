import type { FeatureGroupDescription } from '../../../common/module/permissions/models';

export interface InitializeMicroserviceMsg extends VportalEvent {
  requestId?: string;
  info: MicroserviceInfoEto;
}

export interface MicroserviceInfoEto {
  serviceId?: string;
  displayName?: string;
  features: FeatureGroupDescription[];
}

export interface VportalEvent {
  tenantId?: string;
  tenantName?: string;
}
