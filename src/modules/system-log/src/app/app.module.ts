import { APP_INITIALIZER, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DefaultParentMenuItems, ILocalizationService, ILogsDialogService, IVPortalUserMenuService, VPortalMenuItem } from '@eleon/angular-sdk.lib';
import {
  createEcContainerComponentInitializer,
  extractApiBase,
  provideEcContainerComponentOnInitialization,
  provideLocalizationOnInitialization,
  provideMenuOnInitialization,
  provideMultipleOnInitialization,
  provideOnInitialization,
} from '@eleon/angular-sdk.lib';
import { EcAuthGuard, PermissionGuard } from '@eleon/angular-sdk.lib';
import { SystemLogsOverlayComponent } from './system-log/system-logs/system-logs-menu.component'
import { PROXY_SERVICES } from '@eleon/system-log-proxy'
import { LogsDialogService } from './system-log/services/logs-dialog.service'

const systemLogsRoutes: VPortalMenuItem[] = [
  {
    routerLink: null,
    label: DefaultParentMenuItems.System,

    icon: 'pi pi-cog',
    order: 7,
  },
  {
    routerLink: '/system-logs/dashboard/systemalerts',
    label: 'Infrastructure::SystemLogs:Menu:SystemAlerts',

    parentName: DefaultParentMenuItems.System,
    icon: 'fas fa-list',
    order: 1,
    requiredPolicy: 'VPortal.Dashboard.Host || VPortal.Dashboard.Tenant',
  },
  {
    routerLink: undefined,
    label: 'Infrastructure::SystemLogs:Menu:Top',

    parentName: DefaultParentMenuItems.System,
    icon: 'fas fa-list-check',
    order: 3,
    requiredPolicy: 'VPortal.Dashboard.Host || VPortal.Dashboard.Tenant',
  },
  {
    routerLink: '/system-logs/dashboard/eventlogs',
    label: 'Infrastructure::SystemLogs:Menu:EventLogs',

    parentName: 'Infrastructure::SystemLogs:Menu:Top',
    icon: 'fas fa-list',
    order: 1,
    requiredPolicy: 'VPortal.Dashboard.Host || VPortal.Dashboard.Tenant',
  },

  {
    routerLink: '/system-logs/dashboard/auditlogs',
    label: 'Infrastructure::SystemLogs:Menu:EntityChanges',

    parentName: 'Infrastructure::SystemLogs:Menu:Top',
    icon: 'fas fa-list',
    order: 3,
    requiredPolicy: 'VPortal.Dashboard.Host || VPortal.Dashboard.Tenant',
  },
  {
    routerLink: '/system-logs/dashboard/requestlogs',
    label: 'Infrastructure::SystemLogs:Menu:AuditLogs',
    parentName: 'Infrastructure::SystemLogs:Menu:Top',
    icon: 'fas fa-list',
    order: 4,
    requiredPolicy: 'VPortal.Dashboard.Host || VPortal.Dashboard.Tenant',
  },
  {
    routerLink: '/system-logs/dashboard/securitylogs',
    label: 'Infrastructure::SystemLogs:Menu:SecurityLogs',

    parentName: 'Infrastructure::SystemLogs:Menu:Top',
    icon: 'fas fa-list',
    order: 5,
    requiredPolicy: 'VPortal.Dashboard.Host || VPortal.Dashboard.Tenant',
  },
  
];

@NgModule({
  declarations: [

  ],
  imports: [
    RouterModule.forChild([
      {
        path: 'system-logs',
        loadChildren: () => import('./system-log/system-log.module').then((m) => m.SystemLogModule),
        canActivate: [EcAuthGuard, PermissionGuard],
        data: {
        },
      },
    ]),
  ],
  providers: [
    provideEcContainerComponentOnInitialization('layout-primeng-topbar-right', {
      component: SystemLogsOverlayComponent, 
      requiredAuthorize: true,
      orderIndex: -1,
      // requiredPolicy: 'Permission.SystemLog.General'
    }),
    provideMenuOnInitialization(systemLogsRoutes),
    provideLocalizationOnInitialization(
          (cultureName: string) => extractApiBase('eleonsoft') + `/api/LanguageManagement/LocalizationOverride/GetLocalization?culture=${cultureName}&localizationResources=SystemLog`),
    ...provideMultipleOnInitialization(PROXY_SERVICES.map(s => ({ provide: s, useClass: s }))),
    provideOnInitialization({
      provide: ILogsDialogService,
      useClass: LogsDialogService,
    }),
    provideOnInitialization({
      provide: APP_INITIALIZER,
      useFactory: (userMenuService: IVPortalUserMenuService, localizationService: ILocalizationService) => {
        return () => {
          userMenuService.addUserMenuItemRange([
            {
              label: localizationService.instant(
                'Infrastructure::UserSecurityLogs'
              ),
              icon: 'pi pi-list mr-2 w-2rem text-center',
              routerLink: '/system-logs/dashboard/user-security-logs',
              order: 5,
              visible: true,
              parentName: 'UserSideBar',
              expand: false,
            },
          ]);
        }
      },
      deps: [IVPortalUserMenuService, ILocalizationService],
    }),
  ]
})
export class AppModule {
}
