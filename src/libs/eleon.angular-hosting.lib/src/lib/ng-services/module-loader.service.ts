import { APP_INITIALIZER, ENVIRONMENT_INITIALIZER, EnvironmentProviders, ModuleWithProviders, Provider, Type } from '@angular/core';
import { Router } from '@angular/router';
import { extractProvidersFromLoadedModule, activateSubModules, addRoutes, isNgModule, getBaseProviders, getRemoteDefinitionsFromConfig, addBootstrapModuleToConfig, loadRootModules, loadNonRootModules } from '../ng-helpers/module-loading-helper';
import { computeRemoteDefinitions, getModulesWithSettings } from '@eleon/ts-hosting.lib';
import { loadRemoteModule, setRemoteDefinitions } from '@nx/angular/mf';
import { ErrorHandlingLevel } from '@eleon/contracts.lib';
import { IApplicationConfigurationManager, IModuleLoadingObservableService } from '@eleon/contracts.lib';
import { EC_APP_INITIALIZERS } from '@eleon/angular-sdk.lib';
import { ecAppInitializer, registerBasicProviders } from '../ng-providers';
import { IModuleLoaderManager } from '@eleon/contracts.lib';

export type ModuleLoadingConfigurationOptions = {
  loadModules?: boolean;
  bootstrapModule?: any;
  providers?: Array<Provider | EnvironmentProviders>;
  moduleLoader?: IModuleLoaderManager;
  applicationConfigurationManager?: IApplicationConfigurationManager;
};

export class NgModuleLoaderManager extends IModuleLoaderManager {
  shouldLoadModules: boolean = false;
  options: ModuleLoadingConfigurationOptions;

  constructor(
    private configManager: IApplicationConfigurationManager,
  ) {
    super();
  }

  async configureModules(options: ModuleLoadingConfigurationOptions): Promise<any[]> {
		if (typeof window['addEleoncoreError'] === 'function') {
			window.addEleoncoreError({
				message: 'Started configuring modules.',
				level: ErrorHandlingLevel.Debug,
			});
		}
    
    this.options = options;
    const { loadModules = true } = options;
    this.shouldLoadModules = loadModules;

    if (!loadModules) return [];

    const appConfig = this.configManager.getAppConfig();
    const providers: any[] = getBaseProviders();

    setRemoteDefinitions(getRemoteDefinitionsFromConfig(appConfig));

    if (options.providers) {
      providers.push(options.providers);
    }

    if (!window['remoteServicesRegistered']) {
      providers.push(...registerBasicProviders(options.applicationConfigurationManager, options.moduleLoader));
      window['eleoncoreServicesRegistered'] = true;
    }

    addBootstrapModuleToConfig(options.bootstrapModule, appConfig);

    const allModulesToLoad = await getModulesWithSettings(appConfig.modules);
    appConfig.modules = allModulesToLoad;

    const updatedDefinitions = getRemoteDefinitionsFromConfig({ modules: allModulesToLoad });
    setRemoteDefinitions(updatedDefinitions);

    const loadedModules = new Set<string>();
    const allProvidersPerModule: any[][] = [];

    const rootProvidersList = await loadRootModules(allModulesToLoad, loadedModules);
    allProvidersPerModule.push(...rootProvidersList);

    const restProviders = await loadNonRootModules(allModulesToLoad, loadedModules);
    allProvidersPerModule.push(...restProviders);

    allProvidersPerModule.forEach(modProviders => providers.push(...modProviders));

    window['remoteModulesPreloaded'] = true;
		if (typeof window['addEleoncoreError'] === 'function') {
			window.addEleoncoreError({
				message: 'Finished configuring modules.',
				level: ErrorHandlingLevel.Debug,
			});
		}

    // ✅ Extract APP_INITIALIZER providers
    const appInitializerProviders: any[] = [];
    const otherProviders: any[] = [];

    for (const provider of providers) {
      if (Array.isArray(provider)) {
        for (const p of provider) {
          (p.provide === APP_INITIALIZER ? appInitializerProviders : otherProviders).push(p);
        }
      } else {
        (provider.provide === APP_INITIALIZER ? appInitializerProviders : otherProviders).push(provider);
      }
    }

    window['remoteModulesPreloaded'] = true;
		if (typeof window['addEleoncoreError'] === 'function') {
			window.addEleoncoreError({
				message: 'Finished configuring modules.',
				level: ErrorHandlingLevel.Debug,
			});
		}

    otherProviders.push({
      provide: EC_APP_INITIALIZERS, 
      useValue: appInitializerProviders,
    });

    otherProviders.push(...ecAppInitializer);

    return otherProviders;
  }

  override loadModules(router: Router, moduleLoadingStatusService: IModuleLoadingObservableService): Promise<void> {
    if (!this.shouldLoadModules) {
      return;
    }
		if (typeof window['addEleoncoreError'] === 'function') {
			window.addEleoncoreError({
				message: 'Started loading modules.',
				level: ErrorHandlingLevel.Debug,
			});
		}

    const allModules = this.configManager.getAppConfig().modules || [];

    const submodules = [
      ...allModules.filter((module) => module.loadLevel == "SubModule"),
    ];

    const rootModules = allModules.filter((module) => module.loadLevel == "RootModule");

    addRoutes(rootModules, router, moduleLoadingStatusService);
    activateSubModules(submodules, router, moduleLoadingStatusService);

		if (typeof window['addEleoncoreError'] === 'function') {
			window.addEleoncoreError({
				message: 'Finished loading modules.',
				level: ErrorHandlingLevel.Debug,
			});
		}

    moduleLoadingStatusService.setModulesConfigured();
  }
}
