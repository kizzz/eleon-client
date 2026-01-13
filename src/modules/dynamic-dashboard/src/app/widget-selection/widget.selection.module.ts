import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@eleon/angular-sdk.lib';
import { WidgetSelectionDialogComponent } from './widget-selection-dialog/widget-selection-dialog.component';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';

@NgModule({
  declarations: [
    WidgetSelectionDialogComponent,
  ],
  imports: [
    SharedModule,
    CommonModule,
    DialogModule,
    SelectModule,
    ButtonModule,
    FormsModule,
    TooltipModule,
  ],
  exports: [
    WidgetSelectionDialogComponent,
  ]
})
export class WidgetSelectionModule { }
