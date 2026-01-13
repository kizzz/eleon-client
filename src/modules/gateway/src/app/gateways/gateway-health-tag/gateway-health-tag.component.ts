import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { Component, Input, OnInit } from '@angular/core';
import { ServiceHealthStatus } from '@eleon/gateway-management-proxy';

interface LocalizedGatewayHealth {
  name: string;
  value: ServiceHealthStatus;
}

const icons: { [key: number]: string } = {
  [ServiceHealthStatus.Healthy]: 'fas fa-check',
  [ServiceHealthStatus.Unhealthy]: 'fas fa-exclamation',
  [ServiceHealthStatus.Unknown]: 'fas fa-question',
}

@Component({
  standalone: false,
  selector: 'app-gateway-health-tag',
  templateUrl: './gateway-health-tag.component.html',
  styleUrls: ['./gateway-health-tag.component.scss']
})
export class GatewayHealthTagComponent implements OnInit {
  localizedGatewayHealthes: LocalizedGatewayHealth[];
  @Input()
  value: ServiceHealthStatus;

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
    this.localizedGatewayHealthes = Object.keys(ServiceHealthStatus)
      .filter((v) => isNaN(Number(v)))
      .map((name) => ({
        value: ServiceHealthStatus[name as keyof typeof ServiceHealthStatus],
        name: this.localizationService.instant(`GatewayManagement::GatewayHealth:${name}`),
      }));
      this.setValue();
  }

  setValue(): void {
    const localizedValue = this.localizedGatewayHealthes.find(x => x.value === this.value)?.name;
    this.localizedValue = localizedValue ? this.textBefore + localizedValue + this.textAfter : undefined;
  }

  getIcon() {
    return icons[this.value];
  }

  getStyleClass() {
    return ServiceHealthStatus[this.value]?.toLowerCase();
  }
}
