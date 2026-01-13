import { IdentityUserDto, IdentityUserUpdateDto, IdentityUserCreateDto } from '@eleon/tenant-management-proxy';
import {
  Component,
  Input,
  OnInit,
  ViewChild,
  Output,
  EventEmitter,
} from "@angular/core";
import { LocalizedMessageService } from "@eleon/primeng-ui.lib";
import { catchError, finalize, firstValueFrom, from, map, Observable, of, switchMap, throwError } from "rxjs";
import { UserIsolationSettingsComponent } from "../../user-isolation-settings/user-isolation-settings.component";
import { UserOtpSettingsComponent } from "../../user-otp-settings/user-otp-settings.component";
import { PageStateService } from "@eleon/primeng-ui.lib";
import {
  CommonUserService,
  IdentitySettingDto,
  IdentitySettingService,
  UserSettingsService,
  UserSettingDto,
} from '@eleon/tenant-management-proxy';
import { ILocalizationService, IPermissionService, IApplicationConfigurationManager } from '@eleon/angular-sdk.lib';
// import { EmployeeDto } from '@vportal-ui/eleonsphere-proxy'
// import { EmploymentType } from '@vportal-ui/eleonsphere-proxy'
import { TwoFaNotificationType } from '@eleon/tenant-management-proxy';

import { Password } from "primeng/password";
import { ConfirmationService } from "primeng/api";
import { RadioButton } from "primeng/radiobutton";
import { generateTempGuid, handleError } from "@eleon/angular-sdk.lib";
import { UsersNotificationSettingsComponent } from "../users-notification-settings/users-notification-settings.component";

@Component({
  standalone: false,
  selector: "app-user-details-dialog",
  templateUrl: "./user-details-dialog.component.html",
  styleUrl: "./user-details-dialog.component.scss",
})
export class UserDetailsDialogComponent implements OnInit {
  public loading = false;
  public currentTabIx = 0;
  user: IdentityUserUpdateDto;
  newUser: IdentityUserCreateDto;
  nameInvalid: boolean = false;
  surnameInvalid: boolean = false;
  usernameInvalid: boolean = false;
  emailInvalid: boolean = false;
  passwordInvalid: boolean = false;
  isAddNewUser: boolean = false;
  title: string = "";
  activeTabIndex: number = 0;
  userId: string = "";
  newUserPassword: string = "";

  signInOptions: { value: string; name: string }[] = [];
  // @ViewChild(UserIsolationSettingsComponent)
  // userIsolationSettingsComponent: UserIsolationSettingsComponent;

  // @ViewChild("notificationSettings")
  // notificationSettings: UsersNotificationSettingsComponent;

  @ViewChild(UserOtpSettingsComponent)
  userOtpSettingsComponent: UserOtpSettingsComponent;

  @Input()
  editedUser: IdentityUserDto;

  @Input()
  public showDialog: boolean = false;

  @Output()
  saveEvent = new EventEmitter<boolean>();

  @Output()
  closeEvent = new EventEmitter<boolean>();

  @ViewChild('newPwdInput') newPwdInput: Password;
  
  //#region employee
  // employee: EmployeeDto;
  // localizedEmploymentTypes: { value: EmploymentType; name: string }[];
  // vendorEmpty: boolean = false;
  // EmploymentType = EmploymentType;
  // isEmployeeChanged:boolean = false;
  //#endregion

  reqPasswordLength: number = 6;
  reqPasswordLabel: string;
  showPasswordField: boolean = false;

  //custom settings
  userSetting: UserSettingDto = {};
  customOptions: { value: TwoFaNotificationType; name: string }[];
  customSettings: boolean = false;
  systemSettings: boolean = false;
  customOption: TwoFaNotificationType;
  settings: IdentitySettingDto[];
  selectedOption: string = 'systemSettings';
  userSettingsIsDirty: boolean = false;
  TwoFaNotificationType = TwoFaNotificationType;

  hasManagePermission: boolean = false;

  yesNoOptions: { label: string; value: boolean }[] = [];

  constructor(
    public identityUserService: CommonUserService,
    public msgService: LocalizedMessageService,
    public localizationService: ILocalizationService,
    private pageStateService: PageStateService,
    private confirmationService: ConfirmationService,
    private commonUserService: CommonUserService,
    public config: IApplicationConfigurationManager,
    private identitySettingService: IdentitySettingService,
    public permissionService: IPermissionService,
    private userSettingsService: UserSettingsService
  ) {}

  ngOnInit(): void {
    // Initialize the yes/no options
    this.yesNoOptions = [
      { label: this.localizationService.instant('Infrastructure::Yes'), value: true },
      { label: this.localizationService.instant('Infrastructure::No'), value: false },
    ];
    
    this.hasManagePermission = this.permissionService.getGrantedPolicy("AbpIdentity.Users.Create");

    // this.localizedEmploymentTypes = [
    //   EmploymentType.Subcontractor,
    //   EmploymentType.Regular,
    //   EmploymentType.Consultant,
    // ].map((value) => ({
    //   value: value,
    //   name: this.localizationService.instant(
    //     `Infrastructure::EmploymentType:${EmploymentType[value]}`
    //   ),
    // }));
    this.customOptions = [
      TwoFaNotificationType.Sms,
      TwoFaNotificationType.Email,
      TwoFaNotificationType.Mixed,
    ].map((value) => ({
      value: value,
      name: this.localizationService.instant(
        `Infrastructure::TwoFaNotificationType:${TwoFaNotificationType[value]}`
      ),
    }));

    this.signInOptions = [
      { value: 'systemSettings', name: this.localizationService.instant('TenantManagement::SignInSettings:SystemDefault') },
      { value: 'customSettings', name: this.localizationService.instant('TenantManagement::SignInSettings:Custom') },
    ];

    this.show(this.editedUser);
    this.loadSettings();
  }

  private loadSettings() {
    this.identitySettingService
      .getIdentitySettings()
      .subscribe((settings) => {
        var passwordLengthSettings = settings?.find(x=>x.name === "Abp.Identity.Password.RequiredLength");
        if(!!passwordLengthSettings){
          this.reqPasswordLength = parseFloat(passwordLengthSettings.value);
        }
        this.reqPasswordLabel = this.localizationService.instant("TenantManagement::User:PasswordValidation:Length", this.reqPasswordLength.toString());
        this.showPasswordField = settings?.find(x=>x.name === "PasswordEnable")?.value === "True" ? true : false || false;
      }
      );
  }
  
  public show(editedUser: IdentityUserDto = null): void {
    this.showDialog = true;
    if (editedUser != null) {
      this.title = this.localizationService.instant("TenantManagement::UserInfo");
      this.editedUser = editedUser;
      this.identityUserService.get(editedUser.id).subscribe((reply) => {
        this.user = Object.assign(
          {},
          reply
        ) as unknown as IdentityUserUpdateDto;
        this.userId = reply.id;
        //this.loadEmployee();
        this.loadUserSetting(reply.id);
      });
    } else {
      this.title = this.localizationService.instant(
        "TenantManagement::User:NewUser"
      );
      this.newUser = {} as IdentityUserCreateDto;
      this.isAddNewUser = true;
      this.newUser.email = "";
      this.newUser.userName = "";
      this.newUser.name = "";
      this.newUser.surname = "";
      this.newUser.password = "";
      this.newUser.isActive = true;
      this.newUser.lockoutEnabled = true;
      //this.loadEmployee();
      this.userSetting = {};
      this.userSetting.twoFaNotificationType = TwoFaNotificationType.None;
      this.customOption = TwoFaNotificationType.Email;
      this.systemSettings = true;
      this.selectedOption = 'systemSettings';
    }
  }

  public async save(): Promise<void> {
    try {
      if (this.isAddNewUser) {
        const valid = this.validationNewUser();
        if (!valid) return;
        this.addUser();
      } else {
        const valid = this.validationEditedUser();
        if (!valid) return;
        this.saveUser();
      }
    } catch {
      this.loading = false;
    }
  }

  saveUser() {
    if (this.pageStateService.isDirty || this.userOtpSettingsComponent?.isDirty) {
      this.loading = true;
      this.identityUserService
        .update(this.editedUser.id, this.user)
        .pipe(
          finalize(() => (this.loading = false)),
					handleError(err => {
						this.msgService.error(err.message || 'TenantManagement::User:UpdateFailed');
						try{
							this.identityUserService.get(this.editedUser.id).subscribe((reply) => { this.user.concurrencyStamp = reply.concurrencyStamp; });
						}
						catch (error){
							console.error(error);
						}
					})
        )
        .subscribe(async (reply) => {
          this.loading = false;
          if (reply) {
            this.editedUser = reply;
            this.user = Object.assign(
              {},
              reply
            ) as unknown as IdentityUserUpdateDto;
            if (this.userOtpSettingsComponent?.isDirty) {
              const checkSettings = await this.saveSettings();
              if (!checkSettings) {
                return;
              }
            }
            
            if (this.newUserPassword?.length > 0) {
              const success = await this.setNewPassport();
              if (!success) {
                return;
              }
            }

            if(this.userSettingsIsDirty){
              const saveIdentity = await this.saveSignInSettings();
              if (!saveIdentity) {
                return;
              }
            }

            // if (this.notificationSettings.isDirty) {
            //   const saveNotification = await this.notificationSettings.save();
            //   if (!saveNotification) {
            //     return;
            //   }
            // }

            this.msgService.success("TenantManagement::UserSuccessfullyUpdated");
            this.closeDialog();
          }
        });
    } else {
      this.closeDialog();
    }
  }
  

  addUser() {
    if (this.pageStateService.isDirty || this.userOtpSettingsComponent?.isDirty) {
      this.loading = true;
      this.identityUserService
        .create(this.newUser)
        .pipe(
          switchMap(async (identityUser) => {
            this.editedUser = identityUser;
            this.user = Object.assign(
              {},
              identityUser
            ) as unknown as IdentityUserUpdateDto;
            this.userId = identityUser.id;
            return of(true);
          }),
          switchMap(async () => {
            if (this.userOtpSettingsComponent?.isDirty) {
              return from(this.saveSettings());
            } else {
              return of(true);
            }
          }),
          switchMap(async () => {
            if (this.userSettingsIsDirty) {
              return from(this.saveSignInSettings());
            } else {
              return of(true);
            }
          }),
          handleError(err => {
						this.msgService.error(err.message || 'TenantManagement::User:UpdateFailed');
					}),
          finalize(() => (this.loading = false))
        )
        .subscribe((success) => {
          if (success) {
            this.msgService.success("TenantManagement::UserAdded:Success");
            this.closeDialog();
          }
        });
    } else {
      this.closeDialog();
    }
  }
  
  

  cancel(): void {
    if (this.pageStateService.isDirty) {
      this.confirmationService.confirm({
        message: this.localizationService.instant("Infrastructure::ConfirmLeavingDirty"),
        accept: ()=>{
          this.closeDialog();
        },
        acceptLabel: this.localizationService.instant("Infrastructure::Yes"),
        rejectLabel: this.localizationService.instant("Infrastructure::Cancel"),
        acceptButtonStyleClass: "p-button-md p-button-raised p-button-text p-button-info",
      acceptIcon: "pi pi-check",
        rejectButtonStyleClass: "p-button-md p-button-raised p-button-text p-button-danger",
      rejectIcon: "pi pi-times",
      }
      );
    } else {
      this.closeDialog();
    }
  }

  closeDialog() {
    this.pageStateService.setNotDirty();
    this.isAddNewUser = false;
    this.newUser = null;
    this.user = null;
    this.resetValidators();
    // this.employee = {} as EmployeeDto;
    // this.employee.employeeAccountCode = "";
    // this.employee.externalEmployeeNumber = "";
    // this.employee.externalEmployeeNumber = "";
    // this.employee.vendorItemCode = "";
    // this.employee.employmentType = null;
    this.loading = false;
    //this.userIsolationSettingsComponent.isDirty = false;
    if (this.userOtpSettingsComponent) {
      this.userOtpSettingsComponent.isDirty = false;
    }
    // this.isEmployeeChanged = false;
    this.showDialog = false;
    this.closeEvent.emit(true);
  }

  validationEditedUser() {
    let errors: string[] = [];

    if(this.showPasswordField){
      let isPassportValid = this.passwordValidate();
      if (!isPassportValid) return false;
    }

    if (!this.user?.userName?.length) {
      this.usernameInvalid = true;
      errors.push("TenantManagement::User:UsernameEmpty");
    }

    if (!this.user?.name?.length) {
      this.nameInvalid = true;
      errors.push("TenantManagement::User:NameEmpty");
    }

    if (!this.user?.surname?.length) {
      this.surnameInvalid = true;
      errors.push("TenantManagement::User:SurnameEmpty");
    }

    if (!this.user?.email?.length) {
      this.emailInvalid = true;
      errors.push("TenantManagement::User:EmailEmpty");
    }

    if(this.user?.email?.length > 0){
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(this.user?.email)) {
        this.emailInvalid = true;
        errors.push("TenantManagement::User:EmailInvalid");
      }
    }

    if (!errors.length) return true;
    for (const error of errors) {
      this.msgService.error(error);
    }
    return false;
  }

  validationNewUser() {
    let errors: string[] = [];

    if (!this.newUser?.userName?.length) {
      this.usernameInvalid = true;
      errors.push("TenantManagement::User:UsernameEmpty");
    }

    if (!this.newUser?.name?.length) {
      this.nameInvalid = true;
      errors.push("TenantManagement::User:NameEmpty");
    }

    if (!this.newUser?.surname?.length) {
      this.surnameInvalid = true;
      errors.push("TenantManagement::User:SurnameEmpty");
    }

    if (!this.newUser?.email?.length) {
      this.emailInvalid = true;
      errors.push("TenantManagement::User:EmailEmpty");
    }

    if (!this.newUser?.password?.length) {
      this.passwordInvalid = true;
      errors.push("TenantManagement::User:PasswordEmpty");
    }

    this.passwordInvalid = !this.passwordValidate();
    if (this.passwordInvalid){
      errors.push("TenantManagement::User:PasswordEmpty");
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(this.newUser?.email)) {
      this.emailInvalid = true;
      errors.push("TenantManagement::User:EmailInvalid");
    }

    if (!errors.length) return true;

    for (const error of errors) {
      this.msgService.error(error);
    }
    return false;
  }

  passwordValidate() {
    const password = this.isAddNewUser
      ? this.newUser.password
      : this.newUserPassword;
    if (
      !this.isAddNewUser &&
      (!password?.length || (password?.length > 0 && !password.trim()?.length))
    ) {
      return true;
    }

    if (
      this.isAddNewUser &&
      (!password?.length || (password?.length > 0 && !password.trim()?.length))
    ) {
      this.msgService.error("TenantManagement::User:PasswordValidation:Length", this.reqPasswordLength.toString())
      return false;
    }

    if (typeof password !== "string" || password.length < this.reqPasswordLength) {
      this.msgService.error("TenantManagement::User:PasswordValidation:Length", this.reqPasswordLength.toString())
      return false;
    }

    if (!/\d/.test(password)) {
      this.msgService.error("TenantManagement::User:PasswordValidation:Digit");

      return false;
    }

    if (!/[A-Z]/.test(password)) {
      this.msgService.error(
        "TenantManagement::User:PasswordValidation:Uppercase"
      );

      return false;
    }

    if (!/\W|_/.test(password)) {
      this.msgService.error(
        "TenantManagement::User:PasswordValidation:AlphanumericCharacter"
      );
      return false;
    }

    return true;
  }

  resetValidators() {
    this.nameInvalid = false;
    this.surnameInvalid = false;
    this.usernameInvalid = false;
    this.passwordInvalid = false;
    this.emailInvalid = false;
  }

  public async saveSettings(): Promise<boolean> {
    this.loading = true;
    let isSuccess = false;
    try {
      const components: Array<{ isDirty: boolean; save(): Observable<boolean> }> = [];
      //this.userIsolationSettingsComponent,
      if (this.userOtpSettingsComponent) {
        components.push(this.userOtpSettingsComponent);
      }

      for (let i = 0; i < components.length; i++) {
        if(components[i].isDirty){
          const saveResult = await firstValueFrom(components[i].save());
          if (!saveResult) {
            this.activeTabIndex = 2;
            isSuccess = false;
            this.loading = false;
            return false;
          } else {
            isSuccess = true;
            this.msgService.success(
              "TenantManagement::TenantSettings:UserIsolationSettings:UserIsolationSettingsSaved"
            );
          }
        }
      }
      this.loading = false;
      return isSuccess;
    } catch (error) {
      this.loading = false;
      console.log(error);
      this.msgService.error(error);
      return false;
    }
  }

  //#region  Sign In Settings

  loadUserSetting(userId){
    this.loading = true;
    this.userSettingsService.getUserSettingByUserIdByUserId(userId)
    .pipe(finalize(() => this.loading = false))
    .subscribe((reply) => {
      if (reply) {
        this.userSetting = reply;
        this.customOption = this.userSetting.twoFaNotificationType;
        if (this.userSetting.twoFaNotificationType == TwoFaNotificationType.None || this.userSetting.twoFaNotificationType == null) {
          this.customSettings = false;
          this.systemSettings = true;
          this.selectedOption = 'systemSettings';
        } else {
          this.customSettings = true;
          this.systemSettings = false;
          this.selectedOption = 'customSettings';
        }
      }
      else{
        this.userSetting = {};
        this.userSetting.twoFaNotificationType = TwoFaNotificationType.None;
        this.customOption = TwoFaNotificationType.Email;
        this.systemSettings = true;
        this.selectedOption = 'systemSettings';
        this.customSettings = false;
      }
    });
  }

  onOptionChange(option: string) {
    if (option === 'customSettings' && !this.customSettings) {
     this.customSettings = true;
     this.systemSettings = false;
     this.selectedOption = 'customSettings';
   }  else if (option === 'systemSettings'&& !this.systemSettings) {
     this.customSettings = false;
     this.systemSettings = true;
     this.selectedOption = 'systemSettings';
   } else {
     this.customSettings = false;
     this.systemSettings = true;
     this.selectedOption = 'systemSettings';
   }
   this.userSettingsIsDirty = true;
   this.setDirty();
 }

  public async saveSignInSettings(): Promise<boolean> {
    let isSuccess = false;
    try {
      if(this.customSettings && (this.customOption == TwoFaNotificationType.None || this.customOption == null)){
        this.msgService.error("TenantManagement::User:SignInSettings:CustomSettingsEmpty");
        return false;
      }
      let settingsToUpdate: UserSettingDto = {} as UserSettingDto;
      settingsToUpdate.userId =this.userSetting.id?.length > 0 ? this.userSetting.userId :  this.userId;
      settingsToUpdate.id = this.userSetting.id?.length > 0 ? this.userSetting.id : generateTempGuid();
      settingsToUpdate.twoFaNotificationType = this.systemSettings ? TwoFaNotificationType.None : this.customOption;
      this.loading = true;
      const observable = this.userSettingsService.setUserSettingsByUserSettingDto(settingsToUpdate)
      .pipe(finalize(() => this.loading = false));

			observable
      .subscribe((reply) => {
        this.userSettingsIsDirty = false;
        if (reply) {
          isSuccess = true;
          this.msgService.success("TenantManagement::User:SignInSettings:Success");
        } else {
          isSuccess = false;
          this.msgService.error("TenantManagement::User:SignInSettings:Error");
        }
      });
			await firstValueFrom(observable);
      return isSuccess;
    } catch (error) {
      this.loading = false;
      this.msgService.error(error);
      return false;
    }
  }

  //#endregion
  
  setDirty() {
    this.pageStateService.setDirty();
  }

  async setNewPassport(): Promise<boolean> {
    this.loading = true;
    try {
      let reply: any;
      reply = await this.commonUserService
          .setNewPasswordByUserIdAndNewPassword(this.userId, this.newUserPassword)
          .toPromise();
      this.loading = false;
      if (reply) {
        this.msgService.success("TenantManagement::User:SetNewPassword:Success");
        return true;
      } else {
        this.msgService.error("TenantManagement::User:SetNewPassword:Error");
        return false;
      }
    } catch (error) {
      this.loading = false;
      this.msgService.error(error);
      return false;
    }
  }

  async copyId(id: string, event: MouseEvent) {
    if (!id) return;

    await navigator.clipboard.writeText(id);
  }

  //#region employee

  // employeeChanged(){
  //   this.isEmployeeChanged = true;
  // }

  // isRegularType(): boolean {
  //   return this.employee?.employmentType == EmploymentType.Regular;
  // }

  // loadEmployee() {
  //   this.employee = {} as EmployeeDto;
  //   this.employee.employeeAccountCode = "0";
  //   this.employee.externalEmployeeNumber = "";
  //   this.employee.externalEmployeeNumber = "";
  //   this.employee.vendorItemCode = "";
  //   this.employee.employmentType = EmploymentType.Regular;
  //   if (this.userId?.length > 0) {
  //     this.loading = true;
  //     this.employeeService
  //       .getEmployeeDataByUserIdById(this.userId)
  //       .subscribe((reply) => {
  //         if (reply) {
  //           this.employee = reply;
  //         }
  //         this.loading = false;
  //       });
  //   }
  // }

  // onEmploymentTypeChange() {
  //   if (this.employee.employmentType != EmploymentType.Subcontractor) {
  //     this.vendorEmpty = false;
  //   }
  // }

  // resetVendorValidation() {
  //   this.vendorEmpty = false;
  // }

  // async saveEmployeeDetails(): Promise<boolean> {
  //   if (
  //     this.employee.employmentType == EmploymentType.Subcontractor &&
  //     !this.employee.vendorItemCode.length
  //   ) {
  //     this.vendorEmpty = true;
  //     this.msgService.error("Infrastructure::VendorItemCodeEmpty");
  //     return false;
  //   }
  //   this.loading = true;
  //   try {
  //     this.employee.userId = this.userId;
  //     let reply: any;
  //     if (!this.employee.id) {
  //       reply = await this.employeeService
  //         .insertEmployeeDataByData(this.employee)
  //         .toPromise();
  //     } else {
  //       reply = await this.employeeService
  //         .updateEmployeeDataByData(this.employee)
  //         .toPromise();
  //     }
  //     this.loading = false;
  //     if (reply) {
  //       this.employee = reply;
  //       // this.msgService.success("Infrastructure::EmployeeSuccessfullyUpdated");
  //       return true;
  //     } else {
  //       this.msgService.error("Infrastructure::ErrorWhileUpdatingEmployee");
  //       return false;
  //     }
  //   } catch (error) {
  //     this.loading = false;
  //     this.msgService.error(
  //       "Infrastructure::ErrorWhileUpdatingEmployee: " + error.message
  //     );
  //     return false;
  //   }
  // }

  //#endregion
}
