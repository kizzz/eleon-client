import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { DomainSettingsService } from '@eleon/tenant-management-proxy';
import { Observable, catchError, finalize, map, of, tap, throwError } from "rxjs";
import { FileHelperService } from '@eleon/primeng-ui.lib';
import { LocalizedConfirmationService } from "@eleon/primeng-ui.lib";
import { LocalizedMessageService } from "@eleon/primeng-ui.lib";
import {
  ValidationRuleSet,
  ValidationService,
  createValidationState,
} from "@eleon/primeng-ui.lib";
import { VportalApplicationType } from '@eleon/tenant-management-proxy';
import { TenantHostnameDto } from '@eleon/tenant-management-proxy';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import {
  PAGE_CONTROLS,
  contributeControls,
  PageControls} from '@eleon/primeng-ui.lib';
import { AddTableRowDirective, TableRowEditorDirective } from '@eleon/primeng-ui.lib';

type HostnameValidators = {
  domainRequired: boolean;
  certificate: boolean;
  port: boolean;
  domainInvalid: boolean
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

function isValidDomain(domain) {
  const regex = /^(([\da-zA-Z])([_\w-]{0,62})\.){0,127}(([\da-zA-Z])[_\w-]{0,61})?([\da-zA-Z]\.((xn\-\-[a-zA-Z\d]+)|([a-zA-Z\d]{2,})))$/;
  return regex.test(domain);
}

const HostnameValidationRules: ValidationRuleSet<
  TenantHostnameTableRow,
  HostnameValidators
> = {
  port: {
    validator: (x) => !isNaN(Number(x.port)),
    message:
      "TenantManagement::TenantSettings:HostnameSettings:Errors:PortIsNumber",
  },
  domainRequired: {
    validator: (x) => !!x.domain?.trim().length,
    message:
      "TenantManagement::TenantSettings:HostnameSettings:Errors:DomainRequired",
  },
  certificate: {
    validator: (x) => true, 
    //!!x.certificateBase64?.trim().length,
    message:
      "TenantManagement::TenantSettings:HostnameSettings:Errors:CertificateRequired",
  },
  domainInvalid: {
    validator: (x) => isValidDomain(x.domain),
    message:
      "TenantManagement::TenantSettings:HostnameSettings:Errors:DomainInvalid",
  },
};

@Component({
  standalone: false,
  selector: "app-tenant-domains-table",
  templateUrl: "./tenant-domains-table.component.html",
  styleUrl: "./tenant-domains-table.component.scss",
})
export class TenantDomainsTableComponent implements OnInit {
  public hostnames: TenantHostnameTableRow[] = [];
  public loading: boolean = false;
  public rowsCount = 12;
  get totalRecords(): number{
    return this.hostnames.length;
  } 

  public availableProtocolsList : {name: string, value: boolean}[] = [
    { 
      name: "https://",
      value: true 
    },
    { 
      name: "http://",
      value: false 
    }
  ]

  @Input()
  public tenantId: string;
  @Input()
  public visible: boolean = false;

  @ViewChild('re', { static: false }) rowsEditor: TableRowEditorDirective;

  @PageControls()
  controls = contributeControls([
    PAGE_CONTROLS.RELOAD({
      disabled: () => this.loading === true,
      loading: () => this.loading === true,
      show: () => this.visible,
      action: () => this.loadHostnames(),
    }),
    PAGE_CONTROLS.ADD({
      key: "TenantManagement::TenantSettings:HostnameSettings:AddHostname",
      disabled: () => this.loading === true,
      loading: () => this.loading === true,
      show: () => this.visible,
      action: () => this.startAddRow(),
    }),
  ]);

  constructor(
    private localizationService: ILocalizationService,
    private msgService: LocalizedMessageService,
    private validationService: ValidationService,
    private fileHelper: FileHelperService,
    private confirmationService: LocalizedConfirmationService,
    private domainSettingsService: DomainSettingsService
  ) {}

  ngOnInit(): void {
    this.loadHostnames();
  }

  public hostnameRowFactory = (
    hostname?: TenantHostnameDto
  ): TenantHostnameTableRow => {
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

  public async uploadFile(
    hostname: TenantHostnameTableRow,
    event: any
  ): Promise<void> {
    hostname.validators.certificate = false;
    hostname.certificateBase64 = await this.fileHelper.fileToBase64(
      event.files[0]
    );
    hostname.certificateFileName = event.files[0].name;
  }

  public addHostname = (
    hostname: TenantHostnameTableRow
  ): Observable<boolean> => {
    if (!this.validationService.validate(HostnameValidationRules, hostname)) {
      return of();
    }
    this.loading = true;
    return this.domainSettingsService
      .addCorporateDomain({
        domainName: hostname.domain,
        certificatePemBase64: hostname.certificateBase64,
        password: hostname.certificatePassword,
        port: hostname.port,
        isSsl: hostname.isSsl,
        default: hostname.data.default,
        acceptsClientCertificate: hostname.data.acceptsClientCertificate,
      })
      .pipe(finalize(() => (this.loading = false)),
      catchError((error) => {
        if (error.status === 400){
          hostname.validators.domainInvalid = true;
          this.msgService.error("TenantManagement::TenantSettings:HostnameSettings:Errors:DomainAlreadyExists");
          return of();
        }
        return throwError(() => error);
      }))
      .pipe(tap(() => this.loadHostnames()));
  };

  public editHostname = (
    hostname: TenantHostnameTableRow
  ): Observable<boolean> => {
    if (!this.validationService.validate(HostnameValidationRules, hostname)) {
      return of();
    }

    this.loading = true;
    return this.domainSettingsService
      .updateCorporateDomain({
				domainName: hostname.domain,
        hostnameId: hostname.data.id,
        port: hostname.port,
        isSsl: hostname.isSsl,
        certificatePemBase64: hostname.certificateBase64,
        password: hostname.certificatePassword,
        default: hostname.data.default,
        acceptsClientCertificate: hostname.data.acceptsClientCertificate,
      })
      .pipe(finalize(() => (this.loading = false)))
      .pipe(tap(() => this.loadHostnames()));
  };

  public deleteHostname = (row: TenantHostnameTableRow): void => {
    this.confirmationService.confirm(
      "TenantManagement::TenantSettings:HostnameSettings:ConfirmDeleteHostname",
      () => {
        this.loading = true;
        this.domainSettingsService
          .removeCorporateDomain(row.data.id)
          .pipe(finalize(() => (this.loading = false))
        )
          .subscribe(() => {
            this.hostnames = this.hostnames.filter((x) => x !== row);
          });
      },
      undefined,
      [row.data.url]
    );
  }

  private loadHostnames = (): void => {
    this.loading = true;
    this.domainSettingsService
      .getCurrentTenantHostnames()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((hostnames) => {
        this.initHostnames(hostnames);
      });
  }

  private initHostnames(hostnames: TenantHostnameDto[]): void {
    this.hostnames = hostnames
      .map(this.hostnameRowFactory)
      .sort((a, b) => Number(b.data.internal) - Number(a.data.internal));
  }

  private startAddRow(): void {
    if (this.rowsEditor) {
      this.rowsEditor.startAdding();
    }
  }
}
