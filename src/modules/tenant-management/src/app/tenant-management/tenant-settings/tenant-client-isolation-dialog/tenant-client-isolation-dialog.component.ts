import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { ITenantSettingService } from '@eleon/angular-sdk.lib';
import { TenantClientIsolationService } from '@eleon/eleoncore-multi-tenancy-proxy';
import { finalize } from "rxjs";
import { FileHelperService } from '@eleon/primeng-ui.lib';
import { LocalizedMessageService } from "@eleon/primeng-ui.lib";
import {
  ValidationRuleSet,
  ValidationService,
  createValidationState,
} from "@eleon/primeng-ui.lib";

type ClientIsolationValidators = {
  certificate: boolean;
};

interface ClientIsolationData {
  enabled: boolean;
  certificateBase64: string;
  password: string;
  certificateFileName: string;
  validators: ClientIsolationValidators;
}

const ClientIsolationValidationRules: ValidationRuleSet<
  ClientIsolationData,
  ClientIsolationValidators
> = {
  certificate: {
    validator: (x) => !x.enabled || !!x.certificateBase64?.length,
    message:
      "TenantManagement::TenantSettings:ClientIsolationSettings:Errors:CertificateRequired",
  },
};

@Component({
  standalone: false,
  selector: "app-tenant-client-isolation-dialog",
  templateUrl: "./tenant-client-isolation-dialog.component.html",
  styleUrls: ["./tenant-client-isolation-dialog.component.scss"],
})
export class TenantClientIsolationDialogComponent implements OnInit {
  public data: ClientIsolationData = null;
  public loading = false;

  @Input()
  public showDialog = false;
  @Output()
  public showDialogChange = new EventEmitter<boolean>();

  @Input() tenantId: string;

  constructor(
    private clientIsolationService: TenantClientIsolationService,
    private tenantSettingsService: ITenantSettingService,
    private validationService: ValidationService,
    private msgService: LocalizedMessageService,
    private fileHelper: FileHelperService
  ) {}

  public ngOnInit(): void {
  }

  public show(): void {
    this.showDialog = true;
    this.showDialogChange.emit(this.showDialog);
    this.loadTenantSettings();
  }

  public save(): void {
    if (
      !this.validationService.validate(
        ClientIsolationValidationRules,
        this.data
      )
    ) {
      return;
    }

    this.loading = true;
    this.clientIsolationService
      .setTenantIsolationByRequest({
        tenantId: this.tenantId,
        enabled: this.data.enabled,
        certificatePemBase64: this.data.certificateBase64,
        password: this.data.password,
      })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(() => {
        this.msgService.success(
          "TenantManagement::TenantSettings:ClientIsolationSettings:ClientIsolationSettingsSaved"
        );
        this.showDialog = false;
        this.showDialogChange.emit(this.showDialog);
      });
  }

  public cancel(): void {
    this.showDialog = false;
    this.showDialogChange.emit(this.showDialog);
  }

  public async uploadFile(event: any): Promise<void> {
    this.data.validators.certificate = false;
    this.data.certificateBase64 = await this.fileHelper.fileToBase64(
      event.files[0]
    );
    this.data.certificateFileName = event.files[0].name;
  }

  private loadTenantSettings(): void {
    this.loading = true;
    this.tenantSettingsService
      .getSettingsByTenantId(this.tenantId)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((res) => {
        this.data = {
          enabled: res.tenantIsolationEnabled,
          certificateBase64: null,
          certificateFileName: null,
          password: null,
          validators: createValidationState(ClientIsolationValidationRules),
        };
      });
  }
}
