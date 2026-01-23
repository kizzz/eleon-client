import { UserManager, WebStorageStateStore, Log, UserManagerSettings, SigninRedirectArgs, SignoutRedirectArgs, IWindow, CreateSignoutRequestArgs, NavigateResponse, User } from 'oidc-client-ts';
import { IApplicationConfigurationManager, IAuthManager, IModuleLoadingObservableService, User as UserInfo } from '@eleon/contracts.lib';
import { SessionService } from '@eleon/system-services.lib';
import { Subject, Observable } from 'rxjs';
import { Router } from '@angular/router'



class CustomUserManager extends UserManager {
	constructor(settings: UserManagerSettings) {
		super(settings);
	}

	override async _signoutStart(args: CreateSignoutRequestArgs = {}, handle: IWindow): Promise<NavigateResponse> {
        const logger = this._logger.create("_signoutStart");

        try {
					if (this.settings.automaticSilentRenew){
						this.stopSilentRenew();
					}
						
            const user = await this._loadUser();
            logger.debug("loaded current user from storage");

            if (this.settings.revokeTokensOnSignout) {
                await this._revokeInternal(user);
            }

            const id_token = args.id_token_hint || user && user.id_token;
            if (id_token) {
                logger.debug("setting id_token_hint in signout request");
                args.id_token_hint = id_token;
            }

						await this.storeUser(null);
            // await this.removeUser(); // executes user unloaded event that will invoke authorize event and cancel signout flow on first app load before redirect
            logger.debug("user removed, creating signout request");

            const signoutRequest = await this._client.createSignoutRequest(args);
            logger.debug("got signout request");

						// window.location.href = signoutRequest.url;
						// return { url: signoutRequest.url };
            return await handle.navigate({
                url: signoutRequest.url,
                state: signoutRequest.state?.id,
                scriptOrigin: this.settings.iframeScriptOrigin,
            });
        } catch (err) {
            logger.debug("error after preparing navigator, closing navigator window");
            handle.close();
            throw err;
        } finally{
					if (this.settings.automaticSilentRenew){
						this.startSilentRenew();
					}
				}
    }
}



export class ClientAuthManager extends IAuthManager {
  private userManager: UserManager;
  private currentUser: User | null = null;
  private tokenRefreshed$ = new Subject<{ access_token: string; refresh_token?: string }>();

  constructor(
    private appConfigService: IApplicationConfigurationManager,
		private sessionsService: SessionService,
    private router: Router,
    private modulesLoaded: IModuleLoadingObservableService
  ) {
    super();

    window['getUserToken'] = () => {
      return this.currentUser?.access_token;
    };
  
    console.log(window);

		this.initUserManager();

    this.listenLogoutEvents();

    Log.setLogger(console);
    Log.setLevel(Log.INFO);
  }

  private getAppBasePath() : string {
    let configBase = this.appConfigService.getAppConfig()['applicationPath'];
    if (!configBase) {
      const base = document.querySelector('base');
      configBase = base ? base.getAttribute("href") : '';
    }
    
    if (configBase){
      configBase = configBase.endsWith('/') ? configBase.slice(0, -1) : configBase;
    }
    return configBase || '';
  }

	private initUserManager(){
		this.appConfigService.getAppConfig$().subscribe(cfg => {
			console.log('ClientAuthManager init - app config', cfg);

			const oAuthConfig = cfg['oAuthConfig'];
			if (!oAuthConfig) {
				console.warn("Auth config is not provided. Please, provide auth config if you want auth config.");
				return;
			}

			const settings : UserManagerSettings = {
				authority: window.location.origin + cfg['authPath'],
				client_id: oAuthConfig.clientId,
				redirect_uri: window.location.origin + this.getAppBasePath() + '/signin-oidc',
				post_logout_redirect_uri: window.location.origin + this.getAppBasePath(),
				response_type: oAuthConfig.responseType,
				scope: oAuthConfig.scope,
				automaticSilentRenew: true,
				userStore: new WebStorageStateStore({ store: new CustomAuthStorage() }),
			};
			this.userManager = new CustomUserManager(settings);

			this.userManager.events.addUserLoaded((user) => {
				const isTokenRefresh = this.currentUser !== null && this.currentUser.access_token !== user.access_token;
				this.currentUser = user;
				this.authorized$.next(true);
				
				// Emit token refresh event if this is a token refresh (not initial login)
				if (isTokenRefresh) {
					this.tokenRefreshed$.next({
						access_token: user.access_token,
						refresh_token: user.refresh_token
					});
				}
				
				this.appConfigService.refreshAppState().subscribe(res => {
					this.checkGrantedPolicy();
				});
			});

			this.userManager.events.addUserUnloaded(() => {
				this.currentUser = null;
				this.authorized$.next(false);
				this.appConfigService.refreshAppState().subscribe(res => {
					this.checkGrantedPolicy();
				});
			});
		});
	}

  static readonly logoutEventKey = 'logout-event-time';

  private listenLogoutEvents(){
    localStorage.removeItem(ClientAuthManager.logoutEventKey);
    window.addEventListener('storage', (event) => {
      if (event.key === ClientAuthManager.logoutEventKey && event.newValue) {
        this.executeLogout();
      }
    });
  }

  private notifyLogout(){
    localStorage.setItem(ClientAuthManager.logoutEventKey, new Date().toISOString());
  }

  override async init() {
    try {
      await this.checkReloginRequested();
      this.currentUser = await this.userManager.getUser();
      this.authorized$.next(this.isAuthenticated());
    } catch (e) {
      console.warn('Error during auth init:', e);
      this.authorized$.next(false);
    }
		
    const base = document.querySelector('base');
    const basePath = base.getAttribute("href");
    const pathAfterBase = window.location.pathname.replace(basePath, '');
    if (pathAfterBase.startsWith('signin-oidc')) {
			const urlToHandle = window.location.href;
      await this.handleCallback(urlToHandle);
    }
		else {
			await this.checkGrantedPolicy();
		}
		const isAuthenticated = hasOidcUserInLocalStorage();
		// check if authentication is required
		if ((this.appConfigService.getAppConfig()['clientApplication']?.['isAuthenticationRequired'] || isAuthenticated) && !this.isAuthenticated()) {
			await this.navigateToLogin();
		}
  }

	private async checkGrantedPolicy() {
		// check if application has required policy
		const isAuthenticationRequired = this.appConfigService.getAppConfig()['clientApplication']?.['isAuthenticationRequired'];
		const requiredPolicy = this.appConfigService.getAppConfig()['clientApplication']?.['requiredPolicy'];
		const grantedPolicies = this.appConfigService.getAppConfig()?.['auth']?.['grantedPolicies'];
		const isGranted = grantedPolicies?.[requiredPolicy];

		if (isAuthenticationRequired && !this.isAuthenticated()) {
			await this.navigateToLogin();
		}
		else if (isAuthenticationRequired && requiredPolicy && isGranted != true) {
			// await this.logout();
      window.location.href = this.appConfigService.getAppConfig()['authPath'] + '/Account/PermissionError?requiredPolicy=' + encodeURIComponent(requiredPolicy) + '&returnUrl=' + encodeURIComponent(window.location.pathname + window.location.search) + '&applicationIdentifier=' + encodeURIComponent(this.getAppBasePath());
		}
	}

  async checkReloginRequested() : Promise<void> {
    const reloginUsername = this.getReloginUser();
		
		if (reloginUsername){
			const url = this.getReloginReturnUrl();

			this.removeRelogin();

			if (url){
				await this.navigateToLogin({ redirect_uri: url, extraQueryParams: { relogin: true, username: reloginUsername } });
			}
			else{
				await this.navigateToLogin({  extraQueryParams: { relogin: true, username: reloginUsername } });
			}
			return;
		}
  }

  override async navigateToLogin(extras?: SigninRedirectArgs): Promise<void> {
    const cfg = this.appConfigService.getAppConfig()['oAuthConfig'];
    if (!cfg) {
      console.warn("Auth config is not provided. Please, provide auth config if you want auth config.");
      return;
    }
    this.storeRedirectUri();
    await this.userManager.signinRedirect(extras);
  }

  override async logout(extras?: SignoutRedirectArgs): Promise<void> {
		if (extras?.extraQueryParams?.relogin && extras?.extraQueryParams?.username) {
			this.storeRelogin(extras.extraQueryParams.username as string, extras.extraQueryParams.storeRedirectUri as boolean);
		}

		if ((extras as any)?.params?.logoutFromAllSessions){
			this.sessionsService.revokeAll().subscribe(res => {
				console.log("All sessions revoked", res);
			});
		}

    this.notifyLogout();
    await this.executeLogout(extras);
  }

  private async executeLogout(extras?: SignoutRedirectArgs) : Promise<void>{
    await this.userManager.signoutRedirect({
      id_token_hint: this.currentUser.id_token
    });

    this.currentUser = null;
    this.authorized$.next(false);
  }

  override isAuthenticated(): boolean {
    return !!this.currentUser && !this.currentUser.expired;
  }

  override async loginUsingGrant(
    grantType: string,
    parameters: object,
    headers?: any
  ): Promise<any> {
    const cfg = this.appConfigService.getAppConfig()['oAuthConfig'];
    const tokenEndpoint = `${this.userManager.settings.authority}/connect/token`;

    if (!cfg) {
      console.warn("Auth config is not provided. Please, provide auth config if you want auth config.");
      return;
    }

    if (grantType !== 'refresh_token' && grantType !== 'Impersonation') {
      throw new Error(`Unsupported grant type: ${grantType}`);
    }

		let body = null;
		if (grantType === 'Impersonation'){
			body = new URLSearchParams({
				grant_type: grantType,
				impersonated_user: parameters['impersonated_user'],
				impersonated_tenant: parameters['impersonated_tenant'],
				access_token: this.currentUser?.access_token || '',
				client_id: cfg.clientId,
				client_secret: this.userManager.settings.client_secret || '',
				scope: cfg.scope,
			} as any);
		}
    else if (grantType === 'refresh_token') {
			body = new URLSearchParams({
				grant_type: grantType,
				refresh_token: this.currentUser?.refresh_token || '',
				client_id: cfg.clientId,
				client_secret: this.userManager.settings.client_secret || '',
				scope: cfg.scope,
			});
		}

    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
				'Authorization': `Bearer ${this.currentUser?.access_token || ''}`,
        ...(headers || {})
      },
      body: body.toString()
    });

    if (!response.ok) throw new Error(`Token request failed: ${response.statusText}`);

    const tokenData = await response.json();

    if (this.currentUser) {
      const patchedUser = new User({
        ...JSON.parse(this.currentUser.toStorageString?.() || '{}'),
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        id_token: tokenData.id_token,
        expires_in: tokenData.expires_in,
        scope: tokenData.scope,
        token_type: tokenData.token_type
      });

      await this.userManager.storeUser(patchedUser);
      this.currentUser = patchedUser;
      this.authorized$.next(true);
      
      // Emit token refresh event
      this.tokenRefreshed$.next({
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token
      });
    }

    return tokenData;
  }

  public async handleCallback(url: string): Promise<void> {
    try {
      const user = await this.userManager.signinCallback(url); // triggers add user loaded event
      this.currentUser = user;
      this.authorized$.next(true);
      this.appConfigService.refreshAppState().subscribe(res => {
						this.checkGrantedPolicy(); });
      console.log('Login successful, user stored.');
    } catch (err) {
      console.error('Redirect callback error:', err);
      this.authorized$.next(false);
    }
  }

  getUser() : UserInfo | null {
    if (!this.currentUser) return null;
    return {
      userId: this.currentUser.profile.sub,
      userName: this.currentUser.profile.name,
      email: this.currentUser.profile.email,
    };
  }

  getAccessToken(): string | null {
    return this.currentUser?.access_token || null;
  }

  get onTokenRefreshed$(): Observable<{ access_token: string; refresh_token?: string }> {
    return this.tokenRefreshed$.asObservable();
  }

  private storeRedirectUri() {
    let returnPath = window.location.pathname;

    const baseUrl = window.location.origin + this.getAppBasePath();
    const basePath = new URL(baseUrl).pathname;

    if (returnPath && returnPath.startsWith(basePath)) {
      returnPath = returnPath.slice(basePath.length);
    }
    if (returnPath && !returnPath.startsWith('/signin-oidc') && !returnPath.startsWith('signin-oidc')) {
      sessionStorage.setItem('redirect_uri', returnPath);
    }
  }

	private storeRelogin(username: string, storeRedirectUri: boolean){
    const redirectUri = window.location.origin + this.getAppBasePath() + '/signin-oidc'; 
		if (redirectUri){
			sessionStorage.setItem("reloginUrl", redirectUri);
		}
		sessionStorage.setItem('reloginUsername', username);

		if (storeRedirectUri){
			this.storeRedirectUri();
		} else {
      sessionStorage.removeItem('redirect_uri');
		}
	}

	private getReloginUser(){
		return sessionStorage.getItem('reloginUsername');
	}

	private getReloginReturnUrl(){
		return sessionStorage.getItem('reloginUrl');
	}

	private removeRelogin(){
		sessionStorage.removeItem("reloginUrl");
		sessionStorage.removeItem('reloginUsername');
	}
}

export class CustomAuthStorage {
  static localStorageKeys = ['refresh_token', 'session_state', 'expires_at'];

  getItem(key) {
    // Always read from sessionStorage only
    return sessionStorage.getItem(key) || localStorage.getItem(key);
  }

  setItem(key, value) {
    // Write to both sessionStorage and localStorage
    sessionStorage.setItem(key, value);
    localStorage.setItem(key, value);
  }

  removeItem(key) {
    sessionStorage.removeItem(key);
    localStorage.removeItem(key);
  }

  clear() {
    sessionStorage.clear();
    localStorage.clear();
  }

  get length() {
    return sessionStorage.length;
  }

  key(index) {
    return sessionStorage.key(index); // Reading only from sessionStorage
  }
}

export function initAccessToken(): string | undefined {
  const defaultToken = window['getUserToken'] ? window['getUserToken']() : null;
  if (defaultToken) {
    return defaultToken;
  }
  else{
    for (let i = 0; i < localStorage.length; i++) { // loading access token for receiving app configuration
			const key = localStorage.key(i);
			if (key.startsWith("oidc.user")) {
				const user = localStorage.getItem(key);
				try{
          const parsedUser = JSON.parse(user || '{}');

          if (!parsedUser?.access_token) {
            continue;
          }

          console.log("Access token loaded from localStorage for OIDC user:", parsedUser?.profile?.preferred_username || parsedUser?.profile?.name || 'unknown');
          window['getUserToken'] = () => parsedUser?.access_token;
          return parsedUser?.access_token; 
        } catch (error) {
          console.error("Error parsing user from localStorage", error);
          return null;
        }
			}
		}
  }

  return null;
}

export function getOidcUser(): any | null {
  if (hasOidcUserInLocalStorage()) {
    for (let i = 0; i < localStorage.length; i++) { // loading access token for receiving app configuration
      const key = localStorage.key(i);
      if (key!.startsWith("oidc.user")) {
        const user = localStorage.getItem(key!);
        const parsedUser = JSON.parse(user || '{}');
        return parsedUser;
      }
    }
  }
}

export function getOidcUserProfile(): any | null {
  const oidcUser = getOidcUser();
  if (oidcUser && oidcUser.profile) {
    return oidcUser.profile;
  }
}

export function hasOidcUserInLocalStorage(): boolean {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("oidc.user:")) {
      const value = localStorage.getItem(key);
      if (!value) continue;

      try {
        const user = JSON.parse(value);
        // You can add further checks here, like presence of access_token or refresh_token
        if (user && user.access_token) {
          return true;
        }
      } catch {
        // Ignore malformed JSON
      }
    }
  }
  return false;
}

