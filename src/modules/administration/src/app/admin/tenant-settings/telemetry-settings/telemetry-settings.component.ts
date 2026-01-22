import { Component, OnInit, Optional } from "@angular/core";
import {
  TenantSettingsService,
  TenantSystemHealthSettingsDto,
  TelemetrySettingsDto,
} from '@eleon/tenant-management-proxy';
import { Observable, finalize, map, switchMap } from "rxjs";
import { PageStateService } from "@eleon/primeng-ui.lib";
import { ILocalizationService, IProvidersService, StorageProviderDto } from '@eleon/angular-sdk.lib';

@Component({
  standalone: false,
  selector: "app-telemetry-settings",
  templateUrl: "./telemetry-settings.component.html",
  styleUrl: "./telemetry-settings.component.scss",
})
export class TelemetrySettingsComponent implements OnInit {
  loading = false;
  telemetrySettings: TelemetrySettingsDto = this.createDefaultTelemetrySettings();
  title = "TenantManagement::TenantSettings:TelemetrySettings";

  protocolOptions: { name: string; value: string }[] = [];

  constructor(
    private tenantSettingService: TenantSettingsService,
    public state: PageStateService,
    private localizationService: ILocalizationService,
    @Optional() private providersService: IProvidersService
  ) {}

  ngOnInit(): void {
    this.buildProtocolOptions();
    this.loadSettings().subscribe();
  }

  save(): Observable<void> {
    this.loading = true;

    return this.buildTelemetryUpdateRequest().pipe(
      finalize(() => (this.loading = false)),
      map(() => {
        this.state.setNotDirty();
      })
    );
  }

  reset(): Observable<void> {
    return this.loadSettings();
  }

  onTelemetrySettingsChange(): void {
    this.state.setDirty();
  }

  onStorageProviderSelected(dto?: StorageProviderDto): void {
    this.telemetrySettings.storageProviderId = dto?.id ?? undefined;
    this.onTelemetrySettingsChange();
  }

  get telemetryFieldsDisabled(): boolean {
    return !this.telemetrySettings?.enabled;
  }

  private loadSettings(): Observable<void> {
    this.loading = true;

    return this.tenantSettingService.getTenantSystemHealthSettings().pipe(
      finalize(() => (this.loading = false)),
      map((settings) => {
        this.telemetrySettings = {
          ...this.createDefaultTelemetrySettings(),
          ...(settings.telemetry ?? {}),
        };
      })
    );
  }

  private buildTelemetryUpdateRequest(): Observable<boolean> {
    return this.tenantSettingService.getTenantSystemHealthSettings().pipe(
      switchMap((currentSettings) => {
        const updatedSettings: TenantSystemHealthSettingsDto = {
          ...currentSettings,
          telemetry: {
            ...this.createDefaultTelemetrySettings(),
            ...(currentSettings.telemetry ?? {}),
            ...this.telemetrySettings,
          },
        };

        return this.tenantSettingService.updateTenantSystemHealthSettings(
          updatedSettings
        );
      })
    );
  }

  private createDefaultTelemetrySettings(): TelemetrySettingsDto {
    return {
      enabled: false,
      enabledOnClient: false,
      tracesUseBatch: false,
      metricsUseBatch: false,
      logsUseBatch: false,
      tracesEndpoint: "",
      tracesProtocol: "",
      metricsEndpoint: "",
      metricsProtocol: "",
      logsEndpoint: "",
      logsProtocol: "",
      storageProviderId: undefined,
    };
  }

  private buildProtocolOptions(): void {
    this.protocolOptions = [
      {
        name: this.localizationService.instant(
          "TenantManagement::Telemetry:Protocol:Http"
        ),
        value: "http",
      },
      {
        name: this.localizationService.instant(
          "TenantManagement::Telemetry:Protocol:Grpc"
        ),
        value: "grpc",
      },
    ];
  }

  openProviderSelectionDialog(): void {
    if (this.telemetryFieldsDisabled){
      return;
    }

    this.providersService.openProviderSelectionDialog(
      this.telemetrySettings.storageProviderId ?? "",
      (provider: StorageProviderDto) => {
        this.onStorageProviderSelected(provider);
      }
    );
  }
}
