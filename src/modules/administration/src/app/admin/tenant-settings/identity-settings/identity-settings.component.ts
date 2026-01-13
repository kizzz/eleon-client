import { ILocalizationService, ITemplatingDialogService, TemplateType } from '@eleon/angular-sdk.lib';
import { Component, OnInit } from "@angular/core";
import { IdentitySettingService } from '@eleon/tenant-management-proxy';
import {
  IdentitySettingDto,
  IdentitySettingType,
} from '@eleon/tenant-management-proxy';
import { LocalizedMessageService } from "@eleon/primeng-ui.lib";
import { PageStateService } from "@eleon/primeng-ui.lib";
import { Observable, finalize, map, of } from "rxjs";

interface SettingGroup {
  name: string;
  settings: IdentitySettingDto[];
}

@Component({
  standalone: false,
  selector: "app-identity-settings",
  templateUrl: "./identity-settings.component.html",
  styleUrl: "./identity-settings.component.scss",
})
export class IdentitySettingsComponent implements OnInit {
  public settings: IdentitySettingDto[];
  public settingGroups: SettingGroup[];
  public loading = false;
  public SettingType = IdentitySettingType;
  title = "TenantManagement::TenantSettings:IdentitySettings";
  twoFactorAuthOptions: { value: string; name: string }[] = [];
	smsProviderOptions: { value: string; name: string }[] = [];
  twoFactorTemplateContent = '';
  templateDialogVisible = false;
  templateDialogName: string | null = null;
  templateDialogType: TemplateType | null = null;
  templateDialogHeader = '';

  constructor(
    private identitySettingService: IdentitySettingService,
    public state: PageStateService,
    private localizationService: ILocalizationService,
    private msgService: LocalizedMessageService,
    private templateService: ITemplatingDialogService
  ) {}

  public ngOnInit(): void {
    this.twoFactorAuthOptions.push({name: this.localizationService.instant("TenantManagement::Email"), value: "email"});
    // this.twoFactorAuthOptions.push({name: this.localizationService.instant("TenantManagement::SMS"), value: "sms"});
    this.twoFactorAuthOptions.push({name: this.localizationService.instant("TenantManagement::Mixed"), value: "mixed"});
		this.smsProviderOptions.push( {name: this.localizationService.instant("TenantManagement::DEFAULT"), value: 'DEFAULT'});
		this.smsProviderOptions.push( {name: this.localizationService.instant("TenantManagement::CUSTOM"), value: 'CUSTOM'});

    this.loadSettings().subscribe();
    this.loadTwoFactorTemplatePreview();
  }

  public save(): Observable<void> {
    let twoFactorAuth = this.settings.find(x=>x.name == "TwoFactorAuthenticationEnable");
    let twoFactorAuthOptionVal = this.settings.find(x=>x.name == "TwoFactorAuthenticationOption");
    let passwordEnable = this.settings.find(x=>x.name == "PasswordEnable");

    if(twoFactorAuth.value === "False" && passwordEnable.value === "False"){
      this.msgService.error("TenantManagement::SignInNotSelected");
      return of();;
    }

    if(twoFactorAuth.value === "True" && !twoFactorAuthOptionVal.value?.length){
      this.msgService.error("TenantManagement::TwoFactorAuthenticationOptionNotSelected");
      return of();;
    }
    return this.identitySettingService
      .setIdentitySettingsByRequest({
        settings: this.settings,
      })
      .pipe(finalize(() => (this.state.setNotDirty())))
      .pipe(map((x) => {}))
  }

  public reset(): Observable<void> {
    return this.loadSettings();
  }

  public getColumnClass(row: IdentitySettingDto): string {
    if (row.type === IdentitySettingType.Boolean) {
      return "col-12";
    }

    return "col-6 lg:col-6";
  }

  private loadSettings(): Observable<void> {
    this.loading = true;
    return this.identitySettingService
      .getIdentitySettings()
      .pipe(finalize(() => {
        this.loading = false;
        this.state.setNotDirty();
      }))
      .pipe(
        map((settings) => {
          this.settings = settings;
          this.settingGroups = [];
          for (const setting of settings) {
            const group =
              this.settingGroups.find((x) => x.name === setting.groupName) ??
              this.settingGroups[
                this.settingGroups.push({
                  name: setting.groupName,
                  settings: [],
                }) - 1
              ];

            group.settings.push(setting);
          }
          this.loadTwoFactorTemplatePreview();
        })
      );
  }

	showCommonStringInput(settingName: string){
		return settingName !== 'TwoFactorAuthenticationOption' && settingName !== 'SmsProviderOption';
	}

  showRequaredMark(setting: IdentitySettingDto){
    if(!setting) return false;

    if(setting?.name === 'Abp.Identity.Password.RequiredLength' || setting?.name === 'Abp.Identity.Password.RequiredUniqueChars') return true;

    let groupPswRenew = this.settingGroups?.filter(x=>x.name === 'TenantManagement::PermissionGroupCategory:PasswordRenew');
      if(groupPswRenew?.[0] && groupPswRenew[0].settings?.length > 0){
        if(groupPswRenew[0].settings.filter(x => x.name == 'Abp.Identity.Password.ForceUsersToPeriodicallyChangePassword' && x.value == 'True')?.length > 0 &&
          setting?.name == 'Abp.Identity.Password.PasswordChangePeriodDays'){
            return true;
          }
      }
      
    return false;
  }

  showSection(group: SettingGroup): boolean{
    //password sections
    if(!!group.name.length && (group.name === "TenantManagement::PermissionGroupCategory:Password" || group.name === "TenantManagement::PermissionGroupCategory:PasswordRenew")){
      let signInSetting = this.settingGroups.find(x=>x.name === "TenantManagement::PermissionGroupCategory:SignIn");
      let passwordEnableSetting = signInSetting.settings.find(c=>c.name === "PasswordEnable")
      if(passwordEnableSetting.value === "True"){
        return true;
      }
      else{
        return false;
      }//2FA Settings sections
    } else if(!!group.name.length && group.name === "TenantManagement::PermissionGroupCategory:TwoFactorAuthenticationSettings"){
      let signInSetting = this.settingGroups.find(x=>x.name === "TenantManagement::PermissionGroupCategory:SignIn");
      let twoFactorAuthenticationEnableSetting = signInSetting.settings.find(c=>c.name === "TwoFactorAuthenticationEnable")
      if(twoFactorAuthenticationEnableSetting.value === "True"){
        return true;
      }
      else{
        return false;
      }
    }
    return true;
  }

  onBooleanChange(setting: IdentitySettingDto, event: any): void {
    this.state.setDirty();
    if (setting.name === 'TwoFactorAuthenticationEnable' && event.checked === 'True') {
      this.loadTwoFactorTemplatePreview();
    }
  }

  get isTwoFactorEnabled(): boolean {
    const signInSetting = this.settingGroups?.find(x => x.name === "TenantManagement::PermissionGroupCategory:SignIn");
    const twoFactorAuthenticationEnableSetting = signInSetting?.settings?.find(c => c.name === "TwoFactorAuthenticationEnable");
    return twoFactorAuthenticationEnableSetting?.value === "True";
  }

  public openTwoFactorTemplateDialog(name: string): void {
    this.templateDialogName = name;
    this.templateDialogType = TemplateType.Notification;
    this.templateDialogHeader = this.localizationService.instant('TenantManagement::TwoFactorEmailTemplate');
    this.templateDialogVisible = true;

    this.templateService.openCreateTemplateDialog(this.templateDialogHeader, this.templateDialogName, this.templateDialogType, this.templateDialogType, (template) => {
      this.onTemplateSaved(template);
      this.templateDialogVisible = false;
    });
  }

  onTemplateDialogVisibleChange(event: boolean): void {
    this.templateDialogVisible = event;
    if (!event) {
      this.templateDialogName = null;
      this.templateDialogType = null;
      this.templateDialogHeader = '';
    }
  }

  onTemplateSaved(_: any): void {
    this.loadTwoFactorTemplatePreview();
  }

  private loadTwoFactorTemplatePreview(): void {
    if (!this.isTwoFactorEnabled) {
      this.twoFactorTemplateContent = '';
      return;
    }

    this.loadTemplate('2FA Email', TemplateType.Notification).subscribe({
      next: (template) => this.twoFactorTemplateContent = template?.templateContent ?? '',
      error: () => this.twoFactorTemplateContent = ''
    });
  }

  private loadTemplate(name: string, type: TemplateType): Observable<any> {
    return this.templateService.loadPreviewTemplate(name, type);
  }
}
