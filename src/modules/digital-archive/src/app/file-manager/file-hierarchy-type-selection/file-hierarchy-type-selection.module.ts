import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileHierarchyTypeSelectionComponent } from './file-hierarchy-type-selection/file-hierarchy-type-selection.component';
import { SelectModule } from 'primeng/select';
import { SharedModule } from '@eleon/angular-sdk.lib';


@NgModule({
  declarations: [
    FileHierarchyTypeSelectionComponent
  ],
  imports: [
    SharedModule,
    CommonModule,
    SelectModule
  ],
  exports: [
    FileHierarchyTypeSelectionComponent
  ]
})
export class FileHierarchyTypeSelectionModule { }
