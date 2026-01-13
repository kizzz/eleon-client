import { CommonModule } from "@angular/common"
import { Component, OnInit } from '@angular/core'
import { ILocalizationService } from '@eleon/angular-sdk.lib';
import {
  CustomPermissionDto,
  CustomPermissionGroupDto,
  CustomPermissionsService,
  MultiTenancySides
} from '@eleon/sites-management-proxy';
import { FeaturePermissionListResultDto, PermissionGroupCategory, PermissionGroupService, } from '@eleon/tenant-management-proxy';
import { PipesModule, RequiredMarkModule, SharedModule, generateTempGuid } from '@eleon/angular-sdk.lib'
import { LocalizedMessageService } from '@eleon/primeng-ui.lib'
import { PageControls, contributeControls } from "@eleon/primeng-ui.lib"
import { PageTitleModule } from "@eleon/primeng-ui.lib"
import { ResponsiveTableModule, SharedTableModule, TableCellsModule } from "@eleon/primeng-ui.lib"
import { TreeNode } from 'primeng/api'
import { ButtonModule } from "primeng/button"
import { CheckboxModule } from 'primeng/checkbox'
import { DialogModule } from "primeng/dialog"
import { SelectModule } from "primeng/select"
import { InputGroupModule } from 'primeng/inputgroup'
import { InputGroupAddonModule } from 'primeng/inputgroupaddon'
import { InputNumberModule } from 'primeng/inputnumber'
import { ToggleSwitchModule } from "primeng/toggleswitch"
import { InputTextModule } from "primeng/inputtext"
import { TextareaModule } from "primeng/textarea"
import { MultiSelectModule } from "primeng/multiselect"
import { ProgressBarModule } from 'primeng/progressbar'
import { RadioButtonModule } from "primeng/radiobutton"
import { TableModule } from "primeng/table"
import { TagModule } from 'primeng/tag'
import { TooltipModule } from "primeng/tooltip"
import { TreeModule, TreeNodeSelectEvent } from 'primeng/tree'
import { TreeTableModule } from 'primeng/treetable'
import { catchError, finalize, throwError } from 'rxjs'

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
  selector: 'app-permission-management-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    TableModule,
    ButtonModule,
    PageTitleModule,
    ResponsiveTableModule,
    RadioButtonModule,
    ToggleSwitchModule,
    InputTextModule,
    SelectModule,
    MultiSelectModule,
    DialogModule,
    TextareaModule,
    TooltipModule,
    TableCellsModule,
    SharedTableModule,
    PipesModule,
    RequiredMarkModule,
    TreeTableModule,
    InputGroupAddonModule,
    InputGroupModule,
    ProgressBarModule,
    InputNumberModule,
    TreeModule,
    CheckboxModule,
    TagModule
  ],
  templateUrl: './permission-management-dashboard.component.html',
  styleUrls: ['./permission-management-dashboard.component.css'],
})

export class PermissionManagementDashboardComponent implements OnInit {
  loading= false;
  categories: TreeNode[] = [];
  selectedGroup?: CustomPermissionGroupDto | null;
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
  parentList: { value: string; name: string }[] = [];

  data: FeaturePermissionListResultDto = {
    groups: [],
    entityDisplayName: "",
    allGrantedByProvider: null,
  };
  
  @PageControls()
  controls = contributeControls([
    {
      key: 'TenantManagement::Permission:AddGroup',
      icon: 'pi pi-plus',
      severity: 'info',
      show: () => true,
      loading: () => this.loading,
      disabled: () => this.loading,
      action: () => this.addGroup(),
    },
    {
      key: 'TenantManagement::Permission:AddPermission',
      icon: 'pi pi-plus',
      severity: 'info',
      show: () => true,
      loading: () => this.loading,
      disabled: () => this.loading,
      action: () => this.addPermission(),
    },
  ])

  constructor(
    private messageService: LocalizedMessageService,
    private localizationService: ILocalizationService,
    private customPermissionsService: CustomPermissionsService,
    protected categoryService: PermissionGroupService,
  ) {}

  ngOnInit() {
		this.loadPermissions();
    this.loadGroups();
  }

  // loadCategories() {
  //   this.loading = true;
  //   this.categoryService.getPermissionGroups()
  //   .pipe(finalize(() => this.loading = false))
  //   .subscribe((res) => {
  //     this.categoryList = [];
  //     if(res?.length > 0){
  //       res.forEach((category) => {
  //         this.categoryList.push({
  //           value: category.name,
  //           name: this.localizationService.instant(category.name)
  //       });
  //       });
  //     }
  //     this.categories = res
  //     .map(
  //       (category) =>
  //         ({
  //           label: category.name?.length ? this.localizationService.instant(category.name) : null,
  //           children: category.permissionGroups?.length
  //             ? category.permissionGroups
  //                 .filter((group) =>
  //                   category.permissionGroups.includes(group)
  //                 )
  //                 .map(
  //                   (group) =>
  //                     ({
  //                       label: group.name,
  //                       type: "group",
  //                       children: [],
  //                       data: group
  //                     } satisfies TreeNode)
  //                 )
  //                 .sort((a, b) => a.data.order - b.data.order)
  //             : null,
  //           type: "category",
  //           expanded: true,
  //         } satisfies TreeNode)
  //     )
  //   });
  // }

  loadGroups() {
    this.loading = true;
    this.customPermissionsService.getPermissionDynamicGroupCategories()
    .pipe(finalize(() => this.loading = false))
    .subscribe((res:CustomPermissionGroupDto[] ) => {
      this.originalCustomGroups = res;
			const categories = [...new Set(res.map(g => g.sourceId))]
			this.categories = categories.map(c => {
				return {
					label: c || this.localizationService.instant('TenantManagement::System'),
					children: res.filter(g => g.sourceId === c).map(g => {
						return {
							label: g.name,
							data: g,
							type: "group",
            	expanded: true,
						}
					}),
					type: "category",
          expanded: true,
				} satisfies TreeNode;
			})
    });
  }

  loadPermissions() {
    this.loading = true;
    this.customPermissionsService.getPermissionsDynamic()
    .pipe(finalize(() => this.loading = false))
    .subscribe((result: CustomPermissionDto[]) => {
      this.permissions = result;
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
    this.parentList = [];
    this.permissionsTree = [];
    this.permissionsTree = [...this.permissionsTree];
    let groupByCheck = this.permissions.reduce((acc, curr) => {
			const key = `${curr.groupName}|${curr.sourceId}`; // composite key
			(acc[key] = acc[key] || []).push(curr);
			return acc;
		}, {} as Record<string, typeof this.permissions>);
    const key = `${this.selectedGroup.name}|${this.selectedGroup.sourceId}`;
		let permissionOfGroup = groupByCheck[key];
    
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

      if (this.permissionsTree.length > 0) {
        if(permissionOfGroup.filter(permission => !permission.parentName)?.length > 0){
          let list = permissionOfGroup.filter(permission => !permission.parentName);
          list.forEach((item) => {
            this.parentList.push({ value: item.name, name: this.localizationService.instant(item.name)});
          });
        }
        this.parentList.unshift({ value: 'root', name: this.localizationService.instant('TenantManagement::Root') });
      }
    }
    else{
      this.parentList.unshift({ value: 'root', name: this.localizationService.instant('TenantManagement::Root') });
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

  //#region  Group

  resetGroupValidators(){
    this.group.validators.categoryEmpty = false;
    this.group.validators.nameEmpty = false;
  }

  initGroup() {
    this.group = {
      createCustomCategory: false,
      data: {
        name: '',
        displayName: '',
        id: generateTempGuid(),
        categoryName: '',
        dynamic: true,
        order: 0
      },
      validators: {
        nameEmpty: false,
        categoryEmpty: false
      }
    };
  }

  addGroup(){
    this.initGroup();
    this.groupDialogTitle = this.localizationService.instant('TenantManagement::Permission:AddGroup:Title');
    this.groupDialogShow = true;
  }

  groupDialogVisibleChange(visible: boolean) {
    if (!visible) {
      this.groupDialogShow = false;
      this.initGroup();
      this.isEditGroup = false;
    }
  }

  saveGroup() {
    if(!this.validateGroup()) return;
    this.group.data.displayName = this.group.data.name;
    if(this.isEditGroup){
      this.loading = true;
      this.customPermissionsService.updateGroup(this.group.data)
        .pipe(
          finalize(() => (this.loading = false)),
          catchError((error) => {
            this.messageService.error('TenantManagement::Permission:GroupUpdate:Fail');
            return throwError(() => error);
          })
        )
        .subscribe({
          next: () => {
            this.messageService.success('TenantManagement::Permission:GroupUpdate:Success');
            this.loadGroups();
            this.groupDialogShow = false;
            this.initGroup();
          },
          error: () => {
          }
        });
    }else{
      this.loading = true;
      this.customPermissionsService.createGroup(this.group.data)
        .pipe(
          finalize(() => (this.loading = false)),
          catchError((error) => {
            this.messageService.error('TenantManagement::Permission:GroupCreated:Fail');
            return throwError(() => error);
          })
        )
        .subscribe({
          next: () => {
            this.messageService.success('TenantManagement::Permission:GroupCreated:Success');
            this.loadGroups();
            this.groupDialogShow = false;
            this.initGroup();
          },
          error: () => {
          }
        });
    }
  }

  closeGroupDialog() {
    this.permissionDialogShow = false;
    this.isEditGroup = false;
  }

  validateGroup(): boolean {
    let isValid = true;
    if(!this.group?.data?.categoryName){
      isValid = false;
      this.group.validators.categoryEmpty = true;
      this.messageService.error('TenantManagement::Permission:Group:CategoryEmpty');
    } else if(!this.group?.data?.name){
      isValid = false;
      this.group.validators.nameEmpty = true;
      this.messageService.error('TenantManagement::Permission:Group:NameEmpty');
    }

    return isValid;
  }

  deleteGroup(node: any){
    this.loading = true;
    this.customPermissionsService.deleteGroup(node.label)
    .pipe(finalize(() => this.loading = false))
    .subscribe(reply=>{
      this.messageService.success('TenantManagement::Permission:GroupDeleted:Success');
      this.loadGroups();
    });
  } 

  editGroup(node: any){
    this.isEditGroup = true;
    this.selectedGroup = this.originalCustomGroups.filter((permission) => permission.name === node.label)[0];
    this.group = {
      data: {
        ...this.selectedGroup,
        categoryName: node?.parent?.label
      },
      createCustomCategory: false,
      validators: {
        nameEmpty: false,
        categoryEmpty: false
      }
    };
    this.groupDialogTitle = this.localizationService.instant('TenantManagement::Permission:EditGroup:Title', node.label);
    this.groupDialogShow = true;
  }

  //#endregion
  
  //#region  Permission

  editRow(node: TreeNode) {
    this.isEditPermission = true;

    this.selectedGroup = this.originalCustomGroups.filter((permission) => permission.name === node.data.groupName)[0];

    this.customPermission = {
      data: {
        ...node.data,
        parentName: node.data.parentName || 'root',
      },
      validators: {
        parentNotSelected: false,
        permissionKeyInvalid: false,
        permissionNameInvalid: false,
        orderInvalid: false
      }
    };
    if(this.parentList.length > 0){
      this.parentList = this.parentList.filter(x=> x.value !== this.customPermission.data.name);
    }
    this.permissionDialogTitle = this.localizationService.instant('TenantManagement::Permission:AddPermission:Title', 
    this.selectedGroup.categoryName, this.selectedGroup.name);
    this.permissionDialogShow = true;
  }

  deleteRow(node: TreeNode) {
    this.loading = true;
    this.customPermissionsService.deletePermission(node.data.name)
    .pipe(finalize(() => this.loading = false))
    .subscribe(reply=>{
      this.permissions = this.permissions.filter((permission) => permission.id !== node.data.id);
      this.permissions = [...this.permissions];
      this.messageService.success('TenantManagement::Permission:PermissionDeleted:Success');
      this.loadPermissions();
      this.initTreeTable();
    });
  }

  initCustomPermission() {
    this.customPermission = {
      data: {
        isEnabled: true,
        displayName: '',
        groupName: '',
        id: generateTempGuid(),
        name: '',
        parentName: 'root',
        providers: '',
        stateCheckers: '',
        multiTenancySide: MultiTenancySides.Both,
        order : 0,
        dynamic: true
      },
      validators: {
        parentNotSelected: false,
        permissionKeyInvalid: false,
        permissionNameInvalid: false,
        orderInvalid: false
      }
    };
  }

  addPermission(){
    if(this.selectedGroup == null){
      this.messageService.error('TenantManagement::Permission:GroupNotSelected');
      return;
    }
    this.initCustomPermission();
    this.permissionDialogTitle = this.localizationService.instant('TenantManagement::Permission:AddPermission:Title', 
        this.selectedGroup.categoryName, this.selectedGroup.name);
    this.permissionDialogShow = true;
  }

  resetPermissionValidators(){
    this.customPermission.validators.parentNotSelected = false;
    this.customPermission.validators.permissionKeyInvalid = false;
    this.customPermission.validators.permissionNameInvalid = false;
    this.customPermission.validators.orderInvalid = false;
  }

  permissionDialogVisibleChange(visible: boolean) {
    if (!visible) {
      this.isEditPermission = false;
      this.permissionDialogShow = false;
      this.initCustomPermission();
    }
  }

  closePermissionDialog() {
    this.permissionDialogShow = false;
  }

  savePermission() {
    if(!this.validatePermission()) return;
    this.customPermission.data.parentName = this.customPermission.data.parentName === 'root' ? null : this.customPermission.data.parentName;
    this.customPermission.data.groupName = this.selectedGroup.name;
    
    if(!this.isEditPermission){
      this.loading = true;
      this.customPermissionsService.createPermission(this.customPermission.data)
        .pipe(
          finalize(() => (this.loading = false)),
          catchError((error) => {
            this.messageService.error('TenantManagement::Permission:PermissionCreated:Fail');
            return throwError(() => error);
          })
        )
        .subscribe((reply: CustomPermissionDto)=>{
          this.messageService.success('TenantManagement::Permission:PermissionCreated:Success');
          this.permissions = [...this.permissions, reply];
          this.permissionDialogShow = false;
          this.initCustomPermission();
          this.initTreeTable();
        });
    }
    else{
      this.loading = true;
      this.customPermissionsService.updatePermission(this.customPermission.data)
        .pipe(
          finalize(() => (this.loading = false)),
          catchError((error) => {
            this.messageService.error('TenantManagement::Permission:PermissionUpdate:Fail');
            return throwError(() => error);
          })
        )
        .subscribe((reply: CustomPermissionDto)=>{
          this.messageService.success('TenantManagement::Permission:PermissionUpdate:Success');
          this.permissions = this.permissions.filter((permission) => permission.id !== reply.id);
          this.permissions = [...this.permissions, reply];
          this.permissionDialogShow = false;
          this.initCustomPermission();
          this.isEditPermission = false;
          this.initTreeTable();
        });
    }
    
  }

  validatePermission(): boolean {
    let isValid = true;
    if(!this.customPermission?.data?.parentName){
      this.customPermission.validators.parentNotSelected = true;
      isValid = false;
      this.messageService.error('TenantManagement::Permission:Parent:NotSelected');
    } 
    if(this.customPermission?.data?.order < 0){
      this.customPermission.validators.orderInvalid = true;
      isValid = false;
      this.messageService.error('TenantManagement::Permission:Order:NotValid');
    } 
    if(!this.customPermission?.data?.name?.length){
      this.customPermission.validators.permissionNameInvalid = true;
      isValid = false;
      this.messageService.error('TenantManagement::Permission:PermissionName:Empty');
    }
    if(this.customPermission?.data?.name?.length > 0 && this.isPermissionNameUnique(this.customPermission?.data?.name, this.customPermission?.data?.id)){
      this.customPermission.validators.permissionNameInvalid = true;
      isValid = false;
      this.messageService.error('TenantManagement::Permission:PermissionName:NonUnique');
    }

    if(!this.customPermission?.data?.displayName?.length){
      this.customPermission.validators.permissionKeyInvalid = true;
      isValid = false;
      this.messageService.error('TenantManagement::Permission:PermissionKey:Empty');
    } 
    if(this.customPermission?.data?.displayName?.length > 0  && !/^[a-zA-Z0-9_]+$/.test(this.customPermission.data.displayName)){
      this.customPermission.validators.permissionKeyInvalid = true;
      isValid = false;
      this.messageService.error('TenantManagement::Permission:PermissionKey:Invalid');
    } 
    
    if(this.customPermission?.data?.displayName?.length > 0 && 
        this.isPermissionKeyUnique(this.customPermission?.data?.displayName, this.customPermission?.data?.id)){
      this.customPermission.validators.permissionKeyInvalid = true;
      isValid = false;
      this.messageService.error('TenantManagement::Permission:PermissionKey:NonUnique');
    }

    return isValid;
  }

  isPermissionKeyUnique(key: string, id: string): boolean {
    if(!this.permissions) return false;
    return this.permissions.filter((permission) => permission.displayName === key && permission.id !== id)?.length > 0;
  }

  isPermissionNameUnique(name: string, id: string): boolean {
    if(!this.permissions) return false;
    return this.permissions.filter((permission) => permission.name === name && permission.id !== id)?.length > 0;
  }
  
  showDisplayName = (localizationKey: string) => {
    let result = localizationKey;

    if (!result || result?.length < 2){
      return result;
    }

    if (result.startsWith("L:") || result.startsWith("F:")) {
        result = result.substring(2);
    }

    if (result.includes(",")) {
        result = result.replace(/,/g, '::'); 
    }

    return this.localizationService.instant(result);
}

  isDynamicGroup = (arg) => {
    const ng = this.originalCustomGroups.find(g => g.name === arg.label);
    return ng?.dynamic || false;
  }


	getTitle() {
		return (this.localizationService.instant('TenantManagement::Permissions:Title')) + (!!this.selectedGroup ? (' ' + this.showDisplayName(this.selectedGroup?.displayName) + ' [' + this.selectedGroup?.sourceId + ']') : '');
	}
  //#endregion
}
