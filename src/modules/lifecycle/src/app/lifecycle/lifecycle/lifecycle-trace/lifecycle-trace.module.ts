import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {TimelineModule} from 'primeng/timeline';
import { AccordionModule } from 'primeng/accordion';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';
import {DockModule} from 'primeng/dock';
import { ListboxModule } from 'primeng/listbox';
import { SharedModule } from '@eleon/angular-sdk.lib';
import { DialogModule } from 'primeng/dialog';
import { LifecycleTraceCardComponent } from './lifecycle-trace-card';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';




@NgModule({
  declarations: [
    LifecycleTraceCardComponent
  ],
  providers: [
    DatePipe
  ],
  imports: [
    CommonModule,
    SharedModule,
    TimelineModule,
    AccordionModule,
    ButtonModule,
    FormsModule,
    ProgressSpinnerModule,
    DialogModule,
    BadgeModule,
    AvatarModule,
    TagModule,
    ListboxModule,
  ],
  exports: [
    LifecycleTraceCardComponent
  ]
})
export class LifecycleTraceModule { }
