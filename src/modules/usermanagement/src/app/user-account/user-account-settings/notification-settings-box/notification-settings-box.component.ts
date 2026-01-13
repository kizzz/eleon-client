import { ILocalizationService, IApplicationConfigurationManager } from '@eleon/angular-sdk.lib';
import {
  UserOtpSettingsDto,
  UserOtpSettingsService,
  UserOtpType,
} from '@eleon/tenant-management-proxy';
import { Component, Input, OnInit } from "@angular/core";
import { LocalizedMessageService } from "@eleon/primeng-ui.lib";
import { finalize } from 'rxjs'

@Component({
  standalone: false,
  selector: 'app-notification-settings-box',
  templateUrl: './notification-settings-box.component.html',
  styleUrl: './notification-settings-box.component.scss'
})
export class NotificationSettingsBoxComponent implements OnInit{
  loading = false;
UserOtpType = UserOtpType;
	otpSettings: UserOtpSettingsDto = {} as UserOtpSettingsDto;

	typeOptions: { name: string, value: UserOtpType}[] = [];
	phoneInvalid: boolean = false;
  emailInvalid: boolean = false;

  title: string = '';
  userId: string = '';

  constructor(
    private msgService: LocalizedMessageService,
    private localizationService: ILocalizationService,
    private config: IApplicationConfigurationManager,
		private userOtpSettings: UserOtpSettingsService
    ) {}

  ngOnInit(): void {
    this.userId = this.config.getAppConfig().currentUser?.id;
    this.title = this.localizationService.instant('TenantManagement::Settings:Notification');
		
		this.typeOptions.push({name: this.localizationService.instant('Infrastructure::TwoFaNotificationType:Email'), value: UserOtpType.Email });
		this.typeOptions.push({name: this.localizationService.instant('Infrastructure::TwoFaNotificationType:Sms'), value: UserOtpType.Sms });
		this.typeOptions.push({name: this.localizationService.instant('Infrastructure::TwoFaNotificationType:Mixed'), value: UserOtpType.Mixed });

		this.loading = true;
		this.userOtpSettings.getUserOtpSettingsByUserId(this.userId)
			.pipe(finalize(() => this.loading = false))
			.subscribe(reply =>{
        this.otpSettings = reply;
      })
  }

  save() {
    const valid = this.validation();
		if (!valid) return;
		this.loading = true;
		this.userOtpSettings.setUserOtpSettingsByUserOtpSettings(this.otpSettings)
		.pipe(finalize(() => this.loading = false))
		.subscribe(res => {
			if (res){
				this.msgService.success("TenantManagement::Settings:Update:Success")
			}
			else{
				this.msgService.error("TenantManagement::Settings:Update:Fail")
			}
		})
  }

  validation(){
    let errors: string[] = [];


    if (this.otpSettings.userOtpType == UserOtpType.Email || this.otpSettings.userOtpType == UserOtpType.Mixed) {
			if (!this.otpSettings.otpEmail?.length){
				this.emailInvalid = true;
      	errors.push('TenantManagement::User:EmailEmpty');
			}
			
			const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailPattern.test(this.otpSettings.otpEmail)) {
				this.emailInvalid = true;
				errors.push('TenantManagement::User:EmailInvalid');
			}
    }

		if (this.otpSettings.userOtpType == UserOtpType.Sms || this.otpSettings.userOtpType == UserOtpType.Mixed){
			if (!this.otpSettings.otpPhoneNumber?.length){
				this.phoneInvalid = true;
      	errors.push('TenantManagement::User:PhoneEmpty');
			}
		}

    if (!errors.length) return true;
    for (const error of errors) {
      this.msgService.error(error);
    }
    return false;
  }

  resetValidators(){
    this.phoneInvalid = false;
    this.emailInvalid = false;
  }
}
