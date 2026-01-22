import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  Type,
  ViewChild,
} from "@angular/core";
import {
  CompactType,
  DirTypes,
  DisplayGrid,
  Draggable,
  GridsterConfig,
  GridsterItem,
  GridsterItemComponentInterface,
  GridType,
  PushDirections,
  Resizable,
} from "angular-gridster2";
import { DashboardSettingService, DashboardSettingDto } from '@eleon/dynamic-dashboard-proxy';
import { LocalizedMessageService } from '@eleon/primeng-ui.lib';
import {
  PageControls,
  contributeControls,
  PAGE_CONTROLS,
} from "@eleon/primeng-ui.lib";
import { WidgetSelectionDialogComponent } from "../widget-selection/widget-selection-dialog/widget-selection-dialog.component";
import { BestSellingComponent } from "../dashboard/widgets/best-selling/best-selling.component";
import { CommentsComponent } from "../dashboard/widgets/comments/comments.component";
import { NotificationsComponent } from "../dashboard/widgets/notifications/notifications.component";
import { CustomersComponent } from "../dashboard/widgets/customers/customers.component";
import { RecentSalesComponent } from "../dashboard/widgets/recent-sales/recent-sales.component";
import { RevenueWidgetComponent } from "../dashboard/widgets/revenue-widget/revenue-widget.component";
import { SalesOverviewComponent } from "../dashboard/widgets/sales-overview/sales-overview.component";
import { OrdersWidgetComponent } from "../dashboard/widgets/orders-widget/orders-widget.component";
import { IAuthManager, IPermissionService } from '@eleon/angular-sdk.lib';
import { ILocalizationService } from '@eleon/angular-sdk.lib';

interface Safe extends GridsterConfig {
  draggable: Draggable;
  resizable: Resizable;
  pushDirections: PushDirections;
}

interface CustomGridsterItem extends GridsterItem {
  template: Type<any>;
  label: string;
  id: string;
}

const KNOWN_WIDGETS: Record<string, Type<any>> = {
  BestSelling: BestSellingComponent,
  Comments: CommentsComponent,
  Customers: CustomersComponent,
  Notifications: NotificationsComponent,
  Orders: OrdersWidgetComponent,
  RecentSales: RecentSalesComponent,
  Revenue: RevenueWidgetComponent,
  SalesOverview: SalesOverviewComponent,
};

const WIDGET_DEFAULTS: Record<
  keyof typeof KNOWN_WIDGETS,
  Partial<DashboardSettingDto>
> = {
  Orders: {
    cols: 3,
    rows: 1,
    resizeEnabled: true,
  },
  Revenue: {
    cols: 3,
    rows: 1,
    resizeEnabled: true,
  },
  Customers: {
    cols: 3,
    rows: 1,
    resizeEnabled: true,
  },
  Comments: {
    cols: 3,
    rows: 1,
    resizeEnabled: true,
  },
  RecentSales: {
    cols: 6,
    rows: 5,
    resizeEnabled: true,
  },
  SalesOverview: {
    cols: 6,
    rows: 4,
    resizeEnabled: true,
  },
  BestSelling: {
    cols: 6,
    rows: 5,
    resizeEnabled: true,
  },
  Notifications: {
    cols: 6,
    rows: 4,
    resizeEnabled: true,
  },
};

const DEFAULT_LAYOUT: Record<
  keyof typeof KNOWN_WIDGETS,
  Partial<DashboardSettingDto>
> = {
  Orders: {
    cols: 3,
    rows: 1,
    minItemCols: 3,
    minItemRows: 1,
    xCoordinate: 0,
    yCoordinate: 0,
    resizeEnabled: true,
  },
  Revenue: {
    cols: 3,
    rows: 1,
    minItemCols: 3,
    minItemRows: 1,
    xCoordinate: 3,
    yCoordinate: 0,
    resizeEnabled: true,
  },
  Customers: {
    cols: 3,
    rows: 1,
    minItemCols: 3,
    minItemRows: 1,
    xCoordinate: 6,
    yCoordinate: 0,
    resizeEnabled: true,
  },
  Comments: {
    cols: 3,
    rows: 1,
    minItemCols: 3,
    minItemRows: 1,
    xCoordinate: 9,
    yCoordinate: 0,
    resizeEnabled: true,
  },
  RecentSales: {
    cols: 6,
    rows: 5,
    minItemCols: 6,
    minItemRows: 5,
    xCoordinate: 0,
    yCoordinate: 1,
    resizeEnabled: true,
  },
  SalesOverview: {
    cols: 6,
    rows: 4,
    minItemCols: 6,
    minItemRows: 4,
    xCoordinate: 6,
    yCoordinate: 1,
    resizeEnabled: true,
  },
  BestSelling: {
    cols: 6,
    rows: 4,
    minItemCols: 6,
    minItemRows: 4,
    xCoordinate: 0,
    yCoordinate: 6,
    resizeEnabled: true,
  },
  Notifications: {
    cols: 6,
    rows: 4,
    xCoordinate: 6,
    yCoordinate: 5,
    resizeEnabled: true,
  },
};

@Component({
  standalone: false,
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  options: Safe;
  dashboard: Array<CustomGridsterItem>;
  loading: boolean = false;
  settings: DashboardSettingDto[] = [];
  widget: Type<any> = null;
  existingWidgets: string[] = [];
  editMode: boolean = true;
  updatedSettings: DashboardSettingDto[] = [];
  baseSettings: DashboardSettingDto[] = [];
  isMouseOver: boolean = false;
  isAdmin: boolean = false;
  
  @ViewChild("widgetSelectionDialog")
  widgetSelectionDialog: WidgetSelectionDialogComponent;
  
  get hasLoggedIn() {
    return this.authService.isAuthenticated();
  }

  @PageControls()
  controls = contributeControls([
    {
      key: "Infrastructure::Edit",
      icon: "fa fa-edit",
      severity: "info",
      loading: () => this.loading,
      disabled: () => this.loading,
      show: () => !this.editMode && this.hasLoggedIn,
      action: () => this.enableEditMode(),
    },
    {
      key: "Infrastructure::Cancel",
      icon: "fa fa-trash",
      severity: "danger",
      loading: () => this.loading,
      disabled: () => this.loading,
      show: () => this.editMode,
      action: () => this.cancelEditing(),
    },
    {
      key: "Infrastructure::Reset",
      icon: "fa fa-refresh",
      severity: "warning",
      loading: () => this.loading,
      disabled: () => this.loading,
      show: () => this.editMode,
      action: () => this.resetToDefaultLayout(),
    },

    {
      key: "Infrastructure::Add",
      icon: "fa fa-plus",
      severity: "info",
      loading: () => this.loading,
      disabled: () => this.loading,
      show: () => this.editMode,
      action: () => this.widgetSelectionDialog.showDialog(),
    },
    {
      key: "Infrastructure::SetAsDefault",
      icon: "fa fa-check",
      severity: "warning",
      loading: () => this.loading,
      disabled: () => this.loading,
      show: () => this.editMode && this.isAdmin,
      action: () => this.save(true),
    },
    PAGE_CONTROLS.SAVE({
      loading: () => this.loading,
      action: () => this.save(false),
      disabled: () => this.loading,
      show: () => this.editMode,
    }),
  ]);

  constructor(
    private authService: IAuthManager,
    private localizedMessageService: LocalizedMessageService,
    private dashboardSettingService: DashboardSettingService,
    private localizationService: ILocalizationService,
    private permissionService: IPermissionService,
  ) {}

  ngOnInit() {
    if (!this.hasLoggedIn) return;
    let direction =
      document.body.dir === "rtl"
        ? DirTypes.RTL
        : DirTypes.LTR;
    this.options = {
      setGridSize: true,
      gridType: GridType.Fit,
      compactType: CompactType.None,
      margin: 5,
      outerMargin: true,
      outerMarginTop: null,
      outerMarginRight: null,
      outerMarginBottom: null,
      outerMarginLeft: null,
      useTransformPositioning: true,
      mobileBreakpoint: 640,
      useBodyForBreakpoint: false,
      minCols: 10,
      maxCols: 100,
      minRows: 10,
      maxRows: 100,
      maxItemCols: 100,
      minItemCols: 1,
      maxItemRows: 100,
      minItemRows: 1,
      maxItemArea: 2500,
      minItemArea: 1,
      defaultItemCols: 1,
      defaultItemRows: 1,
      fixedColWidth: 105,
      fixedRowHeight: 105,
      keepFixedHeightInMobile: false,
      keepFixedWidthInMobile: false,
      scrollSensitivity: 10,
      scrollSpeed: 20,
      enableEmptyCellClick: false,
      enableEmptyCellContextMenu: false,
      enableEmptyCellDrop: false,
      enableEmptyCellDrag: false,
      enableOccupiedCellDrop: false,
      emptyCellDragMaxCols: 100,
      emptyCellDragMaxRows: 100,
      ignoreMarginInRow: false,
      draggable: {
        enabled: false,
        ignoreContent: true,
        dropOverItems: true,
      },
      resizable: {
        enabled: false,
      },
      swap: true,
      pushItems: true,
      disablePushOnDrag: false,
      disablePushOnResize: false,
      pushDirections: { north: true, east: true, south: true, west: true },
      pushResizeItems: false,
      displayGrid: DisplayGrid.OnDragAndResize,
      disableWindowResize: false,
      disableWarnings: false,
      scrollToNewItems: false,
      itemChangeCallback: (
        item: CustomGridsterItem,
        itemComponent: GridsterItemComponentInterface
      ) => {
        this.onItemChange(item);
      },
      dirType: direction,
      swapping: true,
    };
    this.getSettings();

    this.isAdmin = this.permissionService.getGrantedPolicy('VPortal.Dashboard.Host');
  }

  enableEditMode() {
    this.options.draggable.ignoreContent = true;
    this.editMode = true;
    this.options.resizable.enabled = true;
    this.options.draggable.enabled = true;
    this.options.api.optionsChanged();
  }

  save(setAsDefault: boolean) {
    if (this.baseSettings?.length <= 0 && this.settings?.length <= 0) {
      this.localizedMessageService.error("Infrastructure::NothingToSave");
      return;
    }
    this.editMode = false;
    this.setSettings(setAsDefault);
  }

  cancelEditing() {
    this.editMode = false;
    this.getSettings();
  }

  onMouseEnter(): void {
    if (this.editMode) {
      this.isMouseOver = true;
    }
  }

  onMouseLeave(): void {
    this.isMouseOver = false;
  }

  // changedOptions(): void {
  //   if (this.options.api && this.options.api.optionsChanged) {
  //     this.options.api.optionsChanged();
  //   }
  // }

  removeItem($event: MouseEvent | TouchEvent, item): void {
    $event.preventDefault();
    $event.stopPropagation();
    this.existingWidgets.splice(this.existingWidgets.indexOf(item.label), 1);
    this.dashboard.splice(this.dashboard.indexOf(item), 1);
    this.settings.splice(this.dashboard.indexOf(item), 1);
  }

  addItem(
    selectedWidget: string,
    overrides: Partial<DashboardSettingDto> | null = null
  ): void {
    if (selectedWidget?.length > 0) {
      this.widget = this.recognizeWidget(selectedWidget);
      if (this.widget) {
        const defaults = WIDGET_DEFAULTS[selectedWidget];
        const widgetSetting: DashboardSettingDto = {
          cols: 3,
          rows: 3,
          xCoordinate: 0,
          yCoordinate: 0,
          label: selectedWidget,
          template: selectedWidget,
          dragEnabled: true,
          compactEnabled: false,
          resizeEnabled: true,
          isDefault: false,
          ...defaults,
          ...overrides,
        };
        this.existingWidgets.push(selectedWidget);
        this.settings.push(widgetSetting);
        this.dashboard.push({
          x: widgetSetting.xCoordinate,
          y: widgetSetting.yCoordinate,
          cols: widgetSetting.cols,
          rows: widgetSetting.rows,
          minItemCols: widgetSetting.minItemCols,
          minItemRows: widgetSetting.minItemRows,
          template: this.widget,
          id: "",
          label: selectedWidget,
          resizeEnabled: widgetSetting.resizeEnabled,
          dragEnabled: widgetSetting.dragEnabled,
        } satisfies CustomGridsterItem);
        this.options.api.optionsChanged();
      }
    }
  }

  resetToDefaultLayout(): void {
    this.widget = null;
    this.settings = [];
    this.dashboard = [];
    this.existingWidgets = [];
    for (const key in DEFAULT_LAYOUT) {
      if (Object.prototype.hasOwnProperty.call(DEFAULT_LAYOUT, key)) {
        const overrides = DEFAULT_LAYOUT[key];
        this.addItem(key, overrides);
      }
    }
  }

  getSettings() {
    this.loading = true;
    this.dashboardSettingService.getDashboardSettings().subscribe((reply) => {
      this.loading = false;
      this.editMode = false;
      this.settings = [...reply];
      if (reply?.length > 0) {
        let notDefault = reply.filter((x) => !x.isDefault);
        this.baseSettings = [...notDefault];
      }
      this.initWidgets();
    });
  }

  setSettings(setAsDefault: boolean) {
    this.loading = true;
    const onlyRecognized = this.settings.filter(
      (x) => this.recognizeWidget(x.label) !== null
    );
    this.dashboardSettingService
      .updateSettingsByDashboardSettingDtosAndSetAsDefault(onlyRecognized, setAsDefault)
      .subscribe((reply) => {
        this.loading = false;
        if (reply) {
          this.localizedMessageService.error(reply);
          return;
        }
        this.localizedMessageService.success(
          "Infrastructure::WidgetSavedSuccessfully"
        );
        this.getSettings();
      });
  }

  onItemChange(item: CustomGridsterItem) {
    let existingSetting = this.settings.filter((x) => x.label == item.label);

    if (existingSetting?.length > 0) {
      const addedItemIndex = this.settings.indexOf(existingSetting[0]);
      if (addedItemIndex !== -1) {
        existingSetting[0].cols = item.cols;
        existingSetting[0].rows = item.rows;
        existingSetting[0].xCoordinate = item.x;
        existingSetting[0].yCoordinate = item.y;
        existingSetting[0].dragEnabled = item.dragEnabled;
        existingSetting[0].resizeEnabled = true;
        existingSetting[0].compactEnabled = item.compactEnabled;
        existingSetting[0].label = item.label;
        existingSetting[0].template = item.template.name.toString();
        existingSetting[0].maxItemRows = item.maxItemRows;
        existingSetting[0].minItemRows = item.minItemRows;
        existingSetting[0].maxItemCols = item.maxItemCols;
        existingSetting[0].minItemCols = item.minItemCols;
      }
    }
  }

  initWidgets() {
    if (!this.settings) return;
    if (this.settings.length === 0) {
      this.resetToDefaultLayout();
      return;
    }
    
    this.existingWidgets = [];
    this.dashboard = [];
    this.settings.forEach((item) => {
      const widget = this.recognizeWidget(item.label);
      if (!widget) {
        return;
      }

      this.widget = widget;

      const gridItem = {} as CustomGridsterItem;
      gridItem.cols = item.cols;
      gridItem.rows = item.rows;
      gridItem.y = item.yCoordinate;
      gridItem.x = item.xCoordinate;
      gridItem.dragEnabled = true;
      gridItem.resizeEnabled = true;
      gridItem.label = item.label;
      gridItem.template = widget;
      gridItem.compactEnabled = true;
      gridItem.id = item.id;
      this.dashboard.push(gridItem);
      this.existingWidgets.push(item.template);
    });

    this.options.resizable.enabled = false;
    this.options.draggable.enabled = false;
    this.options.api.optionsChanged();
  }

  private recognizeWidget(selectedWidget: string): Type<any> {
    return KNOWN_WIDGETS[selectedWidget] || null;
    // if (!selectedWidget) return null;
    // let recognizedWidget: Type<any> = null;
    // switch (selectedWidget) {
    //   case "BestSelling":
    //     recognizedWidget = BestSellingComponent;
    //     break;
    //   case "Comments":
    //     recognizedWidget = CommentsComponent;
    //     break;
    //   case "Customers":
    //     recognizedWidget = CustomersComponent;
    //     break;
    //   case "Notifications":
    //     recognizedWidget = NotificationsComponent;
    //     break;
    //   case "Orders":
    //     recognizedWidget = OrdersWidgetComponent;
    //     break;
    //   case "RecentSales":
    //     recognizedWidget = RecentSalesComponent;
    //     break;
    //   case "Revenue":
    //     recognizedWidget = RevenueWidgetComponent;
    //     break;
    //   case "SalesOverview":
    //     recognizedWidget = SalesOverviewComponent;
    //     break;
    //   default:
    //     this.localizedMessageService.error(
    //       "Infrastructure::WidgetNotRecognized"
    //     );
    //     throw new Error("Widget not recognized");
    // }
    // return recognizedWidget;
  }

  toggleDragging() {
    this.options.draggable.ignoreContent = true;
    this.options.draggable.enabled = true;
    this.options.api.optionsChanged();
  }
}
