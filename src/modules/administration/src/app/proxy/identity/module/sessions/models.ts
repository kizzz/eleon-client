
export interface UserSessionDto {
  id?: string;
  userId?: string;
  device?: string;
  ipAddress?: string;
  deviceInfo: object;
  browser?: string;
  signInDate?: string;
  lastAccessTime?: string;
  expiration?: string;
}
