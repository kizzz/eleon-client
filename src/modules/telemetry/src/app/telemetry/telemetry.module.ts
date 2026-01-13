import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@eleon/angular-sdk.lib';
import { InputTextModule } from 'primeng/inputtext';
import { BadgeModule } from 'primeng/badge';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { PageTitleModule } from '@eleon/primeng-ui.lib';
import { ResponsiveTableModule } from '@eleon/primeng-ui.lib';
import { RequiredMarkModule } from '@eleon/angular-sdk.lib';
import { TelemetryRoutingModule } from './telemetry.routing.module';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { CheckboxModule } from 'primeng/checkbox'
import { TelemetryDashboardComponent } from './telemetry-dashboard/telemetry-dashboard.component'

@NgModule({
  declarations: [
    TelemetryDashboardComponent
  ],
  imports: [
    CommonModule,
    TelemetryRoutingModule,
    SharedModule,
    InputTextModule,
    BadgeModule,
    TableModule,
    ButtonModule,
    InputNumberModule,
    TooltipModule,
    TagModule,
    PageTitleModule,
    ResponsiveTableModule,
    RequiredMarkModule,
    DialogModule,
    FormsModule,
    InputGroupModule,
    InputGroupAddonModule,
		CheckboxModule,
  ]
})
export class TelemetryModule { }
