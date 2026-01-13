import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { SharedModule } from '@eleon/angular-sdk.lib';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { StorageProvidersOptionsRoutingModule } from './storage-providers-options-routing.module';
import { StorageProviderConfigComponent } from './storage-provider-config/storage-provider-config.component';
import { StorageProvidersListComponent } from './storage-providers-list/storage-providers-list.component';
import { StorageProvidersOptionsComponent } from './storage-providers-options.component';
import { PageTitleModule } from '@eleon/primeng-ui.lib';
import { StorageProviderCreateDialogComponent } from './storage-provider-create-dialog/storage-provider-create-dialog.component';
import { DialogModule } from 'primeng/dialog';
import { RequiredMarkModule } from '@eleon/angular-sdk.lib';
import { ResponsiveTableModule } from '@eleon/primeng-ui.lib';
import { TreeSelectModule } from 'primeng/treeselect';
import { TextareaModule } from 'primeng/textarea';


@NgModule({
  declarations: [
    StorageProviderConfigComponent,
    StorageProvidersListComponent,
    StorageProvidersOptionsComponent,
    StorageProviderCreateDialogComponent
  ],
  imports: [
    CommonModule,
    StorageProvidersOptionsRoutingModule,
    SharedModule,
    TableModule,
    ButtonModule,
    SelectModule,
    TextareaModule, 
    InputTextModule,
    MessageModule,
    PageTitleModule,
    TreeSelectModule,
    DialogModule,
    RequiredMarkModule,
    ResponsiveTableModule
  ],
  exports: [
    StorageProvidersOptionsRoutingModule,
    StorageProviderCreateDialogComponent
  ]
})
export class StorageProvidersOptionsModule { }
