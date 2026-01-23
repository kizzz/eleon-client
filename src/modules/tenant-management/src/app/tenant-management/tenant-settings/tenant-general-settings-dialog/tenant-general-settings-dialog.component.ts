import { Component, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { Observable, catchError, finalize, of, tap, throwError } from "rxjs";
import { TenantContentSecurityService, TenantClientIsolationService } from "@eleon/eleoncore-multi-tenancy-proxy";
import { TenantContentSecurityHostDto } from "@eleon/angular-sdk.lib";
import { ITenantSettingService } from "@eleon/angular-sdk.lib";
import { ValidationRuleSet, ValidationService, createValidationState } from "@eleon/primeng-ui.lib";
import { LocalizedMessageService } from "@eleon/primeng-ui.lib";
import { FileHelperService } from '@eleon/primeng-ui.lib';
import { TenantHostnameDto, DomainSettingsService } from "@eleon/eleoncore-multi-tenancy-proxy";
import { LocalizedConfirmationService } from "@eleon/primeng-ui.lib";
import { TenantWhitelistedIpDto } from "@eleon/angular-sdk.lib";
import { TenantExternalLoginSettingsBoxComponent } from "../tenant-external-login-settings-box/tenant-external-login-settings-box.component";
import { ILocalizationService } from "@eleon/angular-sdk.lib";

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

const HostnameRowValidationRules: ValidationRuleSet<HostnameRow, HostnameRowValidators> = {
  hostname: {
    validator: (x) => !!x.hostname?.length && HostnameKeyFilter.test(x.hostname),
    message: "TenantManagement::TenantSettings:ContentSecuritySettings:Error:Hostname",
  },
};

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

const IpIsolationValidationRules: ValidationRuleSet<IpIsolationData, IpIsolationValidators> = {
  whitelistedIps: {
    validator: (x) => (x.enabled ? !!x.whitelistedIps?.length : true),
    message: "TenantManagement::TenantSettings:IpIsolationSettings:Errors:IpsEmpty",
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
    message: "TenantManagement::TenantSettings:IpIsolationSettings:Error:Ip",
  },
};

type HostnameValidators = {
  domainRequired: boolean;
  certificate: boolean;
  port: boolean;
  domainInvalid: boolean;
};

interface TenantHostnameTableRow {
  data: TenantHostnameDto;
  domain: string;
  port: number;
  isSsl: boolean;
  certificateBase64: string;
  certificateFileName: string;
  certificatePassword: string;
  validators: HostnameValidators;
}

function isValidDomain(domain: string) {
  const regex =
    /^(([\da-zA-Z])([_\w-]{0,62})\.){0,127}(([\da-zA-Z])[_\w-]{0,61})?([\da-zA-Z]\.((xn\-\-[a-zA-Z\d]+)|([a-zA-Z\d]{2,})))$/;
  return regex.test(domain);
}

const HostnameValidationRules: ValidationRuleSet<TenantHostnameTableRow, HostnameValidators> = {
  port: {
    validator: (x) => !isNaN(Number(x.port)),
    message: "TenantManagement::TenantSettings:HostnameSettings:Errors:PortIsNumber",
  },
  domainRequired: {
    validator: (x) => !!x.domain?.trim().length,
    message: "TenantManagement::TenantSettings:HostnameSettings:Errors:DomainRequired",
  },
  certificate: {
    validator: (x) => true,
    message: "TenantManagement::TenantSettings:HostnameSettings:Errors:CertificateRequired",
  },
  domainInvalid: {
    validator: (x) => isValidDomain(x.domain),
    message: "TenantManagement::TenantSettings:HostnameSettings:Errors:DomainInvalid",
  },
};

@Component({
  standalone: false,
  selector: "app-tenant-general-settings-dialog",
  templateUrl: "./tenant-general-settings-dialog.component.html",
  styleUrls: ["./tenant-general-settings-dialog.component.scss"],
})
export class TenantGeneralSettingsDialogComponent {
  @Input() showDialog = false;
  @Output() showDialogChange = new EventEmitter<boolean>();
  @Input() tenantId: string;
  @ViewChild(TenantExternalLoginSettingsBoxComponent)
  externalLoginSettingsBox: TenantExternalLoginSettingsBoxComponent;

  public HostnameKeyFilter = HostnameKeyFilter;
  public IPv4AddressKeyFilter = IPv4AddressKeyFilter;

  contentSecurityData: ContentSecurityData = null;
  ipIsolationData: IpIsolationData = null;
  hostnames: TenantHostnameTableRow[] = [];

  loadingContentSecurity = false;
  loadingIpIsolation = false;
  loadingHostnames = false;
  activeTabIndex = 0;
  ipIsolationSettingModeOptions = [
    { label: this.localizationService.instant("Infrastructure::Allow"), value: false },
    { label: this.localizationService.instant("Infrastructure::Deny"), value: true },
  ];
  ipIsolationModeOptions = [
    { label: this.localizationService.instant("Infrastructure::Allow"), value: true },
    { label: this.localizationService.instant("Infrastructure::Deny"), value: false },
  ];

  public rowsCount = 12;
  get totalRecords(): number {
    return this.hostnames.length;
  }

  public availableProtocolsList: { name: string; value: boolean }[] = [
    {
      name: "https://",
      value: true,
    },
    {
      name: "http://",
      value: false,
    },
  ];

  private readonly tabSaveHandlers: Record<number, () => void> = {
    1: () => this.saveIpIsolation(),
    3: () => this.saveExternalLogin(),
  };

  constructor(
    private contentSecurityService: TenantContentSecurityService,
    private tenantSettingsService: ITenantSettingService,
    public localizationService: ILocalizationService,
    private validationService: ValidationService,
    private msgService: LocalizedMessageService,
    private fileHelper: FileHelperService,
    private clientIsolationService: TenantClientIsolationService,
    private adminDomainSettingsService: DomainSettingsService,
    private confirmationService: LocalizedConfirmationService
  ) {}

  public show(tenantId?: string): void {
    if (tenantId) {
      this.tenantId = tenantId;
    }
    this.showDialog = true;
    this.showDialogChange.emit(true);
    this.loadContentSecurity();
    this.loadIpIsolation();
    this.loadHostnames();
  }

  public close(): void {
    this.showDialog = false;
    this.showDialogChange.emit(false);
  }

  public handleSave(): void {
    const handler = this.tabSaveHandlers[this.activeTabIndex];
    if (handler) {
      handler();
    }
  }

  public get isSaveAvailable(): boolean {
    return !!this.tabSaveHandlers[this.activeTabIndex];
  }

  public get isSaving(): boolean {
    return this.loadingContentSecurity || this.loadingIpIsolation || this.loadingHostnames;
  }

  // Content Security
  public hostnameFactory = (dto?: TenantContentSecurityHostDto): HostnameRow => ({
    id: undefined,
    hostname: dto?.hostname || "",
    validators: createValidationState(HostnameRowValidationRules),
  });

  public onHostnameAdded = (row: HostnameRow): Observable<boolean> => {
    if (!this.validationService.validate(HostnameRowValidationRules, row)) {
      return of(false);
    }
    this.loadingContentSecurity = true;
    return this.contentSecurityService
      .addTenantContentSecurityHostByInput({
        hostname: row.hostname,
        tenantId: this.tenantId,
      })
      .pipe(
        tap((res) => {
          if (res) {
            this.loadContentSecurity();
          }
        }),
        finalize(() => (this.loadingContentSecurity = false))
      );
  };

  public onHostnameRemoved = (row: HostnameRow): Observable<boolean> => {
    this.loadingContentSecurity = true;
    return this.contentSecurityService
      .removeTenantContentSecurityHostByInput({
        contentSecurityHostId: row.id,
        tenantId: this.tenantId,
      })
      .pipe(
        tap((res) => {
          if (res) {
            this.loadContentSecurity();
          }
        }),
        finalize(() => (this.loadingContentSecurity = false))
      );
  };

  public onHostnameUpdated = (row: HostnameRow): Observable<boolean> => {
    this.loadingContentSecurity = true;
    return this.contentSecurityService
      .updateTenantContentSecurityHostByInput({
        contentSecurityHostId: row.id,
        tenantId: this.tenantId,
        newHostname: row.hostname,
      })
      .pipe(
        tap((res) => {
          if (res) {
            this.loadContentSecurity();
          }
        }),
        finalize(() => (this.loadingContentSecurity = false))
      );
  };

  private loadContentSecurity(): void {
    if (!this.tenantId) {
      return;
    }
    this.loadingContentSecurity = true;
    this.tenantSettingsService
      .getSettingsByTenantId(this.tenantId)
      .pipe(finalize(() => (this.loadingContentSecurity = false)))
      .subscribe((res) => {
        this.contentSecurityData = {
          hostnames: res.contentSecurityHosts.map(this.hostnameFactory),
        };
      });
  }

  // IP Isolation
  public whitelistedIpFactory = (dto?: TenantWhitelistedIpDto): IpRow => ({
    ip: dto?.ipAddress || "",
    enabled: (dto?.enabled === undefined  || dto?.enabled === null) ? true : dto.enabled,
    validators: createValidationState(IpRowValidationRules),
  });

  public onIpAdded = (row: IpRow): Observable<boolean> => {
    if (!this.validationService.validate(IpRowValidationRules, row)) {
      return of(false);
    }
    return of(true);
  };

  public onIpRemoved = (row: IpRow): Observable<boolean> => of(true);

  public saveIpIsolation(): void {
    if (!this.validationService.validate(IpIsolationValidationRules, this.ipIsolationData)) {
      return;
    }

    this.loadingIpIsolation = true;
    this.clientIsolationService
      .setTenantIpIsolationSettingsByRequest({
        tenantId: this.tenantId,
        ipIsolationEnabled: this.ipIsolationData.enabled,
        whitelistedIps: this.ipIsolationData.whitelistedIps.map<TenantWhitelistedIpDto>((x) => ({ipAddress: x.ip, enabled: x.enabled})),
      })
      .pipe(finalize(() => (this.loadingIpIsolation = false)))
      .subscribe(() => {
        this.msgService.success(
          "TenantManagement::TenantSettings:IpIsolationSettings:IpIsolationSettingsSaved"
        );
      });
  }

  private loadIpIsolation(): void {
    if (!this.tenantId) {
      return;
    }
    this.loadingIpIsolation = true;
    this.tenantSettingsService
      .getSettingsByTenantId(this.tenantId)
      .pipe(finalize(() => (this.loadingIpIsolation = false)))
      .subscribe((res) => {
        this.ipIsolationData = {
          enabled: res.ipIsolationEnabled ?? true,
          whitelistedIps: res.whitelistedIps.map(this.whitelistedIpFactory),
          validators: createValidationState(IpIsolationValidationRules),
        };
      });
  }

  // Hostnames
  public hostnameRowFactory = (hostname?: TenantHostnameDto): TenantHostnameTableRow => {
    return {
      data: hostname || ({} as TenantHostnameDto),
      domain: hostname?.domain,
      port: hostname?.port ?? 443,
      isSsl: hostname?.isSsl ?? true,
      certificateBase64: "",
      certificateFileName: "",
      certificatePassword: "",
      validators: createValidationState(HostnameValidationRules),
    };
  };

  public async uploadHostnameFile(hostname: TenantHostnameTableRow, event: any): Promise<void> {
    hostname.validators.certificate = false;
    hostname.certificateBase64 = await this.fileHelper.fileToBase64(event.files[0]);
    hostname.certificateFileName = event.files[0].name;
  }

  public addHostname = (hostname: TenantHostnameTableRow): Observable<boolean> => {
    if (!this.validationService.validate(HostnameValidationRules, hostname)) {
      return of();
    }
    this.loadingHostnames = true;
    return this.adminDomainSettingsService
      .addCorporateDomainForTenant(this.tenantId, {
        domainName: hostname.domain,
        certificatePemBase64: hostname.certificateBase64,
        password: hostname.certificatePassword,
        port: hostname.port,
        isSsl: hostname.isSsl,
        default: hostname.data.default,
        acceptsClientCertificate: hostname.data.acceptsClientCertificate,
      })
      .pipe(
        finalize(() => (this.loadingHostnames = false)),
        catchError((error) => {
          if (error.status === 400) {
            hostname.validators.domainInvalid = true;
            this.msgService.error(
              "TenantManagement::TenantSettings:HostnameSettings:Errors:DomainAlreadyExists"
            );
            return of();
          }
          return throwError(() => error);
        })
      )
      .pipe(tap(() => this.loadHostnames()));
  };

  public editHostname = (hostname: TenantHostnameTableRow): Observable<boolean> => {
    if (!this.validationService.validate(HostnameValidationRules, hostname)) {
      return of();
    }

    this.loadingHostnames = true;
    return this.adminDomainSettingsService
      .updateCorporateDomainForTenant(this.tenantId, {
        domainName: hostname.domain,
        hostnameId: hostname.data.id,
        port: hostname.port,
        isSsl: hostname.isSsl,
        certificatePemBase64: hostname.certificateBase64,
        password: hostname.certificatePassword,
        default: hostname.data.default,
        acceptsClientCertificate: hostname.data.acceptsClientCertificate,
      })
      .pipe(finalize(() => (this.loadingHostnames = false)))
      .pipe(tap(() => this.loadHostnames()));
  };

  public deleteHostname = (row: TenantHostnameTableRow): void => {
    this.confirmationService.confirm(
      "TenantManagement::TenantSettings:HostnameSettings:ConfirmDeleteHostname",
      () => {
        this.loadingHostnames = true;
        this.adminDomainSettingsService
          .removeCorporateDomainForTenant(this.tenantId, row.data.id)
          .pipe(finalize(() => (this.loadingHostnames = false)))
          .subscribe(() => {
            this.hostnames = this.hostnames.filter((x) => x !== row);
          });
      },
      undefined,
      [row.data.url]
    );
  };

  private loadHostnames(): void {
    if (!this.tenantId) {
      return;
    }
    this.loadingHostnames = true;
    this.adminDomainSettingsService
      .getHostnamesForTenant(this.tenantId)
      .pipe(finalize(() => (this.loadingHostnames = false)))
      .subscribe((hostnames) => {
        this.hostnames = hostnames.map(this.hostnameRowFactory).sort((a, b) => Number(b.data.internal) - Number(a.data.internal));
      });
  }

  // External login
  public saveExternalLogin(): void {
    this.externalLoginSettingsBox?.save();
  }
}
