import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { Component, Input, OnInit } from '@angular/core';
import { GatewayStatus } from '@eleon/gateway-management-proxy';

interface LocalizedGatewayStatus {
  name: string;
  value: GatewayStatus;
}

const icons: { [key: number]: string } = {
  [GatewayStatus.Active]: 'fas fa-check',
  [GatewayStatus.New]: 'fas fa-plus',
  [GatewayStatus.WaitingForConfirmation]: 'fas fa-shoe-prints',
  [GatewayStatus.WaitingForRegistration]: 'fas fa-spinner fa-spin',
  [GatewayStatus.WaitingForAccept]: 'fas fa-clock',
  [GatewayStatus.Rejected]: 'fas fa-times',
}

@Component({
  standalone: false,
  selector: 'app-gateway-status-tag',
  templateUrl: './gateway-status-tag.component.html',
  styleUrls: ['./gateway-status-tag.component.scss']
})
export class GatewayStatusTagComponent implements OnInit {
  localizedGatewayStatuses: LocalizedGatewayStatus[];
  @Input()
  value: GatewayStatus;

  localizedValue: string;

  @Input()
  textBefore: string = '';
  @Input()
  textAfter: string = '';

  constructor(
    public localizationService: ILocalizationService,
  ) { }

  get display(): boolean {
    return !isNaN(this.value);
  }

  ngOnInit(): void {
    this.localizedGatewayStatuses = Object.keys(GatewayStatus)
      .filter((v) => isNaN(Number(v)))
      .map((name) => ({
        value: GatewayStatus[name as keyof typeof GatewayStatus],
        name: this.localizationService.instant(`GatewayManagement::GatewayStatus:${name}`),
      }));
      this.setValue();
  }

  setValue(): void {
    const localizedValue = this.localizedGatewayStatuses.find(x => x.value === this.value)?.name;
    this.localizedValue = localizedValue ? this.textBefore + localizedValue + this.textAfter : undefined;
  }

  getIcon() {
    return icons[this.value];
  }

  getStyleClass() {
    return GatewayStatus[this.value]?.toLowerCase();
  }
}
