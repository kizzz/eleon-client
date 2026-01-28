import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService, TreeNode } from 'primeng/api';
import { LocationDto } from '../../proxy/sites-management/module/locations/models';
import { LocationService } from '../../proxy/sites-management/module/controllers/location.service';
import { LocationType } from '../../proxy/module-collector/sites-management/module/sites-management/module/domain/managers/locations/location-type.enum';
import { SiteType } from '../../proxy/module-collector/sites-management/module/sites-management/module/domain/managers/locations/site-type.enum';
import { VirtualFolderType } from '../../proxy/common/module/constants/virtual-folder-type.enum';
import { ClientApplicationFrameworkType } from '../../proxy/common/module/constants/client-application-framework-type.enum';
import { ClientApplicationStyleType } from '../../proxy/common/module/constants/client-application-style-type.enum';
import {
  PipesModule,
  RequiredMarkModule,
  SharedModule,
} from '@eleon/angular-sdk.lib';
import { TreeModule } from 'primeng/tree';
import { ButtonModule } from 'primeng/button';
import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { PAGE_CONTROLS, PageTitleModule } from '@eleon/primeng-ui.lib';
import { PageControls, contributeControls } from '@eleon/primeng-ui.lib';
import { ProxyCreateDialogComponent } from '../proxy-create-dialog/proxy-create-dialog.component';
import { LocationCreateDialogComponent } from '../location-create-dialog/location-create-dialog.component';
import { LocationDetailsPanelComponent } from '../location-details-panel/location-details-panel.component';

@Component({
  selector: 'app-locations-dashboard',
  standalone: true,
  imports: [
    SharedModule,
    TreeModule,
    ButtonModule,
    PipesModule,
    RequiredMarkModule,
    PageTitleModule,
    ProxyCreateDialogComponent,
    LocationCreateDialogComponent,
    LocationDetailsPanelComponent,
  ],
  templateUrl: './locations-dashboard.component.html',
  styleUrls: ['./locations-dashboard.component.scss'],
})
export class LocationsDashboardComponent implements OnInit {
  locations: TreeNode<LocationDto>[] = [];
  selectedLocation: TreeNode<LocationDto> | null = null;
  loading = false;
  displayProxyDialog = false;
  displayLocationDialog = false;
  newProxyModel: LocationDto | null = null;
  newLocationModel: LocationDto | null = null;
  editProxyModel: LocationDto | null = null;
  editLocationModel: LocationDto | null = null;

  LocationType = LocationType;
  SiteType = SiteType;

  @PageControls()
  controls = contributeControls([
    PAGE_CONTROLS.ADD({
      key: 'TenantManagement::AddProxy',
      loading: () => this.loading,
      disabled: () => this.loading,
      show: () => true,
      action: () => this.addProxy(),
    }),
    PAGE_CONTROLS.ADD({
      key: 'TenantManagement::AddLocation',
      loading: () => this.loading,
      disabled: () => this.loading || !this.selectedLocation,
      show: () => this.selectedLocation !== null,
      action: () => this.addLocation(),
    }),
    PAGE_CONTROLS.RELOAD({
    
      key: 'Infrastructure::Reload',
      loading: () => this.loading,
      disabled: () => this.loading,
      show: () => true,
      action: () => this.reloadLocations(),
    })
  ]);

  constructor(
    private locationService: LocationService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private localizationService: ILocalizationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadLocations();
  }

  get locationsTree(): TreeNode<LocationDto>[] {
    return this.locations;
  }

  nodeSelect(): void {
    // Selection drives details panel; no extra action.
  }

  loadLocations(): void {
    this.loading = true;
    this.locationService.getList().subscribe((list: LocationDto[]) => {
      const nodeMap = new Map<string, TreeNode<LocationDto>>();
      list.forEach((loc) => {
        const id = loc.id ?? '';
        if (!id) return;
        nodeMap.set(id, {
          data: loc,
          expanded: true,
          type: loc?.parentId ? 'location' : 'root',
          children: [],
        });
      });
      const roots: TreeNode<LocationDto>[] = [];
      nodeMap.forEach((node) => {
        const parentId = node.data.parentId;
        const parent = parentId ? nodeMap.get(parentId) : null;
        if (parent?.children) {
          parent.children.push(node);
        } else {
          roots.push(node);
        }
      });
      this.locations = [...roots];
      this.loading = false;
      this.cdr.detectChanges();
    });
  }

  addProxy(): void {
    this.newProxyModel = {
      locationType: LocationType.Proxy,
      siteType: SiteType.None,
      name: '',
      path: '',
      isEnabled: true,
      virtualFolderType: VirtualFolderType.None,
      frameworkType: ClientApplicationFrameworkType.None,
      styleType: ClientApplicationStyleType.None,
      isDefault: false,
      isSystem: false,
    };
    this.displayProxyDialog = true;
  }

  addLocation(): void {
    if (!this.selectedLocation) return;

    const preselectedType =
      this.selectedLocation.data?.locationType === LocationType.Proxy
        ? LocationType.Location
        : LocationType.Site;

    this.newLocationModel = {
      locationType: preselectedType,
      siteType: SiteType.Angular,
      name: '',
      path: '',
      isEnabled: true,
      virtualFolderType: VirtualFolderType.None,
      frameworkType: ClientApplicationFrameworkType.None,
      styleType: ClientApplicationStyleType.None,
      isDefault: false,
      isSystem: false,
      parentId: this.selectedLocation.data?.id,
    };
    this.displayLocationDialog = true;
  }

  reloadLocations(): void {
    this.loadLocations();
  }

  editLocation(node: TreeNode<LocationDto>): void {
    const locationData = structuredClone(node.data);
    if (!locationData) return;

    if (locationData.locationType === LocationType.Proxy) {
      this.editProxyModel = locationData;
      this.displayProxyDialog = true;
    } else {
      this.editLocationModel = locationData;
      this.displayLocationDialog = true;
    }
  }

  deleteLocation(node: TreeNode<LocationDto>): void {
    const id = node.data?.id;
    if (!id) return;
    this.confirmationService.confirm({
      message: this.localizationService.instant(
        'TenantManagement::AreYouSureDelete'
      ),
      accept: () => {
        this.locationService.delete(id).subscribe(() => {
          this.loadLocations();
        });
      },
      acceptLabel: this.localizationService.instant('Infrastructure::Yes'),
      rejectLabel: this.localizationService.instant('Infrastructure::Cancel'),
      acceptButtonStyleClass:
        'p-button-md p-button-raised p-button-text p-button-info',
      acceptIcon: 'pi pi-check',
      rejectButtonStyleClass:
        'p-button-md p-button-raised p-button-text p-button-danger',
      rejectIcon: 'pi pi-times',
    });
  }

  onProxyFormSave(dto: LocationDto): void {
    if (this.editProxyModel) {
      this.locationService.update(dto).subscribe(() => {
        this.displayProxyDialog = false;
        this.editProxyModel = null;
        this.loadLocations();
      });
    } else {
      this.locationService.create(dto).subscribe(() => {
        this.displayProxyDialog = false;
        this.newProxyModel = null;
        this.loadLocations();
      });
    }
  }

  onProxyFormCancel(): void {
    this.displayProxyDialog = false;
    this.newProxyModel = null;
    this.editProxyModel = null;
  }

  onLocationFormSave(dto: LocationDto): void {
    if (this.editLocationModel) {
      this.locationService.update(dto).subscribe(() => {
        this.displayLocationDialog = false;
        this.editLocationModel = null;
        this.loadLocations();
      });
    } else {
      this.locationService.create(dto).subscribe(() => {
        this.displayLocationDialog = false;
        this.newLocationModel = null;
        this.loadLocations();
      });
    }
  }

  onLocationFormCancel(): void {
    this.displayLocationDialog = false;
    this.newLocationModel = null;
    this.editLocationModel = null;
  }
}
