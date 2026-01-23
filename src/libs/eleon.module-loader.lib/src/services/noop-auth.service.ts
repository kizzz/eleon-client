import { IAuthManager, User } from '@eleon/contracts.lib';
import { SigninRedirectArgs, SignoutRedirectArgs } from "oidc-client-ts";
import { Observable } from 'rxjs'

export class NoopAuthService extends IAuthManager {
    get onTokenRefreshed$(): Observable<{ access_token: string; refresh_token?: string }> {
      return new Observable();
    }
    getUser() : User | null {
      return null;
    }

    getAccessToken(): string | null {
      return null;
    }
    init(): Promise<void> {
        return Promise.resolve();
    }

    navigateToLogin(extras?: SigninRedirectArgs): Promise<void> {
        return Promise.resolve();
    }

    handleCallback(url: string): Promise<void> {
        return Promise.resolve();
    }

    logout(extras?: SignoutRedirectArgs): Promise<void> {
      return Promise.resolve();
    }

    isAuthenticated(): boolean {
        return false;
    }

    loginUsingGrant(grantType: string, parameters: object, headers?: any): Promise<any> {
        return Promise.resolve(null); // or a dummy object if needed
    }
}
