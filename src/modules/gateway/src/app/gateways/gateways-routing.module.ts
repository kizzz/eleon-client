import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GatewaysComponent } from './gateways.component';
import { EventBusesComponent } from './event-buses/event-buses.component';
import { GatewaysListComponent } from './gateways-list/gateways-list.component';

const routes: Routes = [
  // { path: '',
  //   component: GatewaysComponent,
  //   data:{
  //     name:"GatewayManagement::Menu:Gateways",
  //     mainParentName: "AbpUiNavigation::Menu:Administration",
  //   }
  // },
  {
    path: 'gateways',
    component: GatewaysListComponent,
    data: {
      name: 'GatewayManagement::Menu:Gateways',
      mainParentName: 'AbpUiNavigation::Menu:Administration',
    },
  },
  {
    path: 'event-buses',
    component: EventBusesComponent,
    data: {
      name: 'GatewayManagement::Menu:EventBuses',
      mainParentName: 'AbpUiNavigation::Menu:Administration',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GatewaysRoutingModule {}
