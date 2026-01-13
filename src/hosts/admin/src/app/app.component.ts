import { AfterViewInit, Component, ViewChild, ViewContainerRef } from '@angular/core';
import { IModuleLoadingObservableService } from '@eleon/contracts.lib'
import { AppLayoutComponent } from 'src/modules/primeng-layout/src/app/layout/app.layout.component'

@Component({
	standalone: false,
	selector: 'app-root',
	template: `
		<!-- <router-outlet></router-outlet> -->
		<div #layout></div>
			`,
})
export class AppComponent implements AfterViewInit {

	@ViewChild('layout', { read: ViewContainerRef, static: true })
  layout!: ViewContainerRef;

	constructor(private moduleLoading: IModuleLoadingObservableService)
	{
	}

	ngAfterViewInit(): void {
		this.layout.createComponent(AppLayoutComponent);

		document.getElementById("splash-screen")?.classList?.add("hidden");
		this.moduleLoading.setModulesConfigured();
	}
}