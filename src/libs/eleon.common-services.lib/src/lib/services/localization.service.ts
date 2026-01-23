import { BehaviorSubject, combineLatest, from, Observable, Subject } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
import { differentLocales, LocalizationWithDefault } from '@eleon/contracts.lib';
import { IApplicationConfigurationManager } from '@eleon/contracts.lib';
import { ApplicationLocalizationResourceDto, EleoncoreApplicationConfigurationDto } from '@eleon/contracts.lib';
import { createLocalizer, createLocalizerWithFallback, interpolate } from '../helpers';
import { ILocalizationService, ISessionStateService, Localization } from '@eleon/contracts.lib'


export interface LocaleErrorHandlerData {
  resolve: any;
  reject: any;
  error: any;
  locale: string;
}

let localeMap = {} as { [key: string]: string };

export interface RegisterLocaleData {
  cultureNameLocaleFileMap?: Record<string, string>;
  errorHandlerFn?: (data: LocaleErrorHandlerData) => any;
}

export function registerLocale(
  {
    cultureNameLocaleFileMap = {},
    errorHandlerFn = defaultLocalErrorHandlerFn,
  } = {} as RegisterLocaleData,
) {
  return (locale: string): Promise<any> => {
    localeMap = { ...differentLocales, ...cultureNameLocaleFileMap };
    const localePath = `/locales/${localeMap[locale] || locale}`;
    return new Promise((resolve, reject) => {
      return import(
        /* webpackMode: "lazy-once" */
        /* webpackChunkName: "locales"*/
        /* webpackInclude: /[/\\](ar|cs|en|en-GB|es|de|fi|fr|hi|hu|is|it|pt|tr|ru|ro|sk|sl|zh-Hans|zh-Hant)\.(mjs|js)$/ */
        /* webpackExclude: /[/\\]global|extra/ */
        `@angular/common${localePath}`
      )
        .then(val => {
          let module = val;
          while (module.default) {
            module = module.default;
          }
          resolve({ default: module });
        })
        .catch(error => {
          errorHandlerFn({
            resolve,
            reject,
            error,
            locale,
          });
        });
    });
  };
}

const extraLocales = {} as { [key: string]: any };
export function storeLocaleData(data: any, localeId: string) {
  extraLocales[localeId] = data;
}

export async function defaultLocalErrorHandlerFn({ locale, resolve }: LocaleErrorHandlerData) {
  if (extraLocales[locale]) {
    resolve({ default: extraLocales[localeMap[locale] || locale] });
    return;
  }

  if (isDevMode()) {
    console.error(
      `Cannot find the ${locale} locale file. You can check how can add new culture at https://docs.abp.io/en/abp/latest/UI/Angular/Localization#adding-a-new-culture`,
    );
  }

  resolve();
}



export function isDevMode() {
  return !window['production'];
}


export const localizations$ = new BehaviorSubject<Localization[]>([]);

export class LocalizationService extends ILocalizationService {
  private latestLang = this.sessionState.getLanguage();
  private _languageChange$ = new Subject<string>();

  private uiLocalizations$ = new BehaviorSubject(
    new Map<string, Map<string, Record<string, string>>>(),
  );

  private localizations$ = new BehaviorSubject(new Map<string, Record<string, string>>());

  /**
   * Returns currently selected language
   * Even though this looks like it's redundant to return the same value as `getLanguage()`,
   * it's actually not. This could be invoked any time, and the latestLang could be different from the
   * sessionState.getLanguage() value.
   */
  get currentLang(): string {
    return this.latestLang || this.sessionState.getLanguage();
  }

  get currentLang$(): Observable<string> {
    return this.sessionState.getLanguage$();
  }

  get languageChange$(): Observable<string> {
    return this._languageChange$.asObservable();
  }

  constructor(
    private sessionState: ISessionStateService,
    private configState: IApplicationConfigurationManager,
  ) {

    super();
    this.listenToSetLanguage();
    this.initLocalizationValues();
  }

  private initLocalizationValues() {
    localizations$.subscribe(val => this.addLocalization(val));

    const legacyResources$ = this.configState.getAppConfig$().pipe(map(c => c.localization.values)) as Observable<
      Record<string, Record<string, string>>
    >;

    const remoteLocalizations$ = this.configState.getAppConfig$().pipe(map(c => c.localization.resources)) as Observable<
      Record<string, ApplicationLocalizationResourceDto>
    >;

    const currentLanguage$ = this.sessionState.getLanguage$();

    const uiLocalizations$ = combineLatest([currentLanguage$, this.uiLocalizations$]).pipe(
      map(([currentLang, localizations]) => localizations.get(currentLang)),
    );

    combineLatest([legacyResources$, remoteLocalizations$, uiLocalizations$])
      .pipe(
        map(([legacy, resource, local]) => {
          if (!resource) {
            return;
          }
          const remote = combineLegacyandNewResources(legacy || {}, resource);
          if (remote) {
            if (!local) {
              local = new Map();
            }

            Object.entries(remote).forEach(entry => {
              const resourceName = entry[0];
              const remoteTexts = entry[1];
              let resource = local?.get(resourceName) || {};
              resource = { ...resource, ...remoteTexts };

              local?.set(resourceName, resource);
            });
          }

          return local;
        }),
        filter(Boolean),
      )
      .subscribe(val => this.localizations$.next(val));
  }

  addLocalization(localizations?: Localization[]) {
    if (!localizations) return;

    const localizationMap = this.uiLocalizations$.value;

    localizations.forEach(loc => {
      const cultureMap = localizationMap.get(loc.culture) || new Map<string, Record<string, string>>();

      Object.entries(loc.resources).map(([resourceName, properties]) => ({
					resourceName,
					...properties
				})).forEach(res => {
        let resource: Record<string, string> = cultureMap.get(res.resourceName) || {};

        resource = { ...resource, ...res.texts };

        cultureMap.set(res.resourceName, resource);
      });

      localizationMap.set(loc.culture || ((loc as any).currentCulture.name), cultureMap);
    });

    this.uiLocalizations$.next(localizationMap);
  }

  private listenToSetLanguage() {
    this.sessionState
      .onLanguageChange$()
      .pipe(
        filter(
          lang => this.configState.getAppConfig().localization.currentCulture.cultureName !== lang,
        ),
        switchMap(lang => this.configState.refreshLocalization(lang).pipe(map(() => lang))),
        filter(Boolean),
        switchMap(lang => from(this.registerLocale(lang).then(() => lang))),
      )
      .subscribe(lang => this._languageChange$.next(lang));
  }

  registerLocale(locale: string) {
    const registerLocaleFn = registerLocale();

    return registerLocaleFn(locale).then(module => {
      // if (module?.default) registerLocaleData(module.default);
      this.latestLang = locale;
    });
  }

  /**
   * Returns an observable localized text with the given interpolation parameters in current language.
   * @param key Localizaton key to replace with localized text
   * @param interpolateParams Values to interpolate
   */
  get(key: string | LocalizationWithDefault, ...interpolateParams: string[]): Observable<string> {
    return this.configState
      .getAppConfig$()
      .pipe(map(state => this.getLocalization(state, key, ...interpolateParams)));
  }

  getResource(resourceName: string) {
    return this.localizations$.value.get(resourceName);
  }

  getResource$(resourceName: string) {
    return this.localizations$.pipe(map(res => res.get(resourceName)));
  }

  /**
   * Returns localized text with the given interpolation parameters in current language.
   * @param key Localization key to replace with localized text
   * @param interpolateParams Values to intepolate.
   */
  instant(key: string | LocalizationWithDefault, ...interpolateParams: string[]): string {
    return this.getLocalization(this.configState.getAppConfig(), key, ...interpolateParams);
  }

  localize(resourceName: string, key: string, defaultValue: string): Observable<string | null> {
    return this.configState.getAppConfig$().pipe(
      map(c => c.localization),
      map(createLocalizer),
      map(localize => localize(resourceName, key, defaultValue)),
    );
  }

  localizeSync(resourceName: string, key: string, defaultValue: string): string | null {
    const localization = this.configState.getAppConfig().localization;
    return createLocalizer(localization)(resourceName, key, defaultValue);
  }

  localizeWithFallback(
    resourceNames: string[],
    keys: string[],
    defaultValue: string,
  ): Observable<string> {
    return this.configState.getAppConfig$().pipe(
      map(c => c.localization),
      map(createLocalizerWithFallback),
      map(localizeWithFallback => localizeWithFallback(resourceNames, keys, defaultValue)),
    );
  }

  localizeWithFallbackSync(resourceNames: string[], keys: string[], defaultValue: string): string {
    const localization = this.configState.getAppConfig().localization;
    return createLocalizerWithFallback(localization)(resourceNames, keys, defaultValue);
  }

  private getLocalization(
    state: EleoncoreApplicationConfigurationDto,
    key: string | LocalizationWithDefault,
    ...interpolateParams: string[]
  ) {
    let defaultValue = '';

    if (!key) {
      return defaultValue;
    }

    if (typeof key !== 'string') {
      defaultValue = key.defaultValue;
      key = key.key;
    }

    const keys = key.split('::') as string[];
    const warn = (message: string) => {
      if (isDevMode()) console.warn(message);
    };

    if (keys.length < 2) {
      warn('The localization source separator (::) not found.');
      return defaultValue || (key as string);
    }
    if (!state.localization) return defaultValue || keys[1];

    const sourceName = keys[0] || state.localization.defaultResourceName;
    const sourceKey = keys[1];

    if (sourceName === '_') {
      return defaultValue || sourceKey;
    }

    if (!sourceName) {
      warn(
        'Localization source name is not specified and the defaultResourceName was not defined!',
      );

      return defaultValue || sourceKey;
    }

    const source = this.localizations$.value.get(sourceName);
    if (!source) {
      warn('Could not find localization source: ' + sourceName);
      return defaultValue || sourceKey;
    }

    let localization = source[sourceKey];
    if (typeof localization === 'undefined') {
      return defaultValue || sourceKey;
    }

    interpolateParams = interpolateParams.filter(params => params != null);
    if (localization) localization = interpolate(localization, interpolateParams);

    if (typeof localization !== 'string') localization = '';

    return localization || defaultValue || (key as string);
  }
}

function recursivelyMergeBaseResources(
  baseResourceName: string,
  source: ResourceDto,
): ApplicationLocalizationResourceDto {
  const item = source[baseResourceName];

  if (item.baseResources.length === 0) {
    return item;
  }

  return item.baseResources.reduce((acc, baseResource) => {
    const baseItem = recursivelyMergeBaseResources(baseResource, source);
    const texts = { ...baseItem.texts, ...item.texts };
    return { ...acc, texts };
  }, item);
}

function mergeResourcesWithBaseResource(resource: ResourceDto): ResourceDto {
  const entities: Array<[string, ApplicationLocalizationResourceDto]> = Object.keys(resource).map(
    key => {
      const newValue = recursivelyMergeBaseResources(key, resource);
      return [key, newValue];
    },
  );
  return entities.reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
}

function combineLegacyandNewResources(
  legacy: LegacyLanguageDto,
  resource: ResourceDto,
): LegacyLanguageDto {
  const mergedResource = mergeResourcesWithBaseResource(resource);

  return Object.entries(mergedResource).reduce((acc, [key, value]) => {
    return { ...acc, [key]: value.texts };
  }, legacy);
}

export type LegacyLanguageDto = Record<string, Record<string, string>>;
export type ResourceDto = Record<string, ApplicationLocalizationResourceDto>;
