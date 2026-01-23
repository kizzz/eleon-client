import { TreeNode } from "primeng/api";
import { finalize } from "rxjs/operators";

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { ILocalizationService } from '@eleon/angular-sdk.lib';
import {
  CustomPermissionDto,
  CustomPermissionGroupDto,
  CustomPermissionsService,
  MultiTenancySides,
} from '@eleon/tenant-management-proxy';
import {
  FeaturePermissionListResultDto,
  PermissionGroupCategory,
  PermissionGroupService,
} from '@eleon/tenant-management-proxy';
import { TreeNodeSelectEvent } from 'primeng/tree'
import { TreeTable } from 'primeng/treetable'

interface CustomGroup {
  data: CustomPermissionGroupDto;
createCustomCategory: boolean;
  validators: {
    nameEmpty: boolean;
    categoryEmpty: boolean;
  },
}

interface CustomPermission {
  data: CustomPermissionDto;
  validators: {
    permissionKeyInvalid: boolean;
    permissionNameInvalid: boolean;
    parentNotSelected: boolean;
    orderInvalid: boolean;
  },
}

@Component({
  standalone: false,
  selector: "app-permission-selection-dialog",
  templateUrl: "./permission-selection-dialog.component.html",
  styleUrls: ["./permission-selection-dialog.component.scss"],
})

export class PermissionSelectionComponent implements OnInit {
  loading= false;
  categories: TreeNode[] = [];
  selectedGroup?: CustomPermissionGroupDto | null;
  originalCategories: PermissionGroupCategory[] = [];
  permissions: CustomPermissionDto[] = [];
  permissionsTree: TreeNode[] = [];
  selectedPermissionNode: TreeNode | null = null;
  originalCustomGroups: CustomPermissionGroupDto[] = [];
  MultiTenancySides = MultiTenancySides;
  selected: TreeNode | null = null;

  group: CustomGroup;
  groupDialogShow = false;
  groupDialogTitle = '';
  isEditGroup = false;
  
  isEditPermission = false;
  permissionDialogShow = false;
  permissionDialogTitle = '';
  customPermission: CustomPermission;
  categoryList: { value: string; name: string }[] = [];
  selectedPermissions: TreeNode[] = [];
  metaKeySelection: boolean = true;

  @Input()
  selectedPermissionsAsArray:string[] = [];
  @Input()
  showDialog: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() selectedPermissionEvent = new EventEmitter<CustomPermissionDto[]>();

  constructor(
    private localizationService: ILocalizationService,
    private customPermissionsService: CustomPermissionsService,
    protected categoryService: PermissionGroupService,
  ) {}

  ngOnInit() {
    this.loadCategories();
    this.loadPermissions();
    this.loadNotGouppedPermissions();
  }

  loadCategories() {
    this.loading = true;
    this.categoryService.getPermissionGroups()
    .pipe(finalize(() => this.loading = false))
    .subscribe((res) => {
      this.categoryList = [];
      if(res?.length > 0){
        res.forEach((category) => {
          this.categoryList.push({
            value: category.name,
            name: this.localizationService.instant(category.name)
        });
        });
      }
      this.originalCategories = [...res];
      this.categories = res
      .map(
        (category) =>
          ({
            label: category.name?.length ? this.localizationService.instant(category.name) : null,
            children: category.permissionGroups?.length
              ? category.permissionGroups
                  .filter((group) =>
                    category.permissionGroups.includes(group)
                  )
                  .map(
                    (group) =>
                      ({
                        label: group.name,
                        type: "group",
                        children: [],
                        data: group
                      } satisfies TreeNode)
                  )
                  .sort((a, b) => a.data.order - b.data.order)
              : null,
            type: "category",
            expanded: true,
          } satisfies TreeNode)
      )
    });
  }

  loadNotGouppedPermissions() {
    this.loading = true;
    this.customPermissionsService.getPermissionDynamicGroupCategories()
    .pipe(finalize(() => this.loading = false))
    .subscribe((res:CustomPermissionGroupDto[] ) => {
      this.originalCustomGroups = res;
    });
  }

  loadPermissions() {
    this.loading = true;
    this.customPermissionsService.getPermissionsDynamic()
    .pipe(finalize(() => this.loading = false))
    .subscribe((result: CustomPermissionDto[]) => {
      this.permissions = result;
      if(this.permissions?.length > 0){
        if (this.permissions?.length > 0 && this.selectedPermissionsAsArray?.length > 0) {
          this.permissions.forEach((permission) => {
            if(this.selectedPermissionsAsArray.includes(permission.name)){
              this.selectedPermissions.push({
                label: permission.name,
                data: permission,
                children: [],
                expanded: true,
              });
            }
          });

          // this.selectedPermissionsAsArray.forEach((selectedPermission) => {
          //   let selected = this.findPermissionByLabel(this.permissionsTree, selectedPermission);
          //   if (selectedPermission) {
          //     this.selectedPermissions.push(selected);
          //   }
          // });
        }
      }

    });
  }

  nodeSelect(event: TreeNodeSelectEvent) {
    this.selected = event?.node;
    if (!event?.node || event.node.type === "category") return;
    this.onChangeGroup(event.node);
  }

  onChangeGroup(groupLabel: TreeNode) {
    this.selectedGroup = this.originalCustomGroups.filter((permission) => permission.name === groupLabel.label)[0];
    if(this.categories?.find(x=>x.label === groupLabel?.parent?.label)){
      this.selectedGroup.categoryName = this.categories?.find(x=>x.label === groupLabel?.parent?.label).label;
    }
    this.initTreeTable();
    
  }

  initTreeTable(){
    this.permissionsTree = [];
    this.permissionsTree = [...this.permissionsTree];
    let groupByCheck = this.permissions.reduce((acc, curr) => {
      (acc[curr.groupName] = acc[curr.groupName] || []).push(curr);
      return acc;
    }, {});
    let permissionOfGroup = groupByCheck[this.selectedGroup.name];
    
    if (permissionOfGroup) {
      const nodesMap = new Map();
    
      let rootNodes = permissionOfGroup
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
    
      permissionOfGroup
        .filter(permission => permission.parentName)
        .forEach(permission => {
          const parent = nodesMap.get(permission.parentName);
          if (parent) {
            const childNode = {
              label: permission.name,
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

  sortTree(tree) {
    return tree
      .map(node => ({
        ...node,
        children: node.children ? this.sortTree(node.children) : []
      }))
      .sort((a, b) => (a.data.order || 0) - (b.data.order || 0));
  }

  closeDialog() {
    this.visibleChange.emit(false);
  }

  visibleChangeHandler(visible: boolean) {
    this.visibleChange.emit(visible);
  }

  getChecked(name) {
    return this.selectedPermissions.find(x => x.label === name);
  }

  submit(){
    let list: CustomPermissionDto[] = [];
    list = this.selectedPermissions?.map(x=>x.data);
    this.selectedPermissionEvent.emit(list);
    this.selectedPermissions = [];
    this.showDialog = false;
  }

  getCount(group){
    return this.selectedPermissions?.filter(x=>x.data?.groupName === group)?.length || 0;
  }

  findPermissionByLabel(tree: TreeNode[], label: string): TreeNode | null {
    for (const node of tree) {
      if (node.label === label) {
        return node;
      }
      if (node.children && node.children.length > 0) {
        const found = this.findPermissionByLabel(node.children, label);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }
}

