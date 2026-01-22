import {
  NoopAuthService,
  ModuleLoadingObservableService,
  hasOidcUserInLocalStorage,
  ClientAuthManager,
  TelemetryService,
  initAccessToken,
  VPortalUserMenuService,
  VPortalMenuService,
  VPortalTopbarService,
  SignalRService,
  SoundsService,
  CurrencyService,
} from '@eleon/ts-hosting.lib';
import { APP_INITIALIZER, Component, importProvidersFrom, Injector, isDevMode, PLATFORM_ID, Provider } from '@angular/core';
import { SessionsService } from '@eleon/tenant-management-proxy';
import { PROXY_SERVICES as APPLICATION_CONFIGURATION_PROXY_SERVICES, ApplicationConfigurationManager, EleoncoreApplicationConfigurationDto } from '@eleon/app-config.lib';
import { PROXY_SERVICES as TENANT_MANAGEMENT_PROXY_SERVICES } from '@eleon/tenant-management-proxy';
import { PROXY_SERVICES as SYSTEM_LOG_PROXY_SERVICES, SystemLogService } from '@eleon/system-services.lib';
import { PROXY_SERVICES as IDENTITY_QUERYING_PROXY_SERVICES } from '@eleon/identity-querying.lib';
import { PermissionService, QuickReloginService } from '@eleon/typescript-sdk.lib';
import {
  LocalizationService,
  DynamicLocalizationService,
  SessionStateService,
  LocalStorageService,
  AssetLoaderService,
  ModuleSettingService,
  registerLocale,
  EcContainerService,
} from '@eleon/ts-hosting.lib';
import { NoopConfigStateService, NoopSessionStateService } from '@eleon/ts-hosting.lib';
import { HashLocationStrategy, isPlatformBrowser, LocationStrategy } from '@angular/common';
import { ServiceWorkerModule } from "@angular/service-worker";
import { NgModuleLoaderManager, IdentityHubService, SystemEventsService, ImpersonationService } from "../ng-services";
import { IAssetLoaderService, IBreadcrumbsService, ICurrencyService, IEcContainerService, IErrorHandlingService, IImpersonationService, ILightweightStorageService, IModuleLoaderManager, IModuleLoadingObservableService, ISignalRService, ISoundsService } from '@eleon/contracts.lib';
import { ClientLogService, sendSystemLogs, EleoncoreErrorHandlingService } from '@eleon/logging.lib';
import { EleoncoreError, IAppearanceService, IVPortalMenuService, IVPortalTopbarService } from '@eleon/contracts.lib';

import { IPermissionService, ILocalizationService, ISystemEventsService, ISessionStateService, IDynamicLocalizationService, IModuleSettingService, IQuickReloginService, IVPortalUserMenuService, IAuditDialogService, ITelemetryService, CHAT_MODULE_CONFIG, DEFAULT_CHAT_MODULE_CONFIG, ILogsDialogService, IFileExplorerDialogService, IFileArchiveSelectionDialogService, IApplicationConfigurationManager, IAuthManager, ITemplatingDialogService } from '@eleon/contracts.lib';
import { Router } from '@angular/router'
import { MessageService } from 'primeng/api'
import { PROXY_SERVICES as STORAGE_PROXY_SERVICES, LightweightStorageItemService } from '@eleon/storage.lib';
import { CachedLightweightStorageService } from '@eleon/storage.lib';

export function registerBasicProviders(appConfiguration?: IApplicationConfigurationManager, moduleLoader?: IModuleLoaderManager, appId?: string, defaultAppConfig?: EleoncoreApplicationConfigurationDto) {
    return [
		...registerAppConfiguration(appConfiguration, appId, defaultAppConfig),
		registerServiceWorker(),
    ...registerHostProxy(),
		// {
    //     provide: IApplicationConfigurationManager,
    //     useFactory: () => {
    //         if (appConfiguration) {
    //             return appConfiguration;
    //         }
    //         const appConfig = new ApplicationConfigurationManager();
		// 				appConfig.init();
		// 				return appConfig;
    //     },
    // },
    {
        provide: IErrorHandlingService,
        useFactory: () => new EleoncoreErrorHandlingService(),
    },
    {
        provide: ClientLogService,
        useFactory: () => ClientLogService.Instance,
    },
    {
        provide: IModuleLoadingObservableService,
        useClass: ModuleLoadingObservableService,
    },
    {
        provide: IEcContainerService,
        useFactory: () => {
          return new EcContainerService();
        },
    },
    {
        provide: IModuleLoaderManager,
        useFactory: (appConfig: IApplicationConfigurationManager) => {
            if (moduleLoader) {
                return moduleLoader;
            }
            return new NgModuleLoaderManager(appConfig);
        },
        deps: [IApplicationConfigurationManager],
    },
    {
        provide: IAssetLoaderService,
        useFactory: (configState: IApplicationConfigurationManager) => {
            return new AssetLoaderService(configState);
        },
        deps: [IApplicationConfigurationManager]
    },
    {
        provide: IModuleSettingService,
        useFactory: (configState: IApplicationConfigurationManager) => {
            return new ModuleSettingService(configState);
        },
        deps: [IApplicationConfigurationManager]
    },
    {
        provide: ILocalizationService,
        useFactory: (configState: IApplicationConfigurationManager, sessionState: ISessionStateService) => {
            return new LocalizationService(sessionState, configState);
        },
        deps: [IApplicationConfigurationManager, ISessionStateService]
    },
    {
        provide: IdentityHubService,
        useFactory: (injector: Injector) => {
            return new IdentityHubService(injector);
        },
        deps: [Injector]
    },
		{
			provide: CHAT_MODULE_CONFIG,
			useValue: DEFAULT_CHAT_MODULE_CONFIG,
		},
    {
        provide: IAuthManager,
        useFactory: (platformId: Object, appConfigurationManager: IApplicationConfigurationManager, sessionsService: SessionsService, injector: Injector, moduleLoadingObservableService: IModuleLoadingObservableService) => {
            if (isPlatformBrowser(platformId)) {
                const clientAuthManager = new ClientAuthManager(appConfigurationManager, sessionsService, injector.get(Router), moduleLoadingObservableService);
								clientAuthManager.authorized$.subscribe(auth => {
									if (auth){
										// requesting identity hub to register listener for sessions revocation
										injector.get(IdentityHubService).initConnection();
									}
								});
								return clientAuthManager;
            }
            return new NoopAuthService();
        },
        deps: [PLATFORM_ID, IApplicationConfigurationManager, SessionsService, Injector, IModuleLoadingObservableService]
    },
    {
        provide: IQuickReloginService,
        useFactory: (authService: IAuthManager) => {
            return new QuickReloginService(authService);
        },
        deps: [IAuthManager]
    },
    {
        provide: IPermissionService,
        useFactory: (configState: IApplicationConfigurationManager, auth: IAuthManager) => {
            return new PermissionService(configState, auth);
        },
        deps: [IApplicationConfigurationManager, IAuthManager]
    },
    {
        provide: IDynamicLocalizationService,
        useFactory: (localizationService: ILocalizationService, configState: IApplicationConfigurationManager) => {
            return new DynamicLocalizationService(localizationService, configState);
        },
        deps: [ILocalizationService, IApplicationConfigurationManager],
    },
    {
      provide: ISignalRService,
      useFactory: () => {
        return new SignalRService();
      }
    },
    {
        provide: LocalStorageService,
        useClass: LocalStorageService,
    },
    {
        provide: IAuditDialogService,
        useClass: IAuditDialogService,
    },
    {
        provide: ITemplatingDialogService,
        useClass: ITemplatingDialogService,
    },
    {
        provide: ILogsDialogService,
        useClass: ILogsDialogService,
    },
    {
        provide: IFileExplorerDialogService,
        useClass: IFileExplorerDialogService,
    },
    {
        provide: IFileArchiveSelectionDialogService,
        useClass: IFileArchiveSelectionDialogService,
    },
    {
      provide: ISoundsService,
      useFactory: () => {
        return new SoundsService();
      }
    },
    {
      provide: ICurrencyService,
      useFactory: () => {
        return new CurrencyService();
      }
    },
    {
      provide: ILightweightStorageService,
      useFactory: (storageService: LightweightStorageItemService) => {
        return new CachedLightweightStorageService(storageService);
      },
      deps: [LightweightStorageItemService]
    },
    {
      provide: IImpersonationService,
      useFactory: (authManager: IAuthManager, localizationService: ILocalizationService, appConfig: IApplicationConfigurationManager, messageService: MessageService) => {
        return new ImpersonationService(authManager, localizationService, appConfig, messageService);
      },
      deps: [IAuthManager, ILocalizationService, IApplicationConfigurationManager, MessageService]
    },
    {
        provide: ISessionStateService,
        useFactory: (configState: IApplicationConfigurationManager, localStorageService: LocalStorageService, platformId: Object) => {
            if (isPlatformBrowser(platformId)) {
                return new SessionStateService(configState, localStorageService);
            }
            return new NoopSessionStateService();
        },
        deps: [IApplicationConfigurationManager, LocalStorageService, PLATFORM_ID],
    },
    {
      provide: ITelemetryService,
      useFactory: (config: IApplicationConfigurationManager, authService: IAuthManager) => {
        return new TelemetryService(config, authService);
      },
      deps: [IApplicationConfigurationManager, IAuthManager]
    },
    {
      provide: ISystemEventsService,
      useFactory: (appConfig: IApplicationConfigurationManager, authService: IAuthManager, signalRService: ISignalRService) => {
        const service = new SystemEventsService(appConfig, authService, signalRService);
        return service;
      },
      deps: [IApplicationConfigurationManager, IAuthManager, ISignalRService]
    },
    {
      provide: IVPortalUserMenuService,
      useFactory: () => {
        return new VPortalUserMenuService();
      }
    },
    {
      provide: IVPortalMenuService,
      useFactory: (permissionService: IPermissionService, authManager: IAuthManager) => {
        return new VPortalMenuService(permissionService, authManager);
      },
      deps: [IPermissionService, IAuthManager]
    },
    {
      provide: IVPortalTopbarService,
      useFactory: (permissionService: IPermissionService) => {
        return new VPortalTopbarService(permissionService);
      },
      deps: [IPermissionService]
    },
    {
      provide: APP_INITIALIZER,
      useFactory: (systemEventsService: ISystemEventsService, appConfig: IApplicationConfigurationManager) => {
        return () => {
          systemEventsService.subscribe('UpdateAppConfig', (msg) => {
            appConfig.refreshAppState().subscribe();
          });
        };
      },
      deps: [ISystemEventsService, IApplicationConfigurationManager],
      multi: true
    },
    {
      provide: APP_INITIALIZER,
      useFactory: (telemetry: ITelemetryService) => {
        return () => telemetry.initialize();
      },
      deps: [ITelemetryService],
      multi: true
    },
    {
      provide: APP_INITIALIZER,
      useFactory: (appConfig: IApplicationConfigurationManager, clientLogService: ClientLogService, sysLogService: SystemLogService) => {
        return () => sendSystemLogs(appConfig, clientLogService, sysLogService);
      },
      multi: true,
      deps: [IApplicationConfigurationManager, ClientLogService, SystemLogService]
    }
  ];
}


function registerHostProxy() {
    return [
      ...APPLICATION_CONFIGURATION_PROXY_SERVICES,
      ...TENANT_MANAGEMENT_PROXY_SERVICES,
      ...SYSTEM_LOG_PROXY_SERVICES,
      ...STORAGE_PROXY_SERVICES,
      ...IDENTITY_QUERYING_PROXY_SERVICES
    ].map(service => ({
        provide: service,
        useClass: service
    }));
}


function registerServiceWorker() {
    if (typeof window === "undefined" || !window.applicationConfiguration?.getApplicationSettingBoolean("UseServiceWorker")) {
        return [];
    }
    return importProvidersFrom(ServiceWorkerModule.register('ngsw-worker.js', {
        enabled: true,
        registrationStrategy: 'registerWhenStable:30000'
    }));
}

function registerAppConfiguration(appConfiguration?: IApplicationConfigurationManager, appId?: string, defaultAppConfig?: EleoncoreApplicationConfigurationDto): Provider[] {
	initAccessToken();

  if (appConfiguration) {
    return [
      {
        provide: IApplicationConfigurationManager,
        useValue: appConfiguration
      }
    ];
  }

  console.log("Application configuration is not provided. Creating new instance.");

	const appConfigService = new ApplicationConfigurationManager();
	appConfigService.init(appId, defaultAppConfig);

  return [
    {
      provide: IApplicationConfigurationManager,
      useValue: appConfigService,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: (configManager: IApplicationConfigurationManager) => {
        return () => configManager.waitForInitialization();
      },
      deps: [IApplicationConfigurationManager],
      multi: true,
    },
  ];
}

export function registerEleoncore(errorFn?: (error: EleoncoreError) => void) {
    if (typeof document === 'undefined') {
        return registerBasicProviders();
    }
    // useEleoncoreErrorHandling(errorFn, ErrorHandlingLevel.Debug);
    if (window['eleoncoreServicesRegistered']) {
        return [];
    }
    window['remoteServicesRegistered'] = true;
    return registerBasicProviders();
}

