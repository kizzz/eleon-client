import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IAuthManager, IModuleLoadingObservableService } from '@eleon/contracts.lib';

@Component({
  selector: 'app-signin',
  standalone: true,
  template: '',
  styles: [],
})
export class SignInComponent {
  static handled = false;

  constructor(
    private router: Router,
    private moduleLoadingObservable: IModuleLoadingObservableService,
  ) {
    this.handleRedirect();
  }

  private handleRedirect(): void {
    this.moduleLoadingObservable.isModulesConfigured().subscribe((loaded) => {
      if (!loaded || SignInComponent.handled) return;
      SignInComponent.handled = true;
  
      const returnUrl = this.getSafeReturnUrl();
      this.router.navigateByUrl(returnUrl, {
        // onSameUrlNavigation: 'reload',
				// skipLocationChange: false,
      }).then(_ => {
				// window.location.reload();
			});
    });
  }
  

  private getSafeReturnUrl(): string {
    const stored = sessionStorage.getItem('redirect_uri');
    return (!stored || stored === '/signin-oidc' || stored === 'signin-oidc') ? '/' : stored;
  }
}
