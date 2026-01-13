import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser'
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { IApplicationConfigurationManager } from '@eleon/angular-sdk.lib';

@Injectable({ providedIn: 'root' })
export class AppTitleStrategy extends TitleStrategy {

	get applicationName(){
		return this.configuration.getAppConfig().applicationName;
	}

  constructor(private title: Title, private configuration: IApplicationConfigurationManager) {
    super();
  }

  override updateTitle(_snapshot: RouterStateSnapshot): void {
    this.title.setTitle(this.applicationName);
  }
}
