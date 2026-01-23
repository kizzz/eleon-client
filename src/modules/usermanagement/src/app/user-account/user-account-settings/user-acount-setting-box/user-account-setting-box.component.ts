import { ProfileDto, IProfileService } from '@eleon/angular-sdk.lib';
import { Component, Input, OnInit } from "@angular/core";
import { IApplicationConfigurationManager } from '@eleon/angular-sdk.lib';
import { LocalizedMessageService } from "@eleon/primeng-ui.lib";

import { ILocalizationService } from '@eleon/angular-sdk.lib';
@Component({
  standalone: false,
  selector: 'app-user-account-setting-box',
  templateUrl: './user-account-setting-box.component.html',
  styleUrl: './user-account-setting-box.component.scss'
})
export class UserAccountSettingBoxComponent implements OnInit{
  public loading = false;
  user: ProfileDto;
  nameInvalid: boolean = false;
  surnameInvalid: boolean = false;
  usernameInvalid: boolean = false;
  emailInvalid: boolean = false;
  title: string = '';
  userId: string = '';

  @Input()
  enableEmail: boolean = true;

  @Input()
  enableUserName: boolean = true;

  constructor(
    private msgService: LocalizedMessageService,
    private localizationService: ILocalizationService,
    private config: IApplicationConfigurationManager,
    private profileService: IProfileService
    ) {}

  ngOnInit(): void {
    this.userId = this.config.getAppConfig().currentUser?.id;
    this.title = this.localizationService.instant('TenantManagement::Edit');

    this.profileService.get().subscribe(profile => {
      this.user = profile;
    });
  }

  save() {
    try {
      const valid = this.validation();
      if (!valid) return;
      this.loading = true;
      this.profileService.update(this.user).subscribe(reply => {
        if (reply){
          this.msgService.success('TenantManagement::ProfileSuccessfullyUpdated');
          this.user = reply;
        }
      });
    } 
    finally {
      this.loading = false;
    }
  }

  validation(){
    let errors: string[] = [];

    if (!this.user?.userName?.length) {
      this.usernameInvalid = true;
      errors.push('TenantManagement::User:UsernameEmpty');
    }

    if (!this.user?.name?.length) {
      this.nameInvalid = true;
      errors.push('TenantManagement::User:NameEmpty');
    }

    if (!this.user?.surname?.length) {
      this.surnameInvalid = true;
      errors.push('TenantManagement::User:SurnameEmpty');
    }

    if (!this.user?.email?.length) {
      this.emailInvalid = true;
      errors.push('TenantManagement::User:EmailEmpty');
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(this.user?.email)) {
      this.emailInvalid = true;
      errors.push('TenantManagement::User:EmailInvalid');
    }

    if (!errors.length) return true;
    for (const error of errors) {
      this.msgService.error(error);
    }
    return false;
  }

  resetValidators(){
    this.nameInvalid = false;
    this.surnameInvalid = false;
    this.usernameInvalid = false;
    this.emailInvalid = false;
  }
}
