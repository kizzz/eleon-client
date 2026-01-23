
export interface UserIsolationSettingsDto {
  userId?: string;
  userIsolationEnabled: boolean;
  userCertificateHash?: string;
  tenantIsolationEnabled: boolean;
}
