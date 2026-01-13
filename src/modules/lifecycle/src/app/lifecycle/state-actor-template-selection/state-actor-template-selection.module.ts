import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateActorTemplateSelectionBoxComponent } from './state-actor-template-table-box/state-actor-template-table-box.component';
import { StateActorTemplateSelectionOverlayComponent } from './state-actor-template-selection-overlay/state-actor-template-selection-overlay.component';
import {PopoverModule} from 'primeng/popover';
import { ButtonModule } from 'primeng/button';
import { StateActorTemplateSelectionDialogComponent } from './state-actor-template-selection-dialog/state-actor-template-selection-dialog.component';


import { FormsModule } from '@angular/forms';
import { SharedModule } from '@eleon/angular-sdk.lib';
import {SelectModule} from 'primeng/select';
import {ToggleSwitchModule} from 'primeng/toggleswitch';
import {InputTextModule} from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { RequiredMarkModule } from '@eleon/angular-sdk.lib';
import { DialogModule } from 'primeng/dialog';

@NgModule({
  declarations: [
    StateActorTemplateSelectionBoxComponent,
    StateActorTemplateSelectionOverlayComponent,
    StateActorTemplateSelectionDialogComponent,
  ],
  imports: [
    SharedModule,
    
    
    PopoverModule,
    ButtonModule,
    FormsModule,
    DialogModule,
    SelectModule,
    CheckboxModule,
    ToggleSwitchModule,

    InputTextModule,
    // TaskListSelectionModule,
    RequiredMarkModule
  ],
  exports: [
    StateActorTemplateSelectionOverlayComponent,
    StateActorTemplateSelectionDialogComponent,
  ],
})
export class StateActorTemplateSelectionModule { }

