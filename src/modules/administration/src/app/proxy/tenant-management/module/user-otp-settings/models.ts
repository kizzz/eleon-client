import type { UserOtpType } from '../../../common/module/constants/user-otp-type.enum';

export interface UserOtpSettingsDto {
  userOtpType: UserOtpType;
  otpEmail?: string;
  otpPhoneNumber?: string;
  userId?: string;
}
