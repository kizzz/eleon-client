import { Observable, of, Subject } from 'rxjs';
import { CurrentTenantDto, ISessionStateService } from '@eleon/contracts.lib';

export class NoopSessionStateService extends ISessionStateService {
  private languageChangeSubject = new Subject<string>();
  private tenantChangeSubject = new Subject<CurrentTenantDto | null>();

  onLanguageChange$(): Observable<string> {
    return this.languageChangeSubject.asObservable();
  }

  onTenantChange$(): Observable<CurrentTenantDto | null> {
    return this.tenantChangeSubject.asObservable();
  }

  getLanguage(): string | undefined {
    return undefined;
  }

  getLanguage$(): Observable<string | undefined> {
    return of(undefined);
  }

  getTenant(): CurrentTenantDto | null | undefined {
    return null;
  }

  getTenant$(): Observable<CurrentTenantDto | null | undefined> {
    return of(null);
  }

  setTenant(tenant: CurrentTenantDto | null): void {
    // No-op on server
  }

  setLanguage(language: string): void {
    // No-op on server
  }
}
