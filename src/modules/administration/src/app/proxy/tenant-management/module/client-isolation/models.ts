
export interface SetUserIsolationRequestDto {
  userId?: string;
  enabled: boolean;
  clientCertificateBase64?: string;
  password?: string;
}

export interface ValidateClientIsolationDto {
}
