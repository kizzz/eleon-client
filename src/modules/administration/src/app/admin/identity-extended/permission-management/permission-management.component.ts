import { IdentityUserDto, IdentityRoleDto } from '@eleon/tenant-management-proxy';
import {
  Component,
  ElementRef,
  EventEmitter,
  Injectable,
  Input,
  OnInit,
  Output,
  QueryList,
  TrackByFunction,
  ViewChildren,
} from "@angular/core";
import { FeaturePermissionListService } from '@eleon/tenant-management-proxy';
import { IApplicationConfigurationManager } from '@eleon/angular-sdk.lib';
import { PermissionsService } from '@eleon/tenant-management-proxy';
import { PermissionGroupService } from '@eleon/tenant-management-proxy';
import { FeaturePermissionListResultDto } from '@eleon/tenant-management-proxy';
import { PermissionGroupCategory } from '@eleon/tenant-management-proxy';
import {
  PermissionGrantInfoDto,
  PermissionGroupDto,
  ProviderInfoDto,
  UpdatePermissionDto,
} from '@eleon/tenant-management-proxy';
import { TreeNode } from "primeng/api";
import { ReplaySubject, concat, of } from "rxjs";
import { finalize, switchMap, take, tap } from "rxjs/operators";
import { LocalizedConfirmationService } from "@eleon/primeng-ui.lib";
import { LocalizedMessageService } from "@eleon/primeng-ui.lib";
import { PageStateService } from "@eleon/primeng-ui.lib";
import { ILocalizationService, IPermissionService } from '@eleon/angular-sdk.lib';
type PermissionWithStyle = PermissionGrantInfoDto & {
  order: number;
};

type PermissionWithGroupName = PermissionGrantInfoDto & {
  groupName: string;
};

@Injectable({
  providedIn: "root",
})
@Component({
  standalone: false,
  selector: "app-permission-management",
  templateUrl: "./permission-management.component.html",
  styleUrls: ["./permission-management.component.scss"],
  exportAs: "permissionManagement",
})
export class PermissionManagementComponent implements OnInit {
  private providerName: string;

  public categories: TreeNode[] = [];
  private groupCategories$ = new ReplaySubject<PermissionGroupCategory[]>(1);
  loading: boolean = false;

  @Input()
  providerKey: string;

  @Input()
  readonly hideBadges = false;

  protected _visible = false;

  @Input()
  entityDisplayName: string | undefined;

  @Input()
  get visible(): boolean {
    return this._visible;
  }

  set visible(value: boolean) {
    if (value === this._visible) return;

    if (value) {
      this._visible = true;
      this.openModal().subscribe(() => {
        this.visibleChange.emit(true);
        concat(
          this.selectAllInAllTabsRef.changes,
          this.selectAllInThisTabsRef.changes
        )
          .pipe(take(1))
          .subscribe(() => {
            this.initModal();
          });
      });
    } else {
      this.setSelectedGroup(null);
      this._visible = false;
      this.visibleChange.emit(false);
    }
  }

  @Output() readonly visibleChange = new EventEmitter<boolean>();

  @ViewChildren("selectAllInThisTabsRef")
  selectAllInThisTabsRef!: QueryList<ElementRef<HTMLInputElement>>;
  @ViewChildren("selectAllInAllTabsRef")
  selectAllInAllTabsRef!: QueryList<ElementRef<HTMLInputElement>>;

  data: FeaturePermissionListResultDto = {
    groups: [],
    entityDisplayName: "",
    allGrantedByProvider: null,
  };

  selectedGroup?: PermissionGroupDto | null;

  permissions: PermissionWithGroupName[] = [];

  selectThisTab = false;

  selectAllTab = false;

  disableSelectAllTab = false;

  disabledSelectAllInAllTabs = false;

  modalBusy = false;

  selectedGroupPermissions: PermissionWithStyle[] = [];

  permissionsTree: TreeNode[] = [];

  // customPermissions: CustomPermissionDto[] = [];

  isRole = false;
  constructor(
    protected categoryService: PermissionGroupService,
    protected service: PermissionsService,
    protected listService: FeaturePermissionListService,
    protected configState: IApplicationConfigurationManager,
    protected localizationService: ILocalizationService,
    protected pageStateService: PageStateService,
    protected confirmationService: LocalizedConfirmationService,
    protected msgService: LocalizedMessageService,
    // protected customPermissionsService: CustomPermissionsService,
    private permissionService: IPermissionService,
  ) {}

  public showUser(user: IdentityUserDto) {
    this.providerName = "U";
    this.providerKey = user.id;
    this.entityDisplayName = user.name?.length
      ? user.name + " " + user.surname
      : user.userName;
    this.isRole = false;
    this.visible = true;
  }

  public showRole(role: IdentityRoleDto) {
    this.providerName = "R";
    this.providerKey = role.name;
    this.entityDisplayName = role.name;
    this.isRole = true;
    this.visible = true;
  }

	public showApiKey(apiKeyId: string, name: string){
		this.providerName = "A";
		this.providerKey = apiKeyId;
		this.entityDisplayName = this.localizationService.instant("TenantManagement::ApiKey:Title", name);
		this.isRole = false;
		this.visible = true;
	}

  ngOnInit(): void {
    // this.loadPermissions();
    this.categoryService.getPermissionGroups().subscribe((res) => {
      this.groupCategories$.next(res);
    });
  }


  showSaveButton() {
    if(this.isRole && (!!this.data?.entityDisplayName?.length || !!this.entityDisplayName?.length)){
      return true;
    } else if(!this.isRole && this.permissionService.getGrantedPolicy('AbpIdentity.Users.ManagePermissions') && (!!this.data?.entityDisplayName?.length || !!this.entityDisplayName?.length)){
      return true;
    }
    return true;
  }

  // loadPermissions() {
	// 	this.customPermissionsService.getPermissionsDynamic()
	// 	.subscribe((result: CustomPermissionDto[]) => {
	// 		this.customPermissions = result;
	// 	});
	// }

  closeDialog() {
    if (this.pageStateService.isDirty) {
      this.confirmationService.confirm(
        "Infrastructure::ConfirmLeavingDirty",
        () => {
          this.pageStateService.setNotDirty();
          this._visible = false;
        }
      );
    } else {
      this._visible = false;
    }
  }

  getChecked(name: string) {
    if (this.data.allGrantedByProvider) {
      return true;
    }

    return (
      this.permissions.find((per) => per.name === name) || { isGranted: false }
    ).isGranted;
  }

  setSelectedGroup(group: PermissionGroupDto) {
    this.selectedGroup = group;
    if (!this.selectedGroup) {
      this.selectedGroupPermissions = [];
      return;
    }

    const permissions =
      (
        this.data.groups.find(
          (group) => group.name === this.selectedGroup?.name
        ) || {}
      ).permissions || [];
      
      this.selectedGroupPermissions = permissions.map(
        (permission, index) =>
          ({
            ...permission,
            isGranted: (
              this.permissions.find((per) => per.name === permission.name) || {}
            ).isGranted,
            order: 0 // this.customPermissions?.find(x=>x.name == permission.name)?.order || 0
          } as unknown as PermissionWithStyle)
      );

      this.initTreeTable();
  }

  sortTree(tree) {
    return tree
      .map(node => ({
        ...node,
        children: node.children ? this.sortTree(node.children) : []
      }))
      .sort((a, b) => (a.data.order || 0) - (b.data.order || 0));
  }
  
  setDisabled(permissions: PermissionGrantInfoDto[]) {
    if (permissions.length) {
      this.disableSelectAllTab = permissions.every(
        (permission) =>
          permission.isGranted &&
          permission.grantedProviders?.every(
            (p) => p.providerName !== this.providerName
          )
      );
    } else {
      this.disableSelectAllTab = false;
    }
  }

  isGrantedByOtherProviderName(grantedProviders: ProviderInfoDto[]): boolean {
    if (this.data.allGrantedByProvider) {
      return true;
    }

    if (grantedProviders.length) {
      return (
        grantedProviders.findIndex(
          (p) => p.providerName !== this.providerName
        ) > -1
      );
    }
    return false;
  }

  getDisplayNameIfGrantedByAnotherProvider(rowData){
    const firstRoleProvider = rowData.grantedProviders.find(x => x.providerName === 'R');
    if (firstRoleProvider)
    {
      return rowData.displayName + ' ( ' + firstRoleProvider.providerKey + ' )'
    }

    const firstProvider = rowData?.grantedProviders?.length > 0 ? rowData.grantedProviders[0] : null;
    if (firstProvider) {
      return rowData.displayName + "(" + firstProvider.providerKey + ")";
    }
    
    return rowData.displayName;
  }

  onClickCheckbox(clickedPermission: PermissionGrantInfoDto) {
    if (
      clickedPermission.isGranted &&
      this.isGrantedByOtherProviderName(clickedPermission.grantedProviders)
    )
      return;
    setTimeout(() => {
      this.permissions = this.permissions.map((per) => {
        if (clickedPermission.name === per.name) {
          return { ...per, isGranted: !per.isGranted };
        } else if (
          clickedPermission.name === per.parentName &&
          clickedPermission.isGranted
        ) {
          return { ...per, isGranted: false };
        } else if (
          clickedPermission.parentName === per.name &&
          !clickedPermission.isGranted
        ) {
          return { ...per, isGranted: true };
        }
        return per;
      });
      this.updateSelectedGroupPermissions(clickedPermission);
      this.setTabCheckboxState();
      this.setGrantCheckboxState();
      this.setParentClicked(clickedPermission);
    }, 0);
  }

  setParentClicked(clickedPermissions: PermissionGrantInfoDto) {
    let childPermissionGrantedCount = 0;
    let parentPermission: PermissionGrantInfoDto;

    if (clickedPermissions.parentName) {
      this.permissions.forEach((per) => {
        if (per.name === clickedPermissions.parentName) {
          parentPermission = per;
        }
      });
      this.permissions.forEach((per) => {
        if (parentPermission.name === per.parentName) {
          per.isGranted && childPermissionGrantedCount++;
        }
      });
      if (childPermissionGrantedCount === 1 && !parentPermission.isGranted) {
        this.permissions = this.permissions.map((per) => {
          if (per.name === parentPermission.name) {
            per.isGranted = true;
          }
          return per;
        });
      }
      return;
    }
    this.permissions = this.permissions.map((per) => {
      if (per.parentName === clickedPermissions.name) {
        per.isGranted = false;
      }
      return per;
    });
  }

  updateSelectedGroupPermissions(clickedPermissions: PermissionGrantInfoDto) {
    this.selectedGroupPermissions = this.selectedGroupPermissions.map((per) => {
      if (per.name === clickedPermissions.name) {
        per.isGranted = !per.isGranted;
      }
      return per;
    });
  }

  setTabCheckboxState() {
    const selectableGroupPermissions = this.selectedGroupPermissions.filter(
      (per) =>
        per.grantedProviders.every((p) => p.providerName === this.providerName)
    );
    const selectedPermissions = selectableGroupPermissions.filter(
      (per) => per.isGranted
    );

    if (selectedPermissions.length === selectableGroupPermissions.length) {
      this.selectThisTab = true;
    } else if (selectedPermissions.length === 0) {
      this.selectThisTab = false;
    }
  }

  setGrantCheckboxState() {
    const selectablePermissions = this.permissions.filter((per) =>
      per.grantedProviders.every((p) => p.providerName === this.providerName)
    );
    const selectedAllPermissions = selectablePermissions.filter(
      (per) => per.isGranted
    );
    if (selectedAllPermissions.length === selectablePermissions.length) {
      this.selectAllTab = true;
    } else if (selectedAllPermissions.length === 0) {
      this.selectAllTab = false;
    }
  }

  onClickSelectThisTab() {
    this.selectedGroupPermissions.forEach((permission) => {
      if (
        permission.isGranted &&
        this.isGrantedByOtherProviderName(permission.grantedProviders)
      )
        return;

      const index = this.permissions.findIndex(
        (per) => per.name === permission.name
      );

      this.permissions = [
        ...this.permissions.slice(0, index),
        { ...this.permissions[index], isGranted: this.selectThisTab },
        ...this.permissions.slice(index + 1),
      ];
    });

    this.setGrantCheckboxState();
  }

  onClickSelectAll() {
    this.permissions = this.permissions.map((permission) => ({
      ...permission,
      isGranted:
        this.isGrantedByOtherProviderName(permission.grantedProviders) ||
        this.selectAllTab,
    }));

    if (!this.disableSelectAllTab) {
      this.selectThisTab = !this.selectAllTab;
      this.setTabCheckboxState();
    }
    this.onChangeGroup(this.selectedGroup);
  }

  nodeSelect(event) {
    if (!event?.node?.data) return;
    this.onChangeGroup(event.node.data);
  }

  onChangeGroup(group: PermissionGroupDto) {
    this.setDisabled(group.permissions);
    this.setSelectedGroup(group);
    this.setTabCheckboxState();
  }

  initTreeTable(){
    this.permissionsTree = [];
    this.permissionsTree = [...this.permissionsTree];
    
    if (!!this.selectedGroupPermissions.length) {
      const nodesMap = new Map();
    
      let rootNodes = this.selectedGroupPermissions
        .filter(permission => !permission.parentName)
        .map(permission => {
          const node = {
            label: permission.name,
            data: permission,
            children: [],
            expanded: true,
          };
          nodesMap.set(permission.name, node);
          return node;
        });
          
        this.selectedGroupPermissions
        .filter(permission => permission.parentName)
        .forEach(permission => {
          const parent = nodesMap.get(permission.parentName);
          if (parent) {
            const childNode = {
              label: permission.displayName,
              data: permission,
              children: [],
            };
            parent.children.push(childNode);
            nodesMap.set(permission.name, childNode);
          }
        });
    
      this.permissionsTree = rootNodes;
      this.permissionsTree = this.sortTree([...this.permissionsTree]);
    }
  }


  submit() {
    const unchangedPermissions = getPermissions(this.data.groups);

    const changedPermissions: UpdatePermissionDto[] = this.permissions
      .filter((per) =>
        (
          unchangedPermissions.find(
            (unchanged) => unchanged.name === per.name
          ) || {}
        ).isGranted === per.isGranted
          ? false
          : true
      )
      .map(({ name, isGranted }) => ({ name, isGranted }));

    if (!changedPermissions.length) {
      this.visible = false;
      return;
    }

    this.modalBusy = true;
    this.service
      .update(this.providerName, this.providerKey, {
        permissions: changedPermissions,
      })
      .pipe(
        switchMap(() =>
          this.shouldFetchAppConfig()
            ? this.configState.refreshAppState()
            : of(null)
        ),
        finalize(() => (this.modalBusy = false))
      )
      .subscribe(() => {
        this.pageStateService.setNotDirty();
        this.msgService.success("TenantManagement::UpdatePermission:Success");
        this.visible = false;
      });
  }

  openModal() {
    if (!this.providerKey || !this.providerName) {
      throw new Error("Provider Key and Provider Name are required.");
    }

    this.loading = true;
    return this.listService.get(this.providerName, this.providerKey)
    .pipe(
      finalize(() => (this.loading = false)),
      tap((permissionRes: FeaturePermissionListResultDto) => {
        this.data = permissionRes;
        this.initCategories();
        this.permissions = getPermissions(permissionRes.groups);
        this.setSelectedGroup(permissionRes.groups[0]);
        this.disabledSelectAllInAllTabs = this.permissions.every(
          (per) =>
            per.isGranted &&
            per.grantedProviders.every(
              (provider) => provider.providerName !== this.providerName
            )
        );
      })
    );
  }

  initCategories() {
    this.groupCategories$.subscribe((categories) => {
      // Get all permissions that don't belong to any categorized group
      const categorizedGroupNames = categories.flatMap(cat => 
        cat.permissionGroups?.map(g => g.name) || []
      );
      
      const uncategorizedGroups = this.data.groups.filter(group => 
        !categorizedGroupNames.includes(group.name)
      );

      this.categories = categories
        .map(
          (category) =>
            ({
              label: category.name?.length
                ? this.localizationService.instant(category.name)
                : this.localizationService.instant('TenantManagement::System'),
              children: category.permissionGroups?.length
                ? this.data.groups
                    .filter((group) =>
                      category.permissionGroups.some(g => g.name === group.name)
                    )
                    .map(
                      (group) =>
                        ({
                          data: group,
                          type: "group",
                        } satisfies TreeNode)
                    )
                : null,
              type: "category",
              expanded: true,
            } satisfies TreeNode)
        )
        .filter((x) => x.children?.length);

      // Add uncategorized group if there are any
      if (uncategorizedGroups.length > 0) {
        this.categories.push({
          label: this.localizationService.instant('TenantManagement::Uncategorized'),
          children: uncategorizedGroups.map(group => ({
            data: group,
            type: "group",
          } satisfies TreeNode)),
          type: "category",
          expanded: true,
        } satisfies TreeNode);
      }
    });
  }

  initModal() {
    setTimeout(() => {
      this.setDisabled(this.selectedGroup?.permissions || []);
      this.setTabCheckboxState();
      this.setGrantCheckboxState();
    });
  }

  getAssignedCount(groupName: string) {
    return this.permissions.reduce(
      (acc, val) =>
        val.groupName === groupName && val.isGranted ? acc + 1 : acc,
      0
    );
  }

  shouldFetchAppConfig() {
    const currentUser = this.configState.getAppConfig().currentUser;

    if (this.providerName === "R")
      return currentUser.roles.some((role) => role === this.providerKey);

    if (this.providerName === "U") return currentUser.id === this.providerKey;

    return false;
  }
}

function findMargin(
  permissions: PermissionGrantInfoDto[],
  permission: PermissionGrantInfoDto
): number {
  const parentPermission = permissions.find(
    (per) => per.name === permission.parentName
  );

  if (parentPermission && parentPermission.parentName) {
    let margin = 20;
    return (margin += findMargin(permissions, parentPermission));
  }

  return parentPermission ? 20 : 0;
}

function getPermissions(
  groups: PermissionGroupDto[]
): PermissionWithGroupName[] {
  return groups.reduce(
    (acc, val) => [
      ...acc,
      ...val.permissions.map<PermissionWithGroupName>((p) => ({
        ...p,
        groupName: val.name || "",
      })),
    ],
    [] as PermissionWithGroupName[]
  );
}
