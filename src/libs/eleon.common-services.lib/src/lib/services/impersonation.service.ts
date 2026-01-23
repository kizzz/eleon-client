import { IAuthManager, IApplicationConfigurationManager } from '@eleon/contracts.lib';
import { MessageService } from 'primeng/api' 
import { IImpersonationService, ILocalizationService } from '@eleon/contracts.lib';

export class ImpersonationService extends IImpersonationService {
  constructor(
    private abpAuthService: IAuthManager,
    private localizationService: ILocalizationService,
    private config: IApplicationConfigurationManager,
    private localizedMessageService: MessageService
  ) {
    super();
  }

  public async impersonate(
    impersonatedUserId: string,
    impersonatedTenantId?: string
  ): Promise<void> {
    if (!this.canImpersonate(impersonatedUserId)) {
      return;
    }

    const response = await this.abpAuthService.loginUsingGrant(
      "Impersonation",
      {
        impersonated_user: impersonatedUserId || undefined,
        impersonated_tenant: impersonatedTenantId || undefined,
      }
    );
    if (response) {
      window.location.href = document.baseURI + "home";
    }
  }

  public canImpersonate(impersonatedUserId: string): boolean {
    if (!this.abpAuthService.isAuthenticated()) {
      return false;
    }

    const impUser = this.getImpersonatorUserId();
    const currentUser = this.getCurrentUserId();
    const isImpersonating = this.isImpersonating();
    const tryingToImpersonateSelf = impersonatedUserId === impUser;
    const tryingToImpersonateSame = currentUser === impersonatedUserId;

    if (tryingToImpersonateSame) {
      this.localizedMessageService.add({
        severity: "error",
        summary: this.localizationService.instant("TenantManagement::Impersonation:Errors:TryingToImpersonateSameUser"),
      });

      return false;
    }

    if (isImpersonating && !tryingToImpersonateSelf) {
      this.localizedMessageService.add({
        severity: "error",
        summary: this.localizationService.instant(
          "TenantManagement::Impersonation:Errors:AlreadyImpersonating"
        ),
      });

      return false;
    }

    return true;
  }

  public canReturnToImpersonator(): boolean {
    if (!this.abpAuthService.isAuthenticated()) {
      return false;
    }

    return this.isImpersonating();
  }

  public returnToImpersonator(): void {
    // const impUser = this.getImpersonatorUserId();
    // const impTenant = this.getImpersonatorTenantId();
    // this.impersonate(impUser, impTenant);
    
    localStorage.clear();
    this.abpAuthService.navigateToLogin();
  }

  private isImpersonating(): boolean {
    const impUser = this.getImpersonatorUserId();
    const currentUser = this.getCurrentUserId();
    return !!impUser && impUser !== currentUser;
  }

  private getImpersonatorUserId(): string {
    const token = window['getUserToken']();
    if (!token?.length) {
      return null;
    }
    var claims = JSON.parse(atob(token.split(".")[1]));
    return claims["imp_user"];
  }

  private getImpersonatorTenantId(): string {
    const token = window['getUserToken']();
    var claims = JSON.parse(atob(token.split(".")[1]));
    return claims["imp_tenant"];
  }

  private getCurrentUserId(): string {
    return this.config.getAppConfig().currentUser?.id;
  }
}
