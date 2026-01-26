import { bootstrapApplication } from "@angular/platform-browser";
import { bootstrapEleoncore } from '@eleon/angular-hosting.lib';
import { provideInitializationComponent } from '@eleon/angular-sdk.lib';
import { AppModule } from "./app/app.module";
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

platformBrowserDynamic()
	.bootstrapModule(AppModule)
	.catch(err => console.error(err));

// bootstrapEleoncore({
//     bootstrapModule: AppModule,
// });
