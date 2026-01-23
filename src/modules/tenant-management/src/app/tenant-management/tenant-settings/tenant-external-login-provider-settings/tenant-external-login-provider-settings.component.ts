import { Component, Input } from '@angular/core';
import { TenantExternalLoginProviderDto } from '@eleon/angular-sdk.lib';

@Component({
  standalone: false,
  selector: 'app-tenant-external-login-provider-settings',
  templateUrl: './tenant-external-login-provider-settings.component.html',
  styleUrls: ['./tenant-external-login-provider-settings.component.scss']
})
export class TenantExternalLoginProviderSettingsComponent {
  @Input()
  provider: TenantExternalLoginProviderDto;
}
