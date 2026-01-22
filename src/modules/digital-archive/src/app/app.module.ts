import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  extractApiBase,
  provideLocalizationOnInitialization,
  provideMenuOnInitialization,
  provideMultipleOnInitialization,
  provideOnInitialization,
} from '@eleon/angular-sdk.lib';
import { FileExplorerDialogService } from './file-manager/core/services/file-explorer-dialog.service'
import { PROXY_SERVICES } from '@eleon/file-manager-proxy';
import { PROXY_SERVICES as PROVIDERS_PROXY_SERVICES } from '@eleon/providers-proxy';
import { PROXY_SERVICES as IDENTITY_QUERYING_PROXY_SERVICES } from '@eleon/identity-querying.lib';
// ## Here you add exports to your new modules
// export * from './example/example.layout.module';

import { DefaultParentMenuItems, IFileArchiveSelectionDialogService, IFileExplorerDialogService, VPortalMenuItem } from '@eleon/angular-sdk.lib';
import { FileArchiveSelectionDialogService } from './file-manager/core/services/file-archive-selection-dialog.service';
export const remoteRoutes = [
  {
      path: "digital-archive",
      loadChildren: () => import('./file-manager/file-manager.module').then(p => p.FileManagerModule),
  },
];


const menuItems: VPortalMenuItem[] = [
  {
    label: 'StorageModule::Menu:Top',
    parentName: DefaultParentMenuItems.System,

    icon: 'fas fa-hdd',
    order: 5,
    requiredPolicy: 'VPortal.Dashboard.Host || VPortal.Dashboard.Tenant',
  },
  {
    routerLink: "/digital-archive/drives",
    label: "FileManager::Menu:DigitalArchive",
    icon: "fa-solid fa-folder-tree",
    parentName: 'StorageModule::Menu:Top',
    order: 2,
  },
    {
    routerLink: "/digital-archive/mydrives",
    label: "FileManager::Menu:MyDigitalArchive",
    icon: "fa-solid fa-folder-tree",
    parentName: DefaultParentMenuItems.Application,
    order: 3,
  },
] as any;

@NgModule({
  declarations: [
  ],
  imports: [
    RouterModule.forChild(remoteRoutes),
  ],
  providers: [
    provideMenuOnInitialization(menuItems),
    provideLocalizationOnInitialization(
      (cultureName: string) => extractApiBase('eleonsoft') + `/api/LanguageManagement/LocalizationOverride/GetLocalization?culture=${cultureName}&localizationResources=FileManager`),
    provideOnInitialization({
      provide: IFileExplorerDialogService,
      useClass: FileExplorerDialogService,
    }),
    provideOnInitialization({
      provide: IFileArchiveSelectionDialogService,
      useClass: FileArchiveSelectionDialogService,
    }),
    ...provideMultipleOnInitialization(PROXY_SERVICES.map(s => ({ provide: s, useClass: s }))),
    ...provideMultipleOnInitialization(PROVIDERS_PROXY_SERVICES.map(s => ({ provide: s, useClass: s }))),
    ...provideMultipleOnInitialization(IDENTITY_QUERYING_PROXY_SERVICES.map(s => ({ provide: s, useClass: s }))),
  ],
})
export class AppModule {
}
