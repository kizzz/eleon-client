import { DEFAULT_IMAGES, IApplicationConfigurationManager } from '@eleon/contracts.lib';
import { TenantAppearanceService } from '@eleon/tenant-management-proxy';
import { FileHelperService } from '@eleon/primeng-ui.lib';
import {
  Observable,
  ReplaySubject,
  Subject,
  firstValueFrom,
  map,
  of,
} from "rxjs";
import { IAppearanceService, AppearanceSettings } from '@eleon/contracts.lib'


export class AppearanceService extends IAppearanceService {
  private appearanceSettings: AppearanceSettings;

  private tenantOverrides$: Subject<void>;

  public lightLogo$ = new ReplaySubject<string>(1);
  public lightIcon$ = new ReplaySubject<string>(1);
  public darkLogo$ = new ReplaySubject<string>(1);
  public darkIcon$ = new ReplaySubject<string>(1);

  private fileHelperService = new FileHelperService();

  constructor(
    private config: IApplicationConfigurationManager,
    private tenantAppearanceService: TenantAppearanceService
  ) {
    super();
  }

  public getSettings(): Observable<AppearanceSettings> {
    if (this.appearanceSettings) {
      return of(this.appearanceSettings);
    }

    return this.tenantOverrides$.pipe(map(() => this.appearanceSettings));
  }

  public async update(): Promise<void> {
    this.appearanceSettings = null;
    this.tenantOverrides$ = new Subject();
    const settings = await firstValueFrom(
      this.tenantAppearanceService.getTenantAppearanceSettings()
    );
    this.initWithOverrides(settings as AppearanceSettings);
    this.tenantOverrides$.next();
  }

  public init(): void {
    const overrides: AppearanceSettings = {
      lightIcon: this.config.getAppConfig().extraProperties.LightTenantIcon as any,
      lightLogo: this.config.getAppConfig().extraProperties.LightTenantLogo as any,
      darkIcon: this.config.getAppConfig().extraProperties.DarkTenantIcon as any,
      darkLogo: this.config.getAppConfig().extraProperties.DarkTenantLogo as any,
    };

    this.initWithOverrides(overrides);
  }

  private initWithOverrides(appearanceOverrides: AppearanceSettings): void {
    this.appearanceSettings = {
      ...DEFAULT_IMAGES,
    };

    for (const key in appearanceOverrides) {
      if (Object.prototype.hasOwnProperty.call(appearanceOverrides, key)) {
        const override = appearanceOverrides[key];
        if (override?.length) {
          this.appearanceSettings[key] = this.fileHelperService.base64ToDataURL(
            "application/image",
            override
          );
        }
      }
    }

    this.lightLogo$.next(this.appearanceSettings.lightLogo);
    this.lightIcon$.next(this.appearanceSettings.lightIcon);
    this.darkLogo$.next(this.appearanceSettings.darkLogo);
    this.darkIcon$.next(this.appearanceSettings.darkIcon);

    const icon =
      this.appearanceSettings.lightIcon || this.appearanceSettings.darkIcon;
    if (icon) {
      var link = document.querySelector(
        "link[rel='shortcut icon']"
      ) as HTMLLinkElement;
      link.href = icon.replace("data:application/image;", "data:image/x-icon;");
    }
  }
}
