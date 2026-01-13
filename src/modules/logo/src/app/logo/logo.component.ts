import { Component, ElementRef } from "@angular/core";
import { CommonModule } from "@angular/common";
import { IAppearanceService, ILayoutService } from '@eleon/angular-sdk.lib';

@Component({
  selector: "app-logo",
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: "./logo.component.html",
  styleUrl: "./logo.component.css",
})
export class LogoComponent {

  get isThemeDark() {
    return this.theme.includes('dark');
  }

  get isThemeLight() {
    return this.theme.includes('light');
  }
  get isLogoHidden() {
    return this.layoutService.config().hideLogo;
  }
  get theme(): string {
    return this.layoutService.config().theme;
  }
  constructor(public layoutService: ILayoutService,
    public appearance: IAppearanceService) {
  }
}
