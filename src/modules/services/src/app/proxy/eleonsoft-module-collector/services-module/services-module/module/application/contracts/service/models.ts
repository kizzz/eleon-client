
export interface ServiceDto {
  id?: string;
  serviceName?: string;
  serviceLocation?: string;
  registrationDateUtc?: string;
  lastStartupDateUtc?: string;
  lastStatusUpdateDateUtc?: string;
  isSystem: boolean;
  manifest?: string;
  manifestHash?: string;
  isActive: boolean;
  lastManifestUpdateUtc?: string;
}
