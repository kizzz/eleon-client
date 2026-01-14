import { Subject } from 'rxjs';
import { Observable } from 'rxjs';
import { of } from 'rxjs';
import { map } from 'rxjs';
import { take } from 'rxjs';
import { delay } from 'rxjs';
import { switchMap } from 'rxjs';
import { tap } from 'rxjs';
import { InternalStore } from '@eleon/typescript-sdk.lib';
import { EleoncoreApplicationConfigurationDto, ApplicationConfigurationService } from '../proxy';
import { catchError, defer, filter, from, Subscription } from 'rxjs';
// import { initAccessToken } from './client-auth-manager'
import { IApplicationConfigurationManager } from '@eleon/contracts.lib';

function isPlainObject(v) {
  return Object.prototype.toString.call(v) === '[object Object]';
}

function extendObject(base, update, seen = new WeakMap()) {
  // If update is not an object/array, return it directly (overwrite).
  if (update === null || typeof update !== 'object') {
    return update;
  }

  // Replace arrays entirely (config-friendly behavior).
  if (Array.isArray(update)) {
    return update.slice(); // clone
  }

  // Now update is a plain object (or some object) — only merge plain objects.
  const uIsPlain = isPlainObject(update);
  const bIsPlain = isPlainObject(base);

  // If we can't merge (base isn't a plain object), start fresh.
  let result = bIsPlain ? base : {};

  // Cycle guard.
  if (seen.has(update)) {
    return result;
  }
  seen.set(update, true);

  // Shallow clone once to avoid mutating original base.
  if (result === base) {
    result = { ...base };
  }

  for (const key of Object.keys(update)) {
    const uVal = update[key];

    if (uVal === undefined) continue; // don't write undefined

    if (uVal && typeof uVal === 'object') {
      if (Array.isArray(uVal)) {
        // arrays: replace
        result[key] = uVal.slice();
      } else if (isPlainObject(uVal)) {
        const bVal = result[key];
        // merge only if target is also a plain object; otherwise start new object
        result[key] = extendObject(isPlainObject(bVal) ? bVal : {}, uVal, seen);
      } else {
        // other objects (Date, Map, etc.) — assign by reference
        result[key] = uVal;
      }
    } else {
      // primitives: assign
      result[key] = uVal;
    }
  }

  return result;
}


function deepCopy(obj) {
  if (obj === null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(deepCopy);

  const copy = {};
  for (const key in obj) {
    copy[key] = deepCopy(obj[key]);
  }
  return copy;
}



export class ApplicationConfigurationManager extends IApplicationConfigurationManager {
  private readonly updateSubject = new Subject<void>();
  private readonly store = new InternalStore<EleoncoreApplicationConfigurationDto>(null);
  private readonly appConfigService = new ApplicationConfigurationService();

  setState(config: EleoncoreApplicationConfigurationDto) {
    this.store.set(config);
  }

  get createOnUpdateStream() {
    return this.store.sliceUpdate;
  }
  constructor(
  ) {
    super();
  }

  private initialized = false;
  private initPromise: Promise<void> | null = null;
	private waiters: Array<{ resolve: () => void; reject: (e: any) => void }> = [];
	private static prevAppId: string | undefined | null = undefined;
	private static prefDefaultCfg: EleoncoreApplicationConfigurationDto | undefined | null = undefined;

  public get configUpdate$(): Observable<void> {
    return this.updateSubject.asObservable();
  }

	/// appId is the base path of the application, if not provided it will be taken from the document base tag
  public init(appId?: string, defaultApplicationConfiguration?: EleoncoreApplicationConfigurationDto): Promise<void> {
    if (this.initialized) {
      // Already initialized, return immediately
			console.log('ApplicationConfigurationManager already initialized');
      return Promise.resolve();
    }

		this.initialized = false;
		ApplicationConfigurationManager.prevAppId = appId;
		ApplicationConfigurationManager.prefDefaultCfg = deepCopy(defaultApplicationConfiguration);

    if (this.initPromise) {
      return this.initPromise;
    }

		console.log('ApplicationConfigurationManager init started', appId, defaultApplicationConfiguration);

    this.initPromise = this.initInternal(appId, defaultApplicationConfiguration)
      .then(() => {
        this.initialized = true;
        // flush any early waiters
        this.waiters.forEach(w => w.resolve());
        this.waiters = [];
      })
      .catch(err => {
        this.initialized = false;
        // reject any early waiters and allow retry
        this.waiters.forEach(w => w.reject(err));
        this.waiters = [];
        this.initPromise = null;
        throw err;
      });

    return this.initPromise;
  }

	waitForInitialization(): Promise<void> {
		if (this.initialized) return Promise.resolve();
    if (this.initPromise) return this.initPromise;

		console.warn('ApplicationConfigurationManager waitForInitialization: init not started yet');
    // init not started yet: create a deferred promise and park it
    return new Promise<void>((resolve, reject) => {
      this.waiters.push({ resolve, reject });
    });
	}

	private async initInternal(appId?: string, defaultApplicationConfiguration?: EleoncoreApplicationConfigurationDto): Promise<void> {
		try {
			const config = await this.loadConfiguration(appId, defaultApplicationConfiguration);

			this.store.set(config);
      this.updateSubject.next();
			this.initialized = true;
		} catch (err) {
			console.error('ApplicationConfigurationManager init error', err);
			this.initialized = false;
			throw err;
		}
	}

  private async loadConfiguration(
    appId?: string,
    defaultApplicationConfiguration?: EleoncoreApplicationConfigurationDto
  ): Promise<EleoncoreApplicationConfigurationDto> {
		console.log('loadConfiguration started', appId, defaultApplicationConfiguration);
		
    let appState: any = defaultApplicationConfiguration || { extraProperties: { extendFromServer: true }};

		if (appState?.extraProperties['extendFromServer'] != false) {
      const base = document.querySelector('base');
      const basePath = base.getAttribute("href");
      
      // initAccessToken();
      const appConfig = await this.appConfigService.get({ applicationIdentifier: encodeURIComponent(basePath || '/') }).pipe(take(1)).toPromise();

      appState = extendObject(appState, appConfig);
    }

    const localization = await this.getlocalizationResource(appState?.localization?.currentCulture?.cultureName || 'en')
      .pipe(take(1))
      .toPromise();

    appState = extendObject(appState, { localization: localization });

    console.log('loadConfiguration finished', appState);

    return appState;  }

  private getlocalizationResource(cultureName: string) {
    return delay(5)(of({
      resources: {},
    })) as Observable<any>;
  }

  refreshAppState(): Observable<EleoncoreApplicationConfigurationDto> {
		return from(this.initInternal(ApplicationConfigurationManager.prevAppId, ApplicationConfigurationManager.prefDefaultCfg))
			.pipe(                         // 2) run the second step
				switchMap(() => this.createOnUpdateStream(s => s)) // 3) return third obs (one value)
			) as any;
  }

  refreshLocalization(lang: string): Observable<null> {
    // if(this.includeLocalizationResources){
    //   return this.refreshAppState().pipe(map(() => null));
    // }

    return this.getlocalizationResource(lang)
      .pipe(
        tap(result =>
          this.store.patch({ localization: { ...this.store.state.localization, ...result } }),
        ),
      )
      .pipe(map(() => null));
  }


  getAppConfig$(): Observable<EleoncoreApplicationConfigurationDto> {
    return defer(() =>
			from(this.waitForInitialization()).pipe(
				map(() => this.store.state)
			)
		);
  }

  getAppConfig(): EleoncoreApplicationConfigurationDto {
    return this.store.state;
  }


  getFeature(key: string) {
    return this.store.state.features?.values?.[key];
  }
  
  getApplicationSettingBoolean(key: string): boolean {
    const prop = this.getAppConfig().clientApplication.properties?.find(p => p.key === key);
    return prop?.value === 'true';
  }

  getFeature$(key: string) {
    return this.store.sliceState(state => state.features?.values?.[key]);
  }

  getFeatures(keys: string[]) {
    const { features } = this.store.state;
    if (!features) return;

    return keys.reduce((acc, key) => ({ ...acc, [key]: features.values[key] }), {});
  }

  getFeatures$(keys: string[]): Observable<{ [key: string]: string; } | undefined> {
    return this.store.sliceState(({ features }) => {
      if (!features?.values) return;

      return keys.reduce((acc, key) => ({ ...acc, [key]: features.values[key] }), {});
    });
  }

}

function splitKeys(keys: string[] | string): string[] {
  if (typeof keys === 'string') {
    keys = keys.split('.');
  }

  if (!Array.isArray(keys)) {
    throw new Error('The argument must be a dot string or an string array.');
  }

  return keys;
}
