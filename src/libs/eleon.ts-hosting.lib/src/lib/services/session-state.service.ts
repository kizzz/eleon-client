import compare from 'just-compare';
import { filter, map, take } from 'rxjs/operators';
import { InternalStore } from '@eleon/typescript-sdk.lib';
import { LocalStorageService } from './local-storage.service';
import { IApplicationConfigurationManager } from '@eleon/contracts.lib';
import { CurrentTenantDto, ISessionStateService } from '@eleon/contracts.lib'

export interface State {
  language: string;
  tenant: CurrentTenantDto | null;
}

export class SessionStateService extends ISessionStateService {
  private readonly store = new InternalStore({} as State);

  private updateLocalStorage = () => {
    this.localStorageService.setItem('abpSession', JSON.stringify(this.store.state));
  };

  constructor(
    private configState: IApplicationConfigurationManager,
    private localStorageService: LocalStorageService,
  ) {
    super();
    this.init();
    this.setInitialLanguage();
  }

  private init() {
    const session = this.localStorageService.getItem('abpSession');
    if (session) {
      this.store.set(JSON.parse(session));
    }

    this.store.sliceUpdate(state => state).subscribe(this.updateLocalStorage);
  }

  private setInitialLanguage() {
    const appLanguage = this.getLanguage();

    this.configState
      .getAppConfig$()
      .pipe(
        map(c => c.localization.currentCulture.cultureName),
        filter(cultureName => !!cultureName),
        take(1),
      )
      .subscribe(lang => {
        if (lang.includes(';')) {
          lang = lang.split(';')[0];
        }
        if (appLanguage !== lang) {
          this.setLanguage(lang);
        }
      });
  }

  onLanguageChange$() {
    return this.store.sliceUpdate(state => state.language);
  }

  onTenantChange$() {
    return this.store.sliceUpdate(state => state.tenant as CurrentTenantDto);
  }

  getLanguage() {
    return this.store.state.language;
  }

  getLanguage$() {
    return this.store.sliceState(state => state.language);
  }

  getTenant() {
    return this.store.state.tenant;
  }

  getTenant$() {
    return this.store.sliceState(state => state.tenant);
  }

  setTenant(tenant: CurrentTenantDto | null) {
    if (compare(tenant, this.store.state.tenant)) return;

    this.store.set({ ...this.store.state, tenant });
  }

  setLanguage(language: string) {
    if (language === this.store.state.language) return;

    this.store.patch({ language });
    document.documentElement.setAttribute('lang', language);
  }
}
