import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { RouterModule } from '@angular/router';
import { PageTitleModule } from '@eleon/primeng-ui.lib';
import { SharedModule } from '@eleon/angular-sdk.lib';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { WidgetSelectionModule } from '../widget-selection/widget.selection.module';
import { WidgetsModule } from './widgets/widgets.module';
import { ButtonModule } from 'primeng/button';
import { RequiredMarkModule } from '@eleon/angular-sdk.lib';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { GridsterComponent, GridsterItemComponent} from 'angular-gridster2';
import { DynamicModule } from 'ng-dynamic-component';
import { TooltipModule } from 'primeng/tooltip';
import { DashboardModule } from '../dashboard/dashboard.module';

@NgModule({
  declarations: [
    HomeComponent
  ],
  imports: [
    SharedModule,
    CommonModule,
    RouterModule.forChild([
      {
        path: 'home',
        component: HomeComponent,
        data:{
          name: "Infrastructure::Home:Title",
        }
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'home',
      },
    ]),
    PageTitleModule,
    FormsModule,
    GridsterComponent,
    GridsterItemComponent,
    SelectModule,
    CheckboxModule,
    DynamicModule,
    WidgetSelectionModule,
    ButtonModule,
    RequiredMarkModule,
    MatButtonModule,
    MatIconModule,
    WidgetsModule,
    MatSelectModule,
    TooltipModule,
    DashboardModule
  ]
})
export class HomeModule { }
