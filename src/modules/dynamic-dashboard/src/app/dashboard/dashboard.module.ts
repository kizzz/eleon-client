import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { DashboardComponent } from "./dashboard.component";
import { ChartModule } from "primeng/chart";
import { MenuModule } from "primeng/menu";
import { TableModule } from "primeng/table";
import { ButtonModule } from "primeng/button";
import { StyleClassModule } from "primeng/styleclass";
import { PanelMenuModule } from "primeng/panelmenu";
import { DashboardsRoutingModule } from "./dashboard-routing.module";
import { PageTitleModule } from '@eleon/primeng-ui.lib';
import { SharedModule } from '@eleon/angular-sdk.lib';
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatSelectModule } from "@angular/material/select";
import { GridsterComponent, GridsterItemComponent } from "angular-gridster2";
import { DynamicModule } from "ng-dynamic-component";
import { CheckboxModule } from "primeng/checkbox";
import { SelectModule } from 'primeng/select';
import { WidgetsModule } from '../home/widgets/widgets.module';
import { RequiredMarkModule } from '@eleon/angular-sdk.lib';
import { WidgetSelectionModule } from '../widget-selection/widget.selection.module';
import { CommentsComponent } from "./widgets/comments/comments.component";
import { CustomersComponent } from "./widgets/customers/customers.component";
import { OrdersWidgetComponent } from "./widgets/orders-widget/orders-widget.component";
import { RecentSalesComponent } from "./widgets/recent-sales/recent-sales.component";
import { RevenueWidgetComponent } from "./widgets/revenue-widget/revenue-widget.component";
import { BestSellingComponent } from "./widgets/best-selling/best-selling.component";
import { SalesOverviewComponent } from "./widgets/sales-overview/sales-overview.component";
import { NotificationsComponent } from "./widgets/notifications/notifications.component";
import { ProductService } from "./widgets/demo/service/product.service";

@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    FormsModule,
    ChartModule,
    MenuModule,
    TableModule,
    StyleClassModule,
    PanelMenuModule,
    ButtonModule,
    DashboardsRoutingModule,
    PageTitleModule,
    GridsterComponent,
    GridsterItemComponent,
    SelectModule,
    CheckboxModule,
    DynamicModule,
    WidgetSelectionModule,
    RequiredMarkModule,
    MatButtonModule,
    MatIconModule,
    WidgetsModule,
    MatSelectModule,
  ],
  declarations: [
    DashboardComponent,
    CommentsComponent,
    CustomersComponent,
    OrdersWidgetComponent,
    RecentSalesComponent,
    RevenueWidgetComponent,
    BestSellingComponent,
    SalesOverviewComponent,
    NotificationsComponent,
  ],
  providers:[
    ProductService
  ]
})
export class DashboardModule {}
