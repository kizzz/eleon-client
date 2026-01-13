import { bootstrapEleoncore } from '@eleon/angular-hosting.lib';
import { appConfig } from "./app/app.config";




bootstrapEleoncore({
    providers: appConfig.providers,
})

