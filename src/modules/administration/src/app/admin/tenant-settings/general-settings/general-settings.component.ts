import { Component, OnInit } from "@angular/core";
import {
  TenantSettingsService,
  TenantSystemHealthSettingsDto,
  SystemLogLevel,
  TelemetrySettingsDto,
} from '@eleon/tenant-management-proxy';
import {   CurrencyService,
  CurrencyDto, } from '@eleon/infrastructure-proxy';
import { Observable, finalize, map, forkJoin, switchMap } from "rxjs";
import { PageStateService } from "@eleon/primeng-ui.lib";
import { of } from "rxjs";

import { ILocalizationService } from '@eleon/angular-sdk.lib';
@Component({
  standalone: false,
  selector: "app-general-tenant-settings",
  templateUrl: "./general-settings.component.html",
  styleUrl: "./general-settings.component.scss",
})
export class GeneralTenantSettingsComponent implements OnInit {
  loading = false;
	systemCurrency: CurrencyDto = {} as CurrencyDto;
	newCurrency: string = '';
	currencyOptions: { name: string, value: string }[] = [];
	showCurrencyRates = false;
  title = "TenantManagement::TenantSettings:GeneralSettings";

  systemHealthSettings: TenantSystemHealthSettingsDto = {
    telemetry: {
      enabled: false,
      enabledOnClient: false,
      tracesUseBatch: false,
      metricsUseBatch: false, 
      logsUseBatch: false,
      tracesEndpoint: '',
      tracesProtocol: '',
      metricsEndpoint: '',
      metricsProtocol: '',
      logsEndpoint: '',
      logsProtocol: ''
    },
    logging: {
      sendLogsFromUI: false,
      minimumLogLevel: SystemLogLevel.Info
    }
  };
  
  logLevelOptions: { name: string, value: SystemLogLevel }[] = [];

  constructor(
    private currencyService: CurrencyService,
    public state: PageStateService,
    private tenantSettingService: TenantSettingsService,
    private localizationService: ILocalizationService
  ) {}

  public ngOnInit(): void {
    this.setLogLevelOptions();
    this.loadCurrencies();
    this.loadSettings().subscribe();
  }

  public save(): Observable<void> {
    const observables: Observable<any>[] = [];

    // Handle currency change
    if (this.newCurrency && this.newCurrency !== this.systemCurrency.code) {
      this.systemCurrency.code = this.newCurrency;
      observables.push(this.currencyService.setSystemCurrency(this.newCurrency));
    }

    // Handle system health settings change
    observables.push(this.buildLoggingUpdateRequest());

    if (observables.length === 0) {
      return of();
    }

    this.loading = true;
    return forkJoin(observables)
      .pipe(
        finalize(() => (this.loading = false)),
        map(() => {
          this.state.setNotDirty();
        }));
  }

  public reset(): Observable<void> {
    return this.loadSettings();
  }

  private loadSettings(): Observable<void> {
    this.loading = true;

    return forkJoin({
      systemCurrency: this.currencyService.getSystemCurrency(),
      systemHealthSettings: this.tenantSettingService.getTenantSystemHealthSettings()
    }).pipe(
      finalize(() => (this.loading = false)),
      map((results) => {
        this.systemCurrency = results.systemCurrency;
        this.newCurrency = this.systemCurrency.code;
        this.systemHealthSettings = results.systemHealthSettings;
        if (!this.systemHealthSettings.logging) {
          this.systemHealthSettings.logging = {
            sendLogsFromUI: false,
            minimumLogLevel: SystemLogLevel.Critical
          };
        }
        if (!this.systemHealthSettings.telemetry) {
          this.systemHealthSettings.telemetry = { } as TelemetrySettingsDto;
        }
      })
    );    
  }
  
	private loadCurrencies() {
		this.loading = true;
		return this.currencyService
			.getCurrencies()
			.pipe(finalize(() => (this.loading = false)))
			.subscribe(res =>{
				this.currencyOptions = res.map(c => ({ name: c.code, value: c.code }))
			});
	}

  resetValidators(): void {
    
  }

	onCurrencyChange(): void {
		this.state.setDirty();
		this.resetValidators();
	}

  onSystemHealthSettingsChange(): void {
    this.state.setDirty();
    this.resetValidators();
  }

  private setLogLevelOptions(): void {
    this.logLevelOptions = [
      { name: this.localizationService.instant('TenantManagement::SystemLogLevel:Information'), value: SystemLogLevel.Info },
      { name: this.localizationService.instant('TenantManagement::SystemLogLevel:Warning'), value: SystemLogLevel.Warning },
      { name: this.localizationService.instant('TenantManagement::SystemLogLevel:Critical'), value: SystemLogLevel.Critical }
    ];
  }

  private buildLoggingUpdateRequest(): Observable<boolean> {
    return this.tenantSettingService
      .getTenantSystemHealthSettings()
      .pipe(
        switchMap((currentSettings) => {
          const updatedSettings: TenantSystemHealthSettingsDto = {
            ...currentSettings,
            logging: this.systemHealthSettings.logging,
          };

          return this.tenantSettingService.updateTenantSystemHealthSettings(updatedSettings);
        })
      );
  }
}
