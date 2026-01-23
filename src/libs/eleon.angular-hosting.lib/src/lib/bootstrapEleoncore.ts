import {
  ConfigureTelemetryHelperService,
  getOidcUserProfile,
  initAccessToken,
} from '@eleon/common-services.lib';
import { ApplicationConfigurationManager } from '@eleon/app-config.lib';
import { EnvironmentProviders, ModuleWithProviders, NgModule, Provider, Type } from "@angular/core";
import { NgModuleLoaderManager, ModuleLoadingConfigurationOptions } from '@eleon/module-loader.lib';
import { bootstrapApplication } from "@angular/platform-browser";
import { EcHostComponent } from "./ec-host.component";
import { provideRouter } from "@angular/router";
import { EleoncoreApplicationConfigurationDto, ErrorHandlingLevel,} from '@eleon/contracts.lib';
import { useApiBase } from '@eleon/angular-sdk.lib';
import { useEleoncoreErrorHandling } from '@eleon/logging.lib';

export type NgEleoncoreStartOptions = ModuleLoadingConfigurationOptions & {
  errorFn?: (error: any) => void;
  bootstrapFn?: (providers: Array<Provider | EnvironmentProviders>) => Promise<any>;
  providers?: Array<Provider | EnvironmentProviders>;
  bootstrapModule?: any;
  basePath?: string;
  domain?: string;
  applicationConfiguration?: EleoncoreApplicationConfigurationDto;
};

export async function bootstrapEleoncore(options: NgEleoncoreStartOptions) {
		if (!options){
			options = {};
		}

    if (!options.bootstrapFn) {
      options.bootstrapFn = (providers) =>
          bootstrapApplication(
            EcHostComponent,
            { providers: [provideRouter([]), ...providers] }
          );
    }

		useApiBase('eleonsoft', '/adminsrv');
		useApiBase('eleoncore', '/core');
    useApiBase('eleonauth', '/auth');

    // Stage 1: Initialize Error Handling
    useEleoncoreErrorHandling(options.errorFn, ErrorHandlingLevel.Debug);

		const token = initAccessToken(); // app configuration must be authorized because a lot of services uses app configuration to access current user

    // Stage 2: Get Application Settings
    const applicationConfiguration = new ApplicationConfigurationManager();
		if (typeof window !== "undefined" && typeof document !== undefined && !options.basePath) {
      const base = document.querySelector('base');
      options.basePath = base.getAttribute("href");
    }
    await applicationConfiguration.init(options.basePath, options.applicationConfiguration as any);

    const profile = getOidcUserProfile();

    // Initialize telemetry
    new ConfigureTelemetryHelperService(
      applicationConfiguration,
      () => {
      return {
        userId: profile?.sub || '',
        userName: profile?.name || '',
        accessToken: window['getUserToken'] ? (window['getUserToken']() || token || '') : (token || ''),
      }
    }).configureTelemetry();
    
    if (typeof document !== "undefined" && typeof window !== "undefined") {
      window.applicationConfiguration = applicationConfiguration;
      window.setEleoncoreErrorLevel(
        window.applicationConfiguration.getAppConfig()?.clientApplication?.errorHandlingLevel || ErrorHandlingLevel.Critical
      );
    }
    options.applicationConfigurationManager = applicationConfiguration;

    // Stage 3: Preload modules: Get providers
    let providers = [];
    if (typeof document !== "undefined" && typeof window !== "undefined") {
      const moduleLoader = new NgModuleLoaderManager(applicationConfiguration);
      options.moduleLoader = moduleLoader;
      providers = await moduleLoader.configureModules(options);
      window.moduleLoader = moduleLoader;
    }

    // Stage 4: Run application initializers (angular-sdk\src\lib\helpers\app-initializers.ts)
    // Stage 4.1: Auth Service Init
    // Stage 4.2: Permission Service Init
    // Stage 4.3: Load Modules
    // Stage 4.4: Communication Init
    const applicationPromise = options.bootstrapFn(providers);
    applicationPromise.catch((err) => {
      throw err;
    });

    return applicationPromise;
}
