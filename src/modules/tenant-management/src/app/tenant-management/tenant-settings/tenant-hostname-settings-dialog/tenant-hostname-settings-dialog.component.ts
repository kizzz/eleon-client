import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  QueryList,
  SimpleChanges,
  ViewChildren,
} from "@angular/core";
import { TenantHostnameDto, DomainSettingsService } from '@eleon/eleoncore-multi-tenancy-proxy';
import { Observable, catchError, finalize, map, of, tap, throwError } from "rxjs";
import { FileHelperService } from '@eleon/primeng-ui.lib';
import { LocalizedConfirmationService } from "@eleon/primeng-ui.lib";
import { LocalizedMessageService } from "@eleon/primeng-ui.lib";
import {
  ValidationRuleSet,
  ValidationService,
  createValidationState,
} from "@eleon/primeng-ui.lib";

import { ILocalizationService } from '@eleon/angular-sdk.lib';
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
  selector: "app-tenant-hostname-settings-dialog",
  templateUrl: "./tenant-hostname-settings-dialog.component.html",
  styleUrls: ["./tenant-hostname-settings-dialog.component.scss"],
})
export class TenantHostnameSettingsDialogComponent {
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
  showDialog: boolean = false;

  @Output()
  showDialogChange = new EventEmitter<boolean>();

  @Input()
  public tenantId: string;

  constructor(
    private localizationService: ILocalizationService,
    private msgService: LocalizedMessageService,
    private validationService: ValidationService,
    private fileHelper: FileHelperService,
    private confirmationService: LocalizedConfirmationService,
    private adminDomainSettingsService: DomainSettingsService
  ) {}

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
      .pipe(finalize(() => (this.loading = false)))
      .pipe(tap(() => this.loadHostnames()));
  };

  public deleteHostname = (row: TenantHostnameTableRow): void => {
    this.confirmationService.confirm(
      "TenantManagement::TenantSettings:HostnameSettings:ConfirmDeleteHostname",
      () => {
        this.loading = true;
        this.adminDomainSettingsService
          .removeCorporateDomainForTenant(this.tenantId, row.data.id)
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

  public show(): void {
    this.showDialog = true;
    this.showDialogChange.emit(true);
    this.loadHostnames();
  }

  public onShowDialogChange(value: boolean): void {
    this.showDialog = value;
    this.showDialogChange.emit(value);
  }

  private loadHostnames(): void {
    this.loading = true;
    this.adminDomainSettingsService
      .getHostnamesForTenant(this.tenantId)
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
}
