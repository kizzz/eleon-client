import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { ITenantSettingService } from '@eleon/angular-sdk.lib';
import { TenantClientIsolationService } from '@eleon/eleoncore-multi-tenancy-proxy';
import { TenantWhitelistedIpDto } from '@eleon/angular-sdk.lib';
import { Observable, finalize, of } from "rxjs";
import { FileHelperService } from '@eleon/primeng-ui.lib';
import { LocalizedMessageService } from "@eleon/primeng-ui.lib";
import {
  ValidationRuleSet,
  ValidationService,
  createValidationState,
} from "@eleon/primeng-ui.lib";

const IPv4AddressKeyFilter: RegExp =
  /(^\s*((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))\s*$)/;

type IpIsolationValidators = {
  whitelistedIps: boolean;
};

interface IpIsolationData {
  enabled: boolean;
  whitelistedIps: IpRow[];
  validators: IpIsolationValidators;
}

const IpIsolationValidationRules: ValidationRuleSet<
  IpIsolationData,
  IpIsolationValidators
> = {
  whitelistedIps: {
    validator: (x) => (x.enabled ? !!x.whitelistedIps?.length : true),
    message:
      "TenantManagement::TenantSettings:IpIsolationSettings:Errors:IpsEmpty",
  },
};

type IpRowValidators = {
  ip: boolean;
};

interface IpRow {
  ip: string;
  enabled: boolean;
  validators: IpRowValidators;
}

const IpRowValidationRules: ValidationRuleSet<IpRow, IpRowValidators> = {
  ip: {
    validator: (x) => x.ip.length && IPv4AddressKeyFilter.test(x.ip),
    message:
      "TenantManagement::TenantSettings:IpIsolationSettings:Error:Ip",
  },
};

@Component({
  standalone: false,
  selector: "app-tenant-ip-isolation-dialog",
  templateUrl: "./tenant-ip-isolation-dialog.component.html",
  styleUrls: ["./tenant-ip-isolation-dialog.component.scss"],
})
export class TenantIpIsolationDialogComponent implements OnInit {
  IPv4AddressKeyFilter: RegExp = IPv4AddressKeyFilter;

  public data: IpIsolationData = null;
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
    private msgService: LocalizedMessageService
  ) {}

  public ngOnInit(): void {}

  public show(): void {
    this.showDialog = true;
    this.showDialogChange.emit(this.showDialog);
    this.loadTenantSettings();
  }

  public whitelistedIpFactory = (dto?: TenantWhitelistedIpDto): IpRow => ({
    ip: dto?.ipAddress || "",
    enabled: dto?.enabled || false,
    validators: createValidationState(IpRowValidationRules),
  });

  public onIpAdded = (row: IpRow): Observable<boolean> => {
    row.enabled = true;
    if (!this.validationService.validate(IpRowValidationRules, row)) {
      return of(false);
    }

    return of(true);
  };

  public onIpRemoved = (row: IpRow): Observable<boolean> => of(true);

  public save(): void {
    if (
      !this.validationService.validate(IpIsolationValidationRules, this.data)
    ) {
      return;
    }

    this.loading = true;
    this.clientIsolationService
      .setTenantIpIsolationSettingsByRequest({
        tenantId: this.tenantId,
        ipIsolationEnabled: this.data.enabled,
        whitelistedIps: this.data.whitelistedIps.map<TenantWhitelistedIpDto>((x) => ({ipAddress: x.ip, enabled: x.enabled} as TenantWhitelistedIpDto)),
      })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(() => {
        this.msgService.success(
          "TenantManagement::TenantSettings:IpIsolationSettings:IpIsolationSettingsSaved"
        );
        this.showDialog = false;
        this.showDialogChange.emit(this.showDialog);
      });
  }

  public cancel(): void {
    this.showDialog = false;
    this.showDialogChange.emit(this.showDialog);
  }

  private loadTenantSettings(): void {
    this.loading = true;
    this.tenantSettingsService
      .getSettingsByTenantId(this.tenantId)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((res) => {
        this.data = {
          enabled: res.ipIsolationEnabled,
          whitelistedIps: res.whitelistedIps.map(this.whitelistedIpFactory),
          validators: createValidationState(IpIsolationValidationRules),
        };
      });
  }
}
