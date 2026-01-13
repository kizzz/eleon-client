import { Component, OnInit } from '@angular/core';
import {
  GatewayManagementService,
  GatewayStaticKeyService,
} from '@eleon/gateway-management-proxy';
import { LocalizedMessageService } from '@eleon/primeng-ui.lib';
import { finalize } from 'rxjs';

@Component({
  standalone: false,
  selector: 'app-gateways-options',
  templateUrl: './gateways-options.component.html',
  styleUrls: ['./gateways-options.component.scss'],
})
export class GatewaysOptions implements OnInit {
  isStaticKeyEnabled: boolean = false;
  staticKey: string = null;
  loading: boolean = false;

  constructor(
    public gatewayService: GatewayStaticKeyService,
    private msgService: LocalizedMessageService
  ) {}

  ngOnInit(): void {
    this.loadKey();
  }

  public copyKey(): void {
    if (!this.staticKey) return;
    navigator.clipboard.writeText(this.staticKey);
    this.msgService.success(
      'GatewayManagement::Gateway:CopyKeyToClipboard:Success'
    );
  }

  public disableStaticKey(): void {
    this.gatewayService
      .setStaticKeyEnabledByShouldBeEnabled(false)
      .subscribe(() => {
        this.msgService.success('GatewayManagement::StaticKey:DisableSuccess');
        this.isStaticKeyEnabled = false;
        this.staticKey = null;
      });
  }

  public enableStaticKey(): void {
    this.gatewayService
      .setStaticKeyEnabledByShouldBeEnabled(true)
      .subscribe(() => {
        this.msgService.success('GatewayManagement::StaticKey:EnableSuccess');
        this.loadKey();
      });
  }

  private loadKey(): void {
    this.loading = true;
    this.gatewayService
      .getStaticKey()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((key) => {
        if (!!key?.length) {
          this.isStaticKeyEnabled = true;
          this.staticKey = key;
        } else {
          this.isStaticKeyEnabled = false;
          this.staticKey = null;
        }
      });
  }
}
