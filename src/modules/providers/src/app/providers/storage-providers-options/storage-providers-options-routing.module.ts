import { EcAuthGuard, PermissionGuard } from '@eleon/angular-sdk.lib';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CanDeactivateDirtyGuard } from "@eleon/primeng-ui.lib";
import { StorageProviderConfigComponent } from './storage-provider-config/storage-provider-config.component';
import { StorageProvidersListComponent } from './storage-providers-list/storage-providers-list.component';
import { StorageProvidersOptionsComponent } from './storage-providers-options.component';

const routes: Routes = [
  {
    path: '',
    component: StorageProvidersOptionsComponent,
    canActivate: [EcAuthGuard, PermissionGuard],
    canDeactivate: [CanDeactivateDirtyGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'list',
      },
      {
        path: 'list',
        component: StorageProvidersListComponent,
        data:{
          name: "StorageModule::Menu:ProvidersOptions",
          // parentNames: "DataSource::Menu:Top",
          // mainParentName:"AbpUiNavigation::Menu:Administration"
        }
      },
      {
        path: 'config/:id',
        component: StorageProviderConfigComponent,
        data:{
          name: "StorageModule::Settings",
          parentNames: "StorageModule::Menu:ProvidersOptions",
          //mainParentName:"AbpUiNavigation::Menu:Administration"
        }
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StorageProvidersOptionsRoutingModule { }
