import { DOCUMENT, Inject, Injectable, WritableSignal, effect, signal } from "@angular/core";
import { IAuthManager, IApplicationConfigurationManager } from '@eleon/angular-sdk.lib';
import { UserSettingsService } from '@eleon/tenant-management-proxy';
import { Observable, Subject, first, map, of } from "rxjs";
import { IAssetLoaderService } from '@eleon/angular-sdk.lib';
import { PrimeNG } from "primeng/config";
// import { updatePrimaryPalette } from '@primeuix/themes';
// import { updateSurfacePalette } from '@primeuix/themes';
// import { palette } from '@primeuix/themes';
// import { updatePreset } from '@primeuix/themes';
// import { usePreset } from '@primeuix/themes';

import {
  IModuleSettingService,
  ILayoutService,
  LayoutState,
  LayoutInitConfig,
} from '@eleon/angular-sdk.lib';
@Injectable({
  providedIn: "root",
})
export class LayoutService extends ILayoutService  {
  _state: LayoutState = this.getDefaultState();

  config: WritableSignal<LayoutState> = signal<LayoutState>(this._state);

  private configUpdate = new Subject<LayoutState>();
  private overlayOpen = new Subject<any>();
  private topbarMenuOpen = new Subject<any>();

  topbarMenuOpen$ = this.topbarMenuOpen.asObservable();
  configUpdate$ = this.configUpdate.asObservable();
  overlayOpen$ = this.overlayOpen.asObservable();

  private menuProfileOpen = new Subject<any>();
  menuProfileOpen$ = this.menuProfileOpen.asObservable();

  updatable = false;
  localStorageKey = "";
  topbarThemes: { name: string; color: string; isDark: boolean; }[];

  currentTheme = this.getDefaultState();

  constructor(
    public userSettings: UserSettingsService,
    public configStateService: IApplicationConfigurationManager,
    public moduleSettings: IModuleSettingService,
    public assetLoader: IAssetLoaderService,
    public authService: IAuthManager,
    private primeng: PrimeNG,
    @Inject(DOCUMENT) private readonly doc: Document,
  ) {
    super();

    const userId = this.configStateService.getAppConfig().currentUser?.id;
    this.localStorageKey = "appearance-" + userId;

    // this.configStateService.getDeep$("currentUser.id").subscribe(result => {
    //   if (result && result != userId) {
    //     location.reload();
    //   }
    // });

    this.initLayout();
    // initial theme application
    this.changeTheme();

    effect(() => {
      const configVal = this.config();

      if (this.updateStyle(configVal)) {
        this.changeTheme();
        this.currentTheme = configVal;
      }
      this.changeScale(configVal.scale);
      if (configVal.isSave) {
        this.onConfigUpdate();
      }
    });

    this.getConfig().subscribe((result: LayoutState) => {
      this.config.update(() => result);
      this.configUpdate$.subscribe((newState: LayoutState) => {
        if (deepEqual(result, newState)) {
          return;
        }
        const userSettingEnabled = this.configStateService.getAppConfig()['clientApplication']?.properties
          .find(t => t.key == "UserSetting")?.value === 'true';
        if (userSettingEnabled) {
          this.saveUserSettings(newState);
        }
      });
    });
  }

  // fetch default state from environment settings and merge with default UI flags
  getDefaultState(): LayoutState {
    const baseConfig = JSON.parse(
      this.moduleSettings.getSettingByKey("Primeng Layout_Module", 'LayoutInitConfig')?.value ?? '{}'
    );
    return {
      ...this.getDefaultInitConfig(),
      ...baseConfig,
      staticMenuDesktopInactive: false,
      overlayMenuActive: false,
      profileSidebarVisible: false,
      configSidebarVisible: false,
      staticMenuMobileActive: false,
      menuHoverActive: false,
      anchored: false,
      sidebarActive: false,
      topbarMenuActive: false,
      menuProfileActive: false,
      isFullWidth: false,
    };
  }

  // Transform LayoutState into LayoutInitConfig by omitting UI state properties
  private transformStateToConfig(state: LayoutState): LayoutInitConfig {
    const {
      staticMenuDesktopInactive,
      overlayMenuActive,
      profileSidebarVisible,
      configSidebarVisible,
      staticMenuMobileActive,
      menuHoverActive,
      anchored,
      sidebarActive,
      topbarMenuActive,
      menuProfileActive,
      isFullWidth,
      ...initConfig
    } = state;
    return initConfig;
  }

  // Save user settings: transform state and send to server and local storage
  private saveUserSettings(state: LayoutState) {
    const configToSave = this.transformStateToConfig(state);
    const appId = this.configStateService.getAppConfig()['clientApplication']?.['id'];
    if (!this.authService.isAuthenticated()) {
      return;
    }
    this.userSettings.setAppearanceSettingByAppearanceSettingsDtoAndAppId(JSON.stringify(configToSave), appId)
      .pipe(first())
      .subscribe(() => {
        localStorage.setItem(this.localStorageKey, JSON.stringify(configToSave));
      });
  }

  resetToDefault() {
    this.config.update(() => ({ ...this.getDefaultState(), isSave: true }));
  }

  resetLayout(): Observable<boolean> {
    this.config.update(current => ({ ...current, isFullWidth: false }));
    return this.getConfig().pipe(map((result: LayoutState) => {
      this.config.update(() => result);
      return true;
    }));
  }

  getConfig(): Observable<LayoutState> {
    const userSettingEnabled = this.configStateService.getAppConfig()['clientApplication']?.['properties']
      ?.find(t => t.key == "UserSetting")?.value === 'true';

    if (!userSettingEnabled) {
      return of({
        ...this.getDefaultState(),
      });
    }

    const localConfig = localStorage.getItem(this.localStorageKey);
    if (localConfig) {
      const baseConfig = JSON.parse(localConfig);
      const defaultState = this.getDefaultState();
      const merged: LayoutState = {
        ...defaultState,
        ...baseConfig
      };
      return of(merged);
    }
    const defaultState = this.getDefaultState();
    const appId = this.configStateService.getAppConfig()['clientApplication']['id'];
    if (!this.authService.isAuthenticated()) {
      return of(defaultState);
    }
    return this.userSettings.getAppearanceSettingByAppId(appId).pipe(
      first(),
      map((c) => {
        if (c.isFailed) {
          return defaultState;
        }
        const setting = JSON.parse(c.value ?? '{}');

        return {
          ...defaultState,
          ...setting,
        };
      }),
      map((c: LayoutState) => {
        localStorage.setItem(this.localStorageKey, JSON.stringify(this.transformStateToConfig(c)));
        return c;
      })
    );
  }

  updateStyle(state: LayoutState) {
    if (!this.currentTheme) {
      return true;
    }

    return (
      state.componentTheme !== this.currentTheme.componentTheme ||
      state.colorScheme !== this.currentTheme.colorScheme
    );
  }

  onMenuToggle() {
    this.config.update(current => {
      if (this.isOverlay()) {
        current.overlayMenuActive = !current.overlayMenuActive;
        if (current.overlayMenuActive) {
          this.overlayOpen.next(null);
        }
      }
      if (this.isDesktop()) {
        current.staticMenuDesktopInactive = !current.staticMenuDesktopInactive;
      } else {
        current.staticMenuMobileActive = !current.staticMenuMobileActive;
        if (current.staticMenuMobileActive) {
          this.overlayOpen.next(null);
        }
      }
      return { ...current };
    });
  }

  onOverlaySubmenuOpen() {
    this.overlayOpen.next(null);
  }

  showProfileSidebar() {
    this.config.update(current => {
      current.profileSidebarVisible = !current.profileSidebarVisible;
      if (current.profileSidebarVisible) {
        this.overlayOpen.next(null);
      }
      return { ...current };
    });
  }

  showConfigSidebar() {
    this.config.update(current => {
      current.configSidebarVisible = true;
      return { ...current };
    });
  }

  isOverlay() {
    return this.config().menuMode === "overlay";
  }

  isDesktop() {
    return window.innerWidth > 991;
  }

  isMobile() {
    return !this.isDesktop();
  }

  isSlim() {
    return this.config().menuMode === "slim";
  }

  isSlimPlus() {
    return this.config().menuMode === "slim-plus";
  }

  isHorizontal() {
    return this.config().menuMode === "horizontal";
  }

  onConfigUpdate() {
    this._state = { ...this.config() };
    this.configUpdate.next(this.config());
  }

  initLayout() {
    this.doc.documentElement.style.setProperty('--p-popover-content-padding', '0rem');
  }

  changeTheme() {
    const { colorScheme, theme, componentTheme, topbarTheme, menuTheme } = this.config();
    const themeLink = <HTMLLinkElement>document.getElementById('theme-css');
    const themeLinkHref = themeLink?.getAttribute('href')!;

    if (themeLinkHref) {
      const newHref = themeLinkHref
      .split('/')
      .map((el) =>
        el === this.currentTheme.theme ? theme : el === `theme-${this.currentTheme.colorScheme}` ? `theme-${colorScheme}` : el
      )
      .join('/');
      this.replaceThemeLink(newHref);
    }

    this.doc.documentElement.classList.toggle('eleon-dark-mode', colorScheme === 'dark');

    this.doc.documentElement.style.setProperty('--p-primary-50', `var(--p-${componentTheme}-50)`);
    this.doc.documentElement.style.setProperty('--p-primary-100', `var(--p-${componentTheme}-100)`);
    this.doc.documentElement.style.setProperty('--p-primary-200', `var(--p-${componentTheme}-200)`);
    this.doc.documentElement.style.setProperty('--p-primary-300', `var(--p-${componentTheme}-300)`);
    this.doc.documentElement.style.setProperty('--p-primary-400', `var(--p-${componentTheme}-400)`);
    this.doc.documentElement.style.setProperty('--p-primary-500', `var(--p-${componentTheme}-500)`);
    this.doc.documentElement.style.setProperty('--p-primary-600', `var(--p-${componentTheme}-600)`);
    this.doc.documentElement.style.setProperty('--p-primary-700', `var(--p-${componentTheme}-700)`);
    this.doc.documentElement.style.setProperty('--p-primary-800', `var(--p-${componentTheme}-800)`);
    this.doc.documentElement.style.setProperty('--p-primary-900', `var(--p-${componentTheme}-900)`);
    this.doc.documentElement.style.setProperty('--p-primary-950', `var(--p-${componentTheme}-950)`);

    // updatePrimaryPalette({
    //   50: `{${componentTheme}.50}`,
    //   100: `{${componentTheme}.100}`,
    //   200: `{${componentTheme}.200}`,
    //   300: `{${componentTheme}.300}`,
    //   400: `{${componentTheme}.400}`,
    //   500: `{${componentTheme}.500}`,
    //   600: `{${componentTheme}.600}`,
    //   700: `{${componentTheme}.700}`,
    //   800: `{${componentTheme}.800}`,
    //   900: `{${componentTheme}.900}`,
    //   950: `{${componentTheme}.950}`
    // });
  }

  replaceThemeLink(href: string) {
    const id = 'theme-css';
    let themeLink = <HTMLLinkElement>document.getElementById(id);
    const cloneLinkElement = <HTMLLinkElement>themeLink.cloneNode(true);
    cloneLinkElement.setAttribute('href', href);
    cloneLinkElement.setAttribute('id', id + '-clone');
    themeLink.parentNode!.insertBefore(cloneLinkElement, themeLink.nextSibling);
    cloneLinkElement.addEventListener('load', () => {
      themeLink.remove();
      cloneLinkElement.setAttribute('id', id);
    });
  }

  changeScale(value: number) {
    document.documentElement.style.fontSize = `${value}px`;
  }

  onMenuProfileToggle() {
    this.config.update(current => {
      current.menuProfileActive = !current.menuProfileActive;
      if (current.menuProfileActive && this.isHorizontal() && this.isDesktop()) {
        this.menuProfileOpen.next(null);
      }
      return { ...current };
    });
  }

  getDefaultInitConfig(): LayoutInitConfig {
    return {
      ripple: true,
      inputStyle: "outlined",
      menuMode: "static",
      menuTheme: "light",
      colorScheme: "light",
      componentTheme: "indigo",
      topbarTheme: "white",
      theme: "lara-light-indigo",
      scale: 13,
      menuProfilePosition: "end",
      isCustom: false,
      isSave: false,
    };
  }

  getDefaultCustomConfig(): Partial<LayoutState> {
    return {
      menuTheme: "light",
      componentTheme: "indigo",
      topbarTheme: "white",
      isCustom: false,
    };
  }
}

function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;

  if (typeof obj1 !== "object" || typeof obj2 !== "object" || obj1 == null || obj2 == null) {
    return false;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!deepEqual(obj1[key], obj2[key])) return false;
  }

  return true;
}

