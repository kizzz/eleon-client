import { isPlatformBrowser } from "@angular/common";
import { APP_INITIALIZER, Injector, PLATFORM_ID } from "@angular/core";
import { Router } from "@angular/router";
import { ICommunicationManager, IModuleLoaderManager, IModuleLoadingObservableService } from '@eleon/contracts.lib';
import { IAuthManager, IApplicationConfigurationManager } from '@eleon/contracts.lib';
import { logAngularRemoteModulesProvidersUse } from "./module-loading-helper";
import { runApplicationInitializers } from '@eleon/angular-sdk.lib';
import { IPermissionService } from '@eleon/contracts.lib';


function onApplicationInitialize(
    router: Router,
    permissionService: IPermissionService,
    authService: IAuthManager,
    platformId: Object,
    moduleLoadingObservableService: IModuleLoadingObservableService,
    ngWebPushCommunicationService: ICommunicationManager,
    injector: Injector,
    moduleLoader: IModuleLoaderManager,
		appConfigurationManager: IApplicationConfigurationManager
) {
    return async (): Promise<void> => {
        if (!isPlatformBrowser(platformId)) {
            return;
        }

				await appConfigurationManager.waitForInitialization();
        
        await authService.init();
    
        await permissionService.init();

        await moduleLoader.loadModules(router, moduleLoadingObservableService);

        await ngWebPushCommunicationService.init();

        await runApplicationInitializers(injector);
        
        await logAngularRemoteModulesProvidersUse();
    };
};


export const ecAppInitializer = [{
    provide: APP_INITIALIZER,
    deps: [
        Router,
        IPermissionService,
        IAuthManager,
        PLATFORM_ID,
        IModuleLoadingObservableService,
        ICommunicationManager,
        Injector,
        IModuleLoaderManager,
				IApplicationConfigurationManager,
    ],
    useFactory: onApplicationInitialize,
    multi: true,
}];

