import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { IdentityUserDto, IdentityRoleDto } from '@eleon/tenant-management-proxy';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChange,
  SimpleChanges,
  ViewChild,
} from "@angular/core";
import { TenantSettingsService } from '@eleon/tenant-management-proxy';
import { ClientIsolationService } from '@eleon/tenant-management-proxy';
import { FileUpload, FileUploadHandlerEvent } from "primeng/fileupload";
import { Observable, catchError, finalize, of, tap, throwError } from "rxjs";
import { FileHelperService } from '@eleon/primeng-ui.lib';
import { LocalizedMessageService } from "@eleon/primeng-ui.lib";
import {
  ValidationRuleSet,
  ValidationService,
  createValidationState,
} from "@eleon/primeng-ui.lib";

type UserIsolationValidators = {
  certificate: boolean;
  password: boolean;
};

interface UserIsolationData {
  enabled: boolean;
  certificateBase64: string;
  password: string;
  certificateFileName: string;
  validators: UserIsolationValidators;
}

const UserIsolationValidationRules: ValidationRuleSet<
  UserIsolationData,
  UserIsolationValidators
> = {
  certificate: {
    validator: (x) => x.enabled && !!x.certificateBase64?.length,
    message:
      "TenantManagement::TenantSettings:UserIsolationSettings:Errors:CertificateRequired",
  },
  password: {
    validator: (x) => x.enabled && !!x.certificateBase64?.length && !!x.password,
    message:
      "TenantManagement::TenantSettings:UserIsolationSettings:Errors:CertificatePasswordRequired",
  },
};


@Component({
  standalone: false,
  selector: "app-user-isolation-settings",
  templateUrl: "./user-isolation-settings.component.html",
  styleUrls: ["./user-isolation-settings.component.scss"],
})
export class UserIsolationSettingsComponent implements OnChanges {
  public data: UserIsolationData = null;
  public loading = false;
  public errorMessage: string;
  public isDirty: boolean = false;

  @Input()
  user: IdentityUserDto;
  @ViewChild("fileUploadComponent") fileUploadRef: FileUpload;
  certificateBase64BeforeSave: string ="";
  certificateFileNameBeforeSave : string = "";
  passwordBeforeSave: string = "";

  constructor(
    private clientIsolationService: ClientIsolationService,
    private tenantSettingsService: TenantSettingsService,
    private validationService: ValidationService,
    private msgService: LocalizedMessageService,
    private fileHelper: FileHelperService,
    private localizationService: ILocalizationService
  ) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes["user"]) {
      this.loadUserSettings();
    }
  }

  public save(): Observable<boolean> {
    if (this.errorMessage?.length) {
      return of(true);
    }
  
    if (!this.validationService.validate(UserIsolationValidationRules, this.data)) {
      return of(false);
    }
  
    this.passwordBeforeSave = this.data.password;
    this.loading = true;
  
    return this.clientIsolationService.setUserIsolationByRequest({
      userId: this.user.id,
      enabled: this.data.enabled,
      clientCertificateBase64: this.data.certificateBase64,
      password: this.data.password,
    }).pipe(
      catchError((error: string) => {
        this.msgService.error(error);
        return throwError(error);
      }),
      finalize(() => (this.loading = false))
    );
  }

  public async uploadFile(event: FileUploadHandlerEvent): Promise<void> {
    if (event?.files.length > 0) {
      const fileType = event.files[0].type;
      if (fileType === 'application/x-pkcs12') {
        this.isDirty = true;
        this.data.validators.certificate = false;
        
        this.data.certificateBase64 = await this.fileHelper.fileToBase64(
          event.files[0]
        );
        this.data.certificateFileName = event.files[0].name;
        this.certificateBase64BeforeSave = this.data.certificateBase64;
        this.certificateFileNameBeforeSave = this.data.certificateFileName;
      } else {
        this.msgService.error('TenantManagement::InvalidFormatFile:Pfx');
        this.fileUploadRef.clear();
        return null;
      }
    }    
  }

  private loadUserSettings(): void {
    if (!this.user || !this.user?.id?.length) {
      return;
    }

    this.loading = true;
    this.clientIsolationService
      .getUserIsolationSettingsByUserId(this.user.id)
      .subscribe((res) => {
        if (res.tenantIsolationEnabled) {
          this.errorMessage = this.localizationService.instant(
            "TenantManagement::TenantSettings:UserIsolationSettings:Error:TenantIsolationIsEnabled"
          );
        }
        this.data = {
          enabled: true,
          certificateBase64: this.certificateBase64BeforeSave,
          certificateFileName: this.certificateFileNameBeforeSave,
          password: this.passwordBeforeSave,
          validators: createValidationState(UserIsolationValidationRules),
        };
        this.loading = false;
      });
  }
}
