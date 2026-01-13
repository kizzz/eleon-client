import {
  UserOtpSettingsService,
  UserOtpSettingsDto,
  UserOtpType,
} from '@eleon/tenant-management-proxy';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from "@angular/core";
import { IApplicationConfigurationManager } from '@eleon/angular-sdk.lib';
import { LocalizedMessageService } from "@eleon/primeng-ui.lib";
import { finalize } from 'rxjs'
import { firstValueFrom } from 'rxjs';

import { ILocalizationService } from '@eleon/angular-sdk.lib';
@Component({
  standalone: false,
  selector: 'app-users-notification-settings',
  templateUrl: './users-notification-settings.component.html',
  styleUrl: './users-notification-settings.component.scss'
})
export class UsersNotificationSettingsComponent implements OnInit, OnChanges{
  loading = false;
	UserOtpType = UserOtpType;
	otpSettings: UserOtpSettingsDto = {} as UserOtpSettingsDto;

	typeOptions: { name: string, value: UserOtpType}[] = [];
	phoneInvalid: boolean = false;
  emailInvalid: boolean = false;

  title: string = '';
	@Input()
  userId: string = '';

  _isDirty: boolean = false;
  public get isDirty(): boolean {
    return this._isDirty;
  }

  constructor(
    private msgService: LocalizedMessageService,
    private localizationService: ILocalizationService,
    private config: IApplicationConfigurationManager,
		private userOtpSettings: UserOtpSettingsService,
    ) {}

		ngOnInit(): void {
			this.title = this.localizationService.instant('TenantManagement::Settings:Notification');
			this.typeOptions.push({name: this.localizationService.instant('Infrastructure::TwoFaNotificationType:Email'), value: UserOtpType.Email });
			this.typeOptions.push({name: this.localizationService.instant('Infrastructure::TwoFaNotificationType:Sms'), value: UserOtpType.Sms });
			this.typeOptions.push({name: this.localizationService.instant('Infrastructure::TwoFaNotificationType:Mixed'), value: UserOtpType.Mixed });
		}

  ngOnChanges(changes: SimpleChanges): void {
		if (changes['userId'] && changes['userId'].currentValue){
			this.loading = true;
			this.userOtpSettings.getUserOtpSettingsByUserId(this.userId)
				.pipe(finalize(() => this.loading = false))
				.subscribe(reply =>{
					this.otpSettings = reply;
					console.log("REPLY: ", reply);
				})
		}
  }

  public async save() : Promise<boolean> {
    const valid = this.validation();
		if (!valid) return Promise.resolve(false);
		try{
      this.loading = true;
      const obs = this.userOtpSettings.setUserOtpSettingsByUserOtpSettings(this.otpSettings)
      .pipe(finalize(() => this.loading = false));
      obs
      .subscribe(res => {
        if (res){
          this.msgService.success("TenantManagement::Settings:Update:Success")
        }
        else{
          this.msgService.error("TenantManagement::Settings:Update:Fail")
        }
      })
      await firstValueFrom(obs);
      return Promise.resolve(true);
    }
    catch (error) {
      this.msgService.error('TenantManagement::User:SaveError');
      return Promise.resolve(false);
    }
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
