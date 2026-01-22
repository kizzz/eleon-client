import {
  ChangeDetectorRef,
  Component,
  OnInit,
  Query,
  QueryList,
  ViewChildren,
} from "@angular/core";
import {
  OrganizationUnitService,
} from '@eleon/tenant-management-proxy';
import {
  CommonOrganizationUnitDto,
} from '@eleon/tenant-management-proxy';
import { TreeNode } from "primeng/api";
import {
  concat,
  concatAll,
  finalize,
  first,
  forkJoin,
  map,
  merge,
  Observable,
  Subscription,
} from "rxjs";
import { CommonUserDto } from '@eleon/tenant-management-proxy';
import { CommonRoleDto } from '@eleon/tenant-management-proxy';
import { CommonOrganizationUnitTreeNodeDto } from '@eleon/tenant-management-proxy';
import { IIdentitySelectionDialogService, ILocalizationService } from '@eleon/angular-sdk.lib';
import { ConfirmationService } from "primeng/api";
import { LocalizedConfirmationService, LocalizedMessageService } from "@eleon/primeng-ui.lib";
import { OrganizationUnitsSelectionTreeComponent } from "../../identity-extended/shared/organization-units-selection-tree/organization-units-selection-tree.component";
import { OrganizationUnitSelectionEvent } from "../../identity-extended/shared/organization-units-selection-tree/organization-unit-selection-event";


@Component({
  standalone: false,
  selector: "app-organization-units-dashboard",
  templateUrl: "./organization-units-dashboard.component.html",
  styleUrls: ["./organization-units-dashboard.component.scss"],
})
export class OrganizationUnitsDashboardComponent implements OnInit {
  @ViewChildren(OrganizationUnitsSelectionTreeComponent)
  orgUnitsSelectionTrees =
    new QueryList<OrganizationUnitsSelectionTreeComponent>();

  organizationUnits: TreeNode<CommonOrganizationUnitDto>[];
  orgUnitGeneric: TreeNode<CommonOrganizationUnitDto>;
  allOrgUnits: CommonOrganizationUnitDto[];
  orgUnits: TreeNode<CommonOrganizationUnitDto>;

  displayCompanyCreate = false;
  displayCreate = false;
  displayMove = false;
  displayClone = false;
  displayEdit = false;

  loadingDetails: boolean = false;

  selectedUnit: TreeNode<CommonOrganizationUnitDto>;
  unitMembers: CommonUserDto[];
  unitRoles: CommonRoleDto[];
  listView: string = "list";
  defaultSelectedOrganizationUnits: Observable<CommonOrganizationUnitDto[]>;

  get selectedUnitChildren() {
    return this.selectedUnit?.children?.map((s) => s.data);
  }
  get genericOrgUnitChildren() {
    return this.orgUnitGeneric?.children?.map((s) => s.data);
  }
  get selectedUnitParentChildren() {
    return this.selectedUnit?.parent?.children?.map((s) => s.data);
  }

  destinationPath: string;
  orgUnitBreadcrumbs : string[] = []; 

  constructor(
    public organizationUnitService: OrganizationUnitService,
    public localizationService: ILocalizationService,
    private cdr: ChangeDetectorRef,
    private msgService: LocalizedMessageService,
		private localizedConfirmationService: LocalizedConfirmationService,
    private identitySelectionService: IIdentitySelectionDialogService,
  ) {}

  ngOnInit() {
    this.loadOrganizationUnits();
  }

  setListView(view: string) {
    this.listView = view;
  }

  isMobileVersion(): boolean {
    return window.innerWidth <= 576;
  }

  getHeightForOrg(){
    return this.isMobileVersion()? "300px" : "70vh";
  }

  orgUnitsSelection(event: OrganizationUnitSelectionEvent) {
    const selectedOrgUnit = event.selectedOrgUnit;
    const findSelectedOrgUnitInChildren = (
      nodes: TreeNode<CommonOrganizationUnitDto>[]
    ): TreeNode<CommonOrganizationUnitDto> | null => {
      for (let node of nodes) {
        if (node.data.id === selectedOrgUnit.id) {
          return node;
        }
        if (node.children && node.children.length > 0) {
          const foundNode = findSelectedOrgUnitInChildren(node.children);
          if (foundNode) {
            return foundNode;
          }
        }
      }
      return null;
    };
    const foundNode = findSelectedOrgUnitInChildren(
      this.orgUnitGeneric?.children
    );

    if (foundNode) {
      this.selectedUnit = foundNode;
      this.onSelect();
    } else {
      this.selectedUnit = {} as TreeNode<CommonOrganizationUnitDto>;
    }
  }

  loadOrganizationUnits() {
    this.orgUnitGeneric = {
      label: "Organization units",
      expanded: true,
      parent: null,
      children: [],
      data: {
        parentId: null,
        isEnabled: false,
        displayName: "Organization units",
      },
    };

    this.orgUnitsSelectionTrees.forEach((tree) => tree.loadStructure());

    const obs = this.organizationUnitService.getList()
      .pipe()
      .pipe(
            map((allOrgUnits) => {
              this.allOrgUnits = allOrgUnits;
              this.orgUnitGeneric.children = [];
              allOrgUnits
                .filter((orgUnit) => !orgUnit.parentId)
                .map((orgUnit) => this.loadChildren(allOrgUnits, orgUnit))
                .map((node) => this.attachGenericOrgUnit(node));
              this.cdr.detectChanges();
              return [this.orgUnitGeneric];
            })
          );
		obs
          .subscribe((units) => {
            this.organizationUnits = units;
          });

		return obs;
  }

  close() {
    this.displayClone = false;
    this.displayCreate = false;
    this.displayEdit = false;
    this.displayMove = false;
    this.displayCompanyCreate = false;
  }

  move(event: { orgUnitId: string; parentId: string }) {
    let sourceOrgUnit = this.allOrgUnits.filter((x) => x.id == event.orgUnitId);

    let destinationOrgUnit = this.allOrgUnits.filter(
      (x) => x.id === event.parentId
    );

    this.destinationPath = '';
    if (
      destinationOrgUnit?.length > 0 &&
      destinationOrgUnit[0].parentId?.length > 0
    ) {
      this.buildDestinationPath(destinationOrgUnit[0]);
    } else {
      this.destinationPath = destinationOrgUnit[0].displayName;
    }

    let msg = this.localizationService.instant(
      "Infrastructure::OrganizationUnit:MoveConfirmation",
      '"' + sourceOrgUnit[0].displayName + '"',
      '"' + this.destinationPath + '"'
    );

    this.localizedConfirmationService.confirm(
       this.localizationService.instant(msg),
       () => {
        this.destinationPath = null;
        this.displayMove = false;
        this.organizationUnitService
          .moveByIdAndNewParentId(event.orgUnitId, event.parentId)
          .pipe(first())
          .subscribe((result) => {
            if (result) {
              this.loadOrganizationUnits().subscribe(res => {
								this.selectedUnit = this.findRecursively(event.orgUnitId, this.organizationUnits);
								this.onSelect();
								this.cdr.detectChanges();
							});
            }
          });
      },
      () => {
        this.destinationPath = null;
        return;
      },
    );
  }

	private findRecursively(id: string, nodes: TreeNode<CommonOrganizationUnitDto>[]): TreeNode<CommonOrganizationUnitDto> | null {
		for (let node of nodes) {
			if (node.data.id === id) {
				return node;
			}
			const found = this.findRecursively(id, node.children);
			if (found) {
				return found;
			}
		}
		return null;
	}

  buildDestinationPath(orgUnit: CommonOrganizationUnitDto) {
    this.destinationPath =
      orgUnit.displayName +
      (this.destinationPath ? "/" + this.destinationPath : "");

    if (orgUnit.parentId?.length > 0) {
      let parentOrgUnit = this.allOrgUnits.find(
        (x) => x.id === orgUnit.parentId
      );
      if (parentOrgUnit) {
        this.buildDestinationPath(parentOrgUnit);
      }
    }
  }

  clone(event: CommonOrganizationUnitTreeNodeDto) {
    this.displayClone = false;
    this.displayCreate = false;

    this.addToParent(
      this.orgUnitGeneric,
      this.commonOrgUnitTreeNodeToTreeNode(event)
    );
    this.loadOrganizationUnits().subscribe(res => {
			this.selectedUnit = this.findRecursively(event.value.id, this.organizationUnits);
			this.onSelect();
			this.cdr.detectChanges();
		});
  }

  commonOrgUnitTreeNodeToTreeNode(event: CommonOrganizationUnitTreeNodeDto) {
    return {
      label: event.value.displayName,
      expanded: true,
      data: event.value,
      children: event.children.map((child) =>
        this.commonOrgUnitTreeNodeToTreeNode(child)
      ),
    };
  }

  addToParent(
    currentUnit: TreeNode<CommonOrganizationUnitDto>,
    orgUnit: TreeNode<CommonOrganizationUnitDto>
  ) {
    if (currentUnit.data.id == orgUnit.data.parentId) {
      orgUnit.label = this.getOrganizationPath(
        this.allOrgUnits,
        orgUnit.data,
        currentUnit
      );
      currentUnit.children = [...currentUnit.children, orgUnit];
      this.allOrgUnits = [...this.allOrgUnits, orgUnit.data];
      this.selectedUnit = orgUnit;
			this.cdr.detectChanges();
      return;
    }

    currentUnit.children.map((c) => this.addToParent(c, orgUnit));
  }

  onSelect() {
    this.unitMembers = [];
    this.unitRoles = [];
    this.loadMembersData();
    this.loadRolesData();
  }

  getParentNodeName(): string[] {
    let path = this.getOrganizationPath(
      this.allOrgUnits,
      this.selectedUnit.data,
      this.selectedUnit
    );
    this.orgUnitBreadcrumbs = path.split("/");
    this.orgUnitBreadcrumbs.pop();

    return this.orgUnitBreadcrumbs;
  }

  loadMembersData() {
    if (!this.selectedUnit?.data){
      return;
    }
    this.loadingDetails = true;
    this.organizationUnitService
      .getMembersByOrgUnit(this.selectedUnit.data)
      .pipe(first())
      .subscribe((members) => {
        this.unitMembers = members;
        this.loadingDetails = false;
      });
  }

  loadRolesData() {
    this.loadingDetails = true;
    this.organizationUnitService
      .getRolesByOrgUnit(this.selectedUnit.data)
      .pipe(first())
      .subscribe((roles) => {
        this.unitRoles = roles;
        this.loadingDetails = false;
      });
  }

  loadChildren(
    allUnits: CommonOrganizationUnitDto[],
    currentUnit?: CommonOrganizationUnitDto,
    parent?: TreeNode<CommonOrganizationUnitDto>
  ): TreeNode<CommonOrganizationUnitDto> {
    const orgUnit: TreeNode<CommonOrganizationUnitDto> = {
      label: this.getOrganizationPath(allUnits, currentUnit, parent),
      expanded: true,
      data: currentUnit,
      parent,
    };
    orgUnit.children = allUnits
      .filter((orgUnit) => orgUnit.parentId == currentUnit.id)
      .map((result) => this.loadChildren(allUnits, result, orgUnit));
    return orgUnit;
  }

  getOrganizationPath(
    allUnits: CommonOrganizationUnitDto[],
    currentUnit?: CommonOrganizationUnitDto,
    parent?: TreeNode<CommonOrganizationUnitDto>
  ) {
    if (!parent) {
      return currentUnit.displayName;
    }
    if (!parent.data.parentId) {
      return `${parent.data.displayName}/${currentUnit.displayName}`;
    }

    return `${this.getRoot(allUnits, currentUnit).displayName}/.../${
      currentUnit.displayName
    }`;
  }

  getRoot(
    allUnits: CommonOrganizationUnitDto[],
    currentUnit: CommonOrganizationUnitDto
  ): CommonOrganizationUnitDto {
    if (!currentUnit.parentId) {
      return currentUnit;
    }
    const unit = allUnits.find((r) => r.id == currentUnit.parentId);
    return this.getRoot(allUnits, unit);
  }

  getChildrenOrgUnits(parentId: string) {
    return this.allOrgUnits.filter((t) => t.parentId == parentId);
  }

  attachGenericOrgUnit(
    orgUnitNode: TreeNode<CommonOrganizationUnitDto>
  ): TreeNode<CommonOrganizationUnitDto> {
    orgUnitNode.parent = this.orgUnitGeneric;
    this.orgUnitGeneric.children.push(orgUnitNode);
    return orgUnitNode;
  }

  createOrgUnitCompany(event: CommonOrganizationUnitDto) {
    this.displayCreate = false;
    this.displayCompanyCreate = false;

    const newUnitNode = {
      label: this.getOrganizationPath(
        this.allOrgUnits,
        event,
        this.orgUnitGeneric
      ),
      expanded: false,
      data: { ...event, companies: 1 },
    };
    this.orgUnitGeneric.children = [
      ...this.orgUnitGeneric.children,
      newUnitNode,
    ];
    this.selectedUnit = newUnitNode;
    this.allOrgUnits = [...this.allOrgUnits, newUnitNode.data];

    this.loadOrganizationUnits().subscribe(res => {
			this.selectedUnit = this.findRecursively(event.id, this.organizationUnits);
			this.onSelect();
			this.cdr.detectChanges();
		});
  }

  createOrgUnit(event: CommonOrganizationUnitDto) {
    this.displayCreate = false;
    this.displayCompanyCreate = false;

    const newUnitNode = {
      label: this.getOrganizationPath(
        this.allOrgUnits,
        event,
        this.selectedUnit
      ),
      expanded: false,
      data: { ...event, companies: 1 },
    };
		if (this.selectedUnit){
			this.selectedUnit.children = [...(this.selectedUnit.children || []), newUnitNode];
		}
    this.allOrgUnits = [...this.allOrgUnits, newUnitNode.data];
    this.loadOrganizationUnits().subscribe(res => {
			this.selectedUnit = this.findRecursively(event.id, this.organizationUnits);
			this.onSelect();
			this.cdr.detectChanges();
		});
  }

  editOrgUnit(orgUnitName: string) {
    this.organizationUnitService
      .update({
        ...this.selectedUnit.data,
        displayName: orgUnitName,
      })
      .pipe(first())
      .subscribe((responseUnit) => {
        this.selectedUnit = null;
        this.loadOrganizationUnits();
      });
  }

  updateOrgUnit(event: CommonOrganizationUnitDto) {
    this.selectedUnit.data.displayName = event.displayName;
    this.displayEdit = false;
    this.selectedUnit.label = this.getOrganizationPath(
      this.allOrgUnits,
      this.selectedUnit.data,
      this.selectedUnit
    );

    this.loadOrganizationUnits().subscribe(res => {
			this.selectedUnit = this.findRecursively(event.id, this.organizationUnits);
			this.onSelect();
			this.cdr.detectChanges();
		});
  }

  addCompany({ company }) {
    // this.permissionService
    //   .updateCompanyOrgUnitsByCompanyWithPermissionsDto({
    //     ...company,
    //     organizationUnitId: this.selectedUnit.data.id,
    //     organizationUnitName: this.selectedUnit.data.displayName,
    //   })
    //   .subscribe((result) => {
    //     this.loadCompaniesData();
    //   });
  }

  removeCompany(company) {
    this.localizedConfirmationService.confirm(
      this.localizationService.instant(
        "Infrastructure::UnlinkToCompanyConfirmation",
        company.companyName || company.entityName
      ),
      () => {
        // this.permissionService
        //   .removeCompanyOrgUnitByCompanyUidAndOrgUnitId(
        //     company.entityUid,
        //     this.selectedUnit.data.id
        //   )
        //   .subscribe((result) => {
        //     this.loadCompaniesData();
        //   });
      },
      () => {
        return;
      },
      );
  }

  removeOrgUnit() {
    this.localizedConfirmationService.confirm(
      this.localizationService.instant(
        "TenantManagement::RemoveOrgUnitConfirmation",
        this.selectedUnit?.data?.displayName
      ),
      () => {
        this.loadingDetails = true;
        this.organizationUnitService
          .delete(this.selectedUnit?.data?.id)
          .pipe(
            first(),
            finalize(() => (this.loadingDetails = false))
          )
          .subscribe((responseUnit) => {
            this.selectedUnit = null;
            this.loadOrganizationUnits();
          });
      },
      () => {
        return;
      },
    );
  }

  addMembers(users) {
    users.forEach((user) => {
      this.addMember(user);
    });
  }

  addMember(user) {
    this.organizationUnitService
      .addMember(user.id, this.selectedUnit.data.id)
      .pipe(first())
      .subscribe(() => {
        this.msgService.success(
          "TenantManagement::Member:User:SuccessfullyAdded"
        );
        this.loadMembersData();
      });
  }

  removeMember(user) {
    this.localizedConfirmationService.confirm(
      this.localizationService.instant(
        "TenantManagement::Member:User:DeleteConfirmation"
      ),
      () => {
        this.organizationUnitService
          .removeMemberByUserIdAndOrgUnitId(user.id, this.selectedUnit.data.id)
          .pipe(first())
          .subscribe(() => {
            this.msgService.success(
              "TenantManagement::Member:User:SuccessfullyRemoved"
            );
            this.loadMembersData();
          });
      },
      () => {
        return;
      },
);
  }

  addRoles(roles) {
    this.organizationUnitService
		.addRoles(this.selectedUnit.data.id, roles.map(r => r.id))
		.pipe(first())
		.subscribe((result) => {
			this.msgService.success(
          "TenantManagement::Member:Role:SuccessfullyAdded"
        );
			this.loadRolesData();
		});
  }

  addRole(role) {
    this.organizationUnitService
      .addRole(role.id, this.selectedUnit.data.id)
      .pipe(first())
      .subscribe(() => {
        this.loadRolesData();
      });
  }

  removeRole(role) {
		this.localizedConfirmationService.confirm('TenantManagement::Role:DeleteConfirmation', () => {
			this.organizationUnitService
				.removeRoleByRoleIdAndOrgUnitId(role.id, this.selectedUnit.data.id)
				.pipe(first())
				.subscribe(() => {
					this.loadRolesData();
				});
		});
  }

  openRoleSelectionDialog() {
    this.identitySelectionService.openRoleSelectionDialog({
      title: this.localizationService.instant('Infrastructure::OrganizationUnit:Roles:Add'),
      permissions: [],
      selectedRoles: [],
      ignoredRoles: this.unitRoles,
      isMultiple: true,
      onSelect: (roles) => this.addRoles(roles)
    });
  }
  openUserSelectionDialog() {
    this.identitySelectionService.openUserSelectionDialog({
      title: this.localizationService.instant('Infrastructure::OrganizationUnit:Members:Add'),
      permissions: [],
      selectedUsers: [],
      ignoredUsers: this.unitMembers,
      isMultiple: true,
      onSelect: (users) => this.addMembers(users)
    });
  }
}
