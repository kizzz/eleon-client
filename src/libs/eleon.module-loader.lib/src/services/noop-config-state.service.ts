import { Observable } from 'rxjs/internal/Observable';
import { of } from 'rxjs/internal/observable/of';
import { EleoncoreApplicationConfigurationDto, ApplicationGlobalFeatureConfigurationDto, IApplicationConfigurationManager } from '@eleon/contracts.lib';


export class NoopConfigStateService extends IApplicationConfigurationManager {
  get configUpdate$(): Observable<void> {
    return of();
  }
	
  private emptyConfig: EleoncoreApplicationConfigurationDto = {} as any;
  private emptyGlobalConfig: ApplicationGlobalFeatureConfigurationDto = {} as any;

  async init() {
  }

	async waitForInitialization(): Promise<void> {
	}

  setState(config: EleoncoreApplicationConfigurationDto): void {
    // No-op
  }

  get createOnUpdateStream(): Observable<null> {
    return of(null);
  }

  refreshAppState(): Observable<EleoncoreApplicationConfigurationDto> {
    return of(this.emptyConfig);
  }

  refreshLocalization(lang: string): Observable<null> {
    return of(null);
  }

  getAppConfig$(): Observable<EleoncoreApplicationConfigurationDto> {
    return of(this.emptyConfig);
  }

  getAppConfig(): EleoncoreApplicationConfigurationDto {
    return this.emptyConfig;
  }

  getFeature(key: string): string | undefined {
    return undefined;
  }

  getFeature$(key: string): Observable<string | undefined> {
    return of(undefined);
  }

  getApplicationSettingBoolean(key: string): boolean {
    return false;
  }

  getFeatures(keys: string[]): Record<string, string> | undefined {
    return {};
  }

  getFeatures$(keys: string[]): Observable<Record<string, string> | undefined> {
    return of({});
  }

  getSetting(key: string): string | undefined {
    return undefined;
  }

  getSetting$(key: string): Observable<string | undefined> {
    return of(undefined);
  }

  getSettings(keyword?: string): Record<string, string> {
    return {};
  }

  getSettings$(keyword?: string): Observable<Record<string, string>> {
    return of({});
  }

  getGlobalFeatures(): ApplicationGlobalFeatureConfigurationDto {
    return this.emptyGlobalConfig;
  }

  getGlobalFeatures$(): Observable<ApplicationGlobalFeatureConfigurationDto> {
    return of(this.emptyGlobalConfig);
  }

  getGlobalFeatureIsEnabled(key: string): boolean {
    return false;
  }

  getGlobalFeatureIsEnabled$(key: string): Observable<boolean> {
    return of(false);
  }
}
