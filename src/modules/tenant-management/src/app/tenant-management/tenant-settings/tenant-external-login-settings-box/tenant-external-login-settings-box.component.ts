import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { Component, EventEmitter, Input, OnInit } from "@angular/core";
import { ITenantSettingService } from '@eleon/angular-sdk.lib';
import { ExternalLoginProviderType, TenantExternalLoginProviderDto } from '@eleon/angular-sdk.lib';
import { finalize } from "rxjs";
import { LocalizedMessageService } from "@eleon/primeng-ui.lib";
import { LocalizedConfirmationService } from "@eleon/primeng-ui.lib";

interface ExternalProvider {
  type: ExternalLoginProviderType | null;
  name: string;
  data: TenantExternalLoginProviderDto;
}

@Component({
  standalone: false,
  selector: "app-tenant-external-login-settings-box",
  templateUrl: "./tenant-external-login-settings-box.component.html",
  styleUrls: ["./tenant-external-login-settings-box.component.scss"],
})
export class TenantExternalLoginSettingsBoxComponent implements OnInit {
  public loading: boolean = false;
  public loadingChange = new EventEmitter<boolean>();

  public providersSaved = new EventEmitter<void>();

  localProviderType = ExternalLoginProviderType.Local;

  public providers: ExternalProvider[] = [
    {
      type: ExternalLoginProviderType.Local,
      name: this.localizationService.instant(
        "TenantManagement::TenantSettings:ExternalLoginProviderType:VPortal"
      ),
      data: null,
    },
    {
      type: ExternalLoginProviderType.AzureEntra,
      name: this.localizationService.instant(
        "TenantManagement::TenantSettings:ExternalLoginProviderType:AzureEntra"
      ),
      data: null,
    },
  ];
  public validators = {
    clientId: false,
    clientSecret: false,
    authority: false,
  };

  @Input()
  public tenantId: string;

  public selectedProvider: ExternalProvider;

  constructor(
    private localizationService: ILocalizationService,
    private msgService: LocalizedMessageService,
    private confirmationService: LocalizedConfirmationService,
    private tenantSettingService: ITenantSettingService
  ) {}

  public ngOnInit(): void {
    this.initProviders([]);
    this.loading = true;
    this.tenantSettingService
      .getSettingsByTenantId(this.tenantId)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((res) => {
        this.initProviders(res.externalProviders);
      });
  }

  public save(): void {
    if (!this.validate()) {
      return;
    }

    if (this.selectedProvider.type === null) {
      this.providersSaved.emit();
      return;
    }

    for (const provider of this.providers) {
      provider.data.enabled = false;
    }

    this.selectedProvider.data.enabled = true;

    this.loading = true;
    this.tenantSettingService
      .setExternalProviderSettings({
        tenantId: this.tenantId,
        providers: this.providers.map((x) => x.data),
      })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(() => {
        this.msgService.success(
          "TenantManagement::TenantSettings:ExternalLogin:SaveSuccess"
        );
        this.providersSaved.emit();
      });
  }

  private validate(): boolean {
    if (this.loading || this.providers.length === 0) {
      return false;
    }

    if (!this.selectedProvider.data.type) {
      return true;
    }

    this.validators.authority = false;
    this.validators.clientId = false;
    this.validators.clientSecret = false;

    let errors: string[] = [];
    if (!this.selectedProvider.data.clientId?.trim().length) {
      errors.push(
        "TenantManagement::TenantSettings:ExternalLogin:Errors:ClientIdMissing"
      );
      this.validators.clientId = true;
    }

    if (!this.selectedProvider.data.clientSecret?.trim().length) {
      errors.push(
        "TenantManagement::TenantSettings:ExternalLogin:Errors:ClientSecretMissing"
      );
      this.validators.clientSecret = true;
    }

    if (!this.selectedProvider.data.authority?.trim().length) {
      errors.push(
        "TenantManagement::TenantSettings:ExternalLogin:Errors:AuthorityMissing"
      );
      this.validators.authority = true;
    }

    if (errors.length) {
      this.msgService.errorMany(errors);
      return false;
    }

    return true;
  }

  private initProviders(providers: TenantExternalLoginProviderDto[]): void {
    for (const provider of providers) {
      const providerForDisplay = this.providers.find(
        (x) => x.type === provider.type
      );

      if (providerForDisplay) {
        providerForDisplay.data = provider;
      }
    }

    for (const provider of this.providers) {
      if (!provider.data) {
        provider.data = {
          type: provider.type,
          enabled: false,
          clientId: "",
          clientSecret: "",
          authority: "",
        };
      }
    }

    this.selectedProvider =
      this.providers.find((x) => x.data.enabled) ||
      this.providers.find((x) => x.type === ExternalLoginProviderType.Local);
  }
}
