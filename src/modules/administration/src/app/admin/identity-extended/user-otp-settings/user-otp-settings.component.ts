import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { IdentityUserDto } from '@eleon/tenant-management-proxy';
import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from "@angular/core";
import { UserOtpType } from '@eleon/tenant-management-proxy';
import { UserOtpSettingsService } from '@eleon/tenant-management-proxy';
import { UserOtpSettingsDto } from '@eleon/tenant-management-proxy';
import { Observable, of, tap, finalize } from "rxjs";
import {
  LocalizedEnumValue,
  mapEnumToLocalizedList,
} from "@eleon/primeng-ui.lib";
import { LocalizedMessageService } from "@eleon/primeng-ui.lib";
import {
  ValidationRuleSet,
  ValidationService,
  createValidationState,
} from "@eleon/primeng-ui.lib";

type OtpSettingsValidators = {
  phoneNumber: boolean;
  email: boolean;
};

interface OtpSettingsData extends UserOtpSettingsDto {
  validators: OtpSettingsValidators;
}

const OtpSettingsValidationRules: ValidationRuleSet<
  OtpSettingsData,
  OtpSettingsValidators
> = {
  phoneNumber: {
    validator: (x) =>
      [UserOtpType.Sms, UserOtpType.Mixed].includes(x.userOtpType)
        ? !!x.otpPhoneNumber?.length
        : true,
    message: "TenantManagement::OtpSettings:Errors:MobileNumberRequired",
  },
  email: {
    validator: (x) =>
      [UserOtpType.Email, UserOtpType.Mixed].includes(x.userOtpType)
        ? !!x.otpEmail?.length && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x.otpEmail)
        : true,
    message: "TenantManagement::OtpSettings:Errors:EmailRequired",
  },
};

@Component({
  standalone: false,
  selector: "app-user-otp-settings",
  templateUrl: "./user-otp-settings.component.html",
  styleUrls: ["./user-otp-settings.component.scss"],
})
export class UserOtpSettingsComponent implements OnInit, OnChanges {
  public data: OtpSettingsData = null;
  public loading = false;
  public otpTypes: LocalizedEnumValue<UserOtpType>[];
  public isDirty: boolean = false;

  @Input()
  user: IdentityUserDto;

  @Input()
  disabled: boolean = false;

  constructor(
    private validationService: ValidationService,
    private userOtpSettingsService: UserOtpSettingsService,
    private msgService: LocalizedMessageService,
    private localizationService: ILocalizationService
  ) {}

  public get showSmsInput(): boolean {
    return [UserOtpType.Mixed, UserOtpType.Sms].includes(this.data.userOtpType);
  }

  public get showEmailInput(): boolean {
    return [UserOtpType.Mixed, UserOtpType.Email].includes(this.data.userOtpType);
  }

  public ngOnInit(): void {
    this.otpTypes = mapEnumToLocalizedList<typeof UserOtpType, UserOtpType>(
      UserOtpType,
      this.localizationService,
      "TenantManagement::OtpSettings:OtpType"
    ).filter((x) => x.value !== UserOtpType.None && x.value !== UserOtpType.Sms);
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['user']) {
      this.loadOtpSettings();
    }
  }

  public save(): Observable<boolean> {
    if(!this.data){
      return of(true);
    }
    if (
      !this.validationService.validate(OtpSettingsValidationRules, this.data)
    ) {
      return of(false);
    }

    this.loading = true;
    return this.userOtpSettingsService
      .setUserOtpSettingsByUserOtpSettings({
        userId: this.user.id,
        userOtpType: this.data.userOtpType,
        otpEmail: this.data.otpEmail,
        otpPhoneNumber: this.data.otpPhoneNumber,
      })
      .pipe(
        tap(() => {
          // this.msgService.success(
          //   "TenantManagement::TenantSettings:UserIsolationSettings:UserIsolationSettingsSaved"
          // );
        }),
        finalize(() => (this.loading = false))
      );
  }

  private loadOtpSettings(): void {
    if (!this.user || !this.user?.id?.length) {
      return;
    }

    this.loading = true;
    this.userOtpSettingsService
      .getUserOtpSettingsByUserId(this.user.id)
      .subscribe((res) => {
        this.data = {
          ...res,
          validators: createValidationState(OtpSettingsValidationRules),
        };
        this.loading = false;
      });
  }
}
