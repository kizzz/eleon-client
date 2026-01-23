import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { ITenantSettingService } from '@eleon/angular-sdk.lib';
import { TenantContentSecurityService } from '@eleon/eleoncore-multi-tenancy-proxy';
import { Observable, finalize, of, switchMap, tap } from "rxjs";
import { FileHelperService } from '@eleon/primeng-ui.lib';
import { LocalizedMessageService } from "@eleon/primeng-ui.lib";
import {
  ValidationRuleSet,
  ValidationService,
  createValidationState,
} from "@eleon/primeng-ui.lib";

const HostnameKeyFilter: RegExp = /(^(http(s)?):\/\/([^\/\\]){0,127}(\/)?$)/;

interface ContentSecurityData {
  hostnames: HostnameRow[];
}

type HostnameRowValidators = {
  hostname: boolean;
};

interface HostnameRow {
  id: string;
  hostname: string;
  validators: HostnameRowValidators;
}

const HostnameRowValidationRules: ValidationRuleSet<
  HostnameRow,
  HostnameRowValidators
> = {
  hostname: {
    validator: (x) =>
      !!x.hostname?.length && HostnameKeyFilter.test(x.hostname),
    message:
      "TenantManagement::TenantSettings:ContentSecuritySettings:Error:Hostname",
  },
};

@Component({
  standalone: false,
  selector: "app-tenant-content-security-dialog",
  templateUrl: "./tenant-content-security-dialog.component.html",
  styleUrls: ["./tenant-content-security-dialog.component.scss"],
})
export class TenantContentSecurityDialogComponent implements OnInit {
  public HostnameKeyFilter: RegExp = HostnameKeyFilter;
  public data: ContentSecurityData = null;
  public loading = false;

  @Input()
  public showDialog = false;
  @Output()
  public showDialogChange = new EventEmitter<boolean>();

  @Input() tenantId: string;

  constructor(
    private contentSecurityService: TenantContentSecurityService,
    private tenantSettingsService: ITenantSettingService,
    private validationService: ValidationService,
    private msgService: LocalizedMessageService,
    private fileHelper: FileHelperService
  ) {}

  public ngOnInit(): void {}

  public show(): void {
    this.showDialog = true;
    this.showDialogChange.emit(this.showDialog);
    this.loadTenantSettings();
  }

  public hostnameFactory = (
    dto?: any
  ): HostnameRow => ({
    id: undefined,
    hostname: dto?.hostname || "",
    validators: createValidationState(HostnameRowValidationRules),
  });

  public onHostnameAdded = (row: HostnameRow): Observable<boolean> => {
    if (!this.validationService.validate(HostnameRowValidationRules, row)) {
      return of(false);
    }

    this.loading = true;
    return this.contentSecurityService
      .addTenantContentSecurityHostByInput({
        hostname: row.hostname,
        tenantId: this.tenantId,
      })
      .pipe(
        tap((res) => {
          if (res) {
            this.loadTenantSettings();
          }
        }),
        finalize(() => (this.loading = false))
      );
  };

  public onHostnameRemoved = (row: HostnameRow): Observable<boolean> => {
    this.loading = true;
    return this.contentSecurityService
      .removeTenantContentSecurityHostByInput({
        contentSecurityHostId: row.id,
        tenantId: this.tenantId,
      })
      .pipe(
        tap((res) => {
          if (res) {
            this.loadTenantSettings();
          }
        }),
        finalize(() => (this.loading = false))
      );
  };

  public onHostnameUpdated = (row: HostnameRow): Observable<boolean> => {
    this.loading = true;
    return this.contentSecurityService
      .updateTenantContentSecurityHostByInput({
        contentSecurityHostId: row.id,
        tenantId: this.tenantId,
        newHostname: row.hostname,
      })
      .pipe(
        tap((res) => {
          if (res) {
            this.loadTenantSettings();
          }
        }),
        finalize(() => (this.loading = false))
      );
  };

  public close(): void {
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
          hostnames: res.contentSecurityHosts.map(this.hostnameFactory),
        };
      });
  }
}
