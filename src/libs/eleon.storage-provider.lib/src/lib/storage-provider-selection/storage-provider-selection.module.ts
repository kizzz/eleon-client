import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectModule } from 'primeng/select';
import { StorageProviderSelectionComponent } from './storage-provider-selection/storage-provider-selection.component';
import { SharedModule } from '@eleon/angular-sdk.lib';



@NgModule({
  declarations: [
    StorageProviderSelectionComponent
  ],
  imports: [
    CommonModule,
    SelectModule,
    SharedModule,
  ],
  exports: [
    StorageProviderSelectionComponent
  ]
})
export class StorageProviderSelectionModule { }
