import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PipesModule, SharedModule } from '@eleon/angular-sdk.lib';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { PageTitleModule } from '@eleon/primeng-ui.lib';
import { GatewaysComponent } from './gateways.component';
import { GatewaysListComponent } from './gateways-list/gateways-list.component';
import { GatewaySettingsComponent } from './gateway-settings/gateway-settings.component';
import { InputNumberModule } from 'primeng/inputnumber';
import { KeyFilterModule } from 'primeng/keyfilter';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';
import { GatewayStatusComponent } from './gateway-settings/gateway-status/gateway-status.component';
// import { DocumentTemplateMapSelectionModule } from '../../share/business-selection/document-template-map-selection/document-template-map-selection.module';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ResponsiveTableModule } from '@eleon/primeng-ui.lib';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TagModule } from 'primeng/tag';
import { GatewayCreateDialogComponent } from './gateway-create-dialog/gateway-create-dialog.component';
import { DialogModule } from 'primeng/dialog';
// import { GatewayStatusesModule } from '../../shared/gateway-status-tag/gateway-status.module';
import { RequiredMarkModule } from '@eleon/angular-sdk.lib';
import { GatewaysRoutingModule } from './gateways-routing.module';
import { EventBusesComponent } from './event-buses/event-buses.component';
import { EventBusCreateDialogComponent } from './bus-create-dialog/bus-create-dialog.component';
import { RawEditorModule } from '@eleon/primeng-ui.lib';
import { FormsModule } from '@angular/forms';
import { GatewaysOptions } from './gateways-options/gateways-options.component';
import { TabsModule } from 'primeng/tabs';
import { GatewayStatusTagComponent } from './gateway-status-tag/gateway-status-tag.component';
import { GatewaySettingsDialogComponent } from './gateway-settings-dialog/gateway-settings-dialog.component';
import { CheckboxModule } from 'primeng/checkbox';
import { GatewayHealthTagComponent } from './gateway-health-tag/gateway-health-tag.component';
import { PROXY_SERVICES } from '@eleon/gateway-management-proxy'

@NgModule({
  declarations: [
    GatewaysComponent,
    GatewaysListComponent,
    GatewaySettingsComponent,
    GatewayStatusComponent,
    GatewayCreateDialogComponent,
    EventBusesComponent,
    EventBusCreateDialogComponent,
    GatewaysOptions,
    GatewayStatusTagComponent,
    GatewayHealthTagComponent,
    GatewaySettingsDialogComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    TableModule,
    ButtonModule,
    SelectModule,
    InputTextModule,
    PageTitleModule,
    InputNumberModule,
    KeyFilterModule,
    MessageModule,
    TooltipModule,
    PipesModule,
    ToggleSwitchModule,
    ResponsiveTableModule,
    SelectButtonModule,
    TagModule,
    DialogModule,
    // GatewayStatusesModule,
    RequiredMarkModule,
    GatewaysRoutingModule,
    RawEditorModule,
    FormsModule,
    TabsModule,
    CheckboxModule,
  ],
  providers: [
    ...PROXY_SERVICES.map(s => ({ provide: s, useClass: s })),
  ],
})
export class GatewaysModule {}
