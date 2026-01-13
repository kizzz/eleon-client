import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { finalize } from "rxjs";
import { setCookie } from "../cookie-helper";
import { IApplicationConfigurationManager, LanguageInfo, SharedModule } from '@eleon/angular-sdk.lib';
import { ListboxModule } from "primeng/listbox";
import { PopoverModule } from "primeng/popover";

import { ILayoutService, ISessionStateService, ILocalizationService } from '@eleon/angular-sdk.lib';
@Component({
  selector: "app-language",
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    PopoverModule,
    ListboxModule,
  ],
  templateUrl: "./language.component.html",
  styleUrl: "./language.component.scss",
})
export class LanguageComponent implements OnInit {

  public languages: LanguageInfo[];
  currentLang = "en";
  inited = false;
  loading = false;

  visible = false;

  get isLanguageHidden() {
    return this.layoutService.config().hideLanguage;
  }
  constructor(
    public layoutService: ILayoutService,
    private sessionState: ISessionStateService,
    public localizationService: ILocalizationService,
    private appConfig: IApplicationConfigurationManager
  ) {

  }
  ngOnInit(): void {
    this.initLocalization();

    this.localizationService.languageChange$.subscribe((result) => {
      location.reload();
    });
  }

  onLanguageChange() {
    this.loading = true;
    this.sessionState.setLanguage(this.currentLang);
    setCookie(
      ".AspNetCore.Culture",
      `c=${this.currentLang}|uic=${this.currentLang}`,
      { expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) }
    );
  }

  private initLocalization(): void {
    const localization = this.appConfig.getAppConfig().localization;

    this.languages = localization?.languages || [];

    this.currentLang = this.localizationService.currentLang || "en";

    this.inited = true;
  }
}
