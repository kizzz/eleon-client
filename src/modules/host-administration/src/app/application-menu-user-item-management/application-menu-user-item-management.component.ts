import { Component, Input, OnInit } from '@angular/core';
import { MessageService, TreeNode } from 'primeng/api';
import {
  ApplicationMenuItemDto,
  ApplicationMenuItemService,
  CustomPermissionDto,
  ItemType,
  MenuType,
} from '@eleon/sites-management-proxy';
import { generateTempGuid, PipesModule, RequiredMarkModule, SharedModule } from '@eleon/angular-sdk.lib';
import { TreeTableModule } from 'primeng/treetable';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TableModule } from 'primeng/table';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputGroupModule } from 'primeng/inputgroup';
import { ProgressBarModule } from 'primeng/progressbar';
import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { TooltipModule } from 'primeng/tooltip';
import { InputNumberModule } from 'primeng/inputnumber';
import { ResponsiveTableModule, SharedTableModule } from '@eleon/primeng-ui.lib';
import { finalize, Observable, tap } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';
import { PermissionSelectionModule } from '../permission-management/permission-selection/permission-selection.module';

interface ItemsTreeNode extends TreeNode {
  data: ApplicationMenuItemDto;
  rowUniqueId: string;
}

interface MenuItemModel {
  name: string;
  order: number;
  icon: string;
  requiredPolicy: string;
  path: string;
  validators: {
    nameEmpty: boolean;
    orderEmpty: boolean;
    policyEmpty: boolean;
    pathEmpty: boolean;
  },
}

@Component({
  selector: 'app-application-menu-user-item-management',
  standalone: true,
  imports: [
    SharedModule,
    TreeTableModule,
    ButtonModule,
    RequiredMarkModule,
    TableModule,
    SharedTableModule,
    ProgressBarModule,
    InputGroupAddonModule,
    PipesModule,
    InputGroupModule,
    InputTextModule,
    ToggleSwitchModule,
    TooltipModule,
    ResponsiveTableModule,
    InputNumberModule,
    DialogModule,
    TextareaModule,
    PermissionSelectionModule],
  templateUrl: './application-menu-user-item-management.component.html',
  styleUrls: ['./application-menu-user-item-management.component.css'],
  providers:[
    TableModule,
  ]
})

export class ApplicationMenuUserItemManagementComponent implements OnInit {
  isUserMenu: boolean = true;
  menuItems: ApplicationMenuItemDto[] = [];
  menuItemsTree: ItemsTreeNode[] = [];
  loading= false;
  ItemType = ItemType;
  selectedNode: ItemsTreeNode | null = null;
  createNodeDialogShow: boolean = false;
  menuItemModel: MenuItemModel;
  title: string = '';
  isEditing: boolean = false;
  MenuType = MenuType;
  isGeneral: boolean = false;
  pathTooltip: string = '';
  showPermissionDialog: boolean = false;
  selectedPermissionPolicies: string[] = [];
  
  @Input()
  type: MenuType;

  @Input()
  applicationId: string;

  @Input()
  applicationName: string;

  constructor(
    private messageService: MessageService,
    private localizationService: ILocalizationService,
    private applicationMenuItemService: ApplicationMenuItemService
  ) {}

  ngOnInit() {
    const baseURI = document.baseURI; 
    const appsIndex = baseURI.includes('apps/') 
    ? baseURI.indexOf('apps/') + 'apps/'.length 
    : (baseURI.includes('ec/') 
        ? baseURI.indexOf('ec/') + 'ec/'.length 
        : 0);

  if (appsIndex > 0) {
    this.pathTooltip = baseURI.substring(0, appsIndex);
  } else {
    this.pathTooltip = baseURI;
  }    this.title = this.localizationService.instant('TenantManagement::ApplicationMenuItem:AddMenuItem');
    this.loadApplicationMenuItems();
    this.initMenuItemModel();
  }

  get isUserType() {
    return this.type === MenuType.User;
  }

  get isTopType() {
    return this.type === MenuType.Top;
  }


  initMenuItemModel() {
    this.menuItemModel = {
      name: '',
      order: 999,
      icon: '',
      requiredPolicy: '',
      path: '',
      validators: {
        nameEmpty: false,
        orderEmpty: false,
        policyEmpty: false,
        pathEmpty: false
      }
    };
  }

  loadApplicationMenuItems() {
    if (!this.applicationId) return;
    this.loading = true;
    this.applicationMenuItemService
      .getListByApplicationIdAndMenuType(this.applicationId, this.type)
      .subscribe((result) => {
        this.menuItemsTree = [];
        this.menuItems = result;
  
        const menuItemsMap: { [key: string]: ItemsTreeNode } = {};
    
        this.menuItems.forEach((item) => {
          menuItemsMap[item.id] = {
            data: item,
            label: item.label,
            children: [],
            expanded: true,
            icon: item.icon,
            rowUniqueId: generateTempGuid(),
          };
        });
  
        const findParentNodeByLabel = (label: string): ItemsTreeNode | null => {
          const parentItem = this.menuItems.find((item) => item.label === label);
          return parentItem ? menuItemsMap[parentItem.id] : null;
        };
  
        this.menuItems.forEach((item) => {
          const node = menuItemsMap[item.id];
          let parentNode = item.parentName ? findParentNodeByLabel(item.parentName) : null;
  
          if (parentNode) {
            parentNode.children.push(node);
          } else if (!item.parentName) {
            this.menuItemsTree.push(node);
          }
        });
  
        this.refreshTable();
        this.loading = false;
      });
  }
  

  resetValidators() {
    this.menuItemModel.validators = {
      nameEmpty: false,
      orderEmpty: false,
      policyEmpty: false,
      pathEmpty: false
    }
  }

  checkLabelUnique(nodeList: ItemsTreeNode[], labelToCheck: string): boolean {
    for (const node of nodeList) {
      if (node.label === labelToCheck && node.rowUniqueId !== this.selectedNode?.rowUniqueId) {
        return false;
      }
      if (node.children && !this.checkLabelUnique(node.children as ItemsTreeNode[], labelToCheck)) {
        return false;
      }
    }
    return true;
  }

  validateLabelUnique() {
    const isLabelUnique = this.checkLabelUnique(this.menuItemsTree, this.menuItemModel.name);

    if (!isLabelUnique) {
      this.messageService.add({
        severity: 'error',
        summary: this.localizationService.instant('TenantManagement::ApplicationMenuItem:NameNotUnique'),
      });
      return false;
    }

  return true;
  }
  

  validate(): boolean{
    this.menuItemModel.name = this.menuItemModel?.name?.trim();
    let isValid = false;
    if(!this.menuItemModel.name){
      this.menuItemModel.validators.nameEmpty = true;
      this.messageService.add({severity:'error', summary: this.localizationService.instant('TenantManagement::ApplicationMenuItem:NameEmpty')});
    } else if(this.menuItemModel?.name?.length > 0 && !this.validateLabelUnique()){
      this.menuItemModel.validators.nameEmpty = true;
    } else if(this.menuItemModel.order < 0){
      this.menuItemModel.validators.orderEmpty = true;
      this.messageService.add({severity:'error', summary: this.localizationService.instant('TenantManagement::ApplicationMenuItem:OrderEmpty')});
    } else if(!this.menuItemModel.requiredPolicy){
      this.menuItemModel.validators.policyEmpty = true;
      this.messageService.add({severity:'error', summary: this.localizationService.instant('TenantManagement::ApplicationMenuItem:PolicyEmpty')});
    }
     else{
      isValid = true;
    }
    return isValid;
  }

  //#region Add 

  addMenuItem() {
    this.createNodeDialogShow = true;
  }

  addRow(node: ItemsTreeNode) {
    this.selectedNode = node;
    this.createNodeDialogShow = true;
  }

  createMenuItemVisibleChange(visible: boolean) {
    if (!visible) {
      this.createNodeDialogShow = false;
      this.isEditing = false;
      this.initMenuItemModel();
    }
  }

  closeCreateNodeDialog() {
    this.createNodeDialogShow = false;
  }

  submit(){
    if(this.isEditing){
      this.saveEditedNode();
    } else {
      this.onAdd();
    }
  } 

  onAdd(){
    if(!this.validate()) return;
    this.onRowAdd();
    this.initMenuItemModel();
    this.createNodeDialogShow = false;
  }
  
  onRowAdd() {
    const newChildNode: ItemsTreeNode = {
      data: { 
        label: this.menuItemModel.name,
        itemType: ItemType.MenuItem,
        menuType:  this.type,
        order: this.menuItemModel.order,
        applicationId: this.applicationId,
        icon: this.menuItemModel.icon,
        parentName: this.selectedNode?.data?.label || this.selectedNode?.label,
        path: this.menuItemModel.path,
        requiredPolicy: this.menuItemModel.requiredPolicy,
        display: true
       } as ApplicationMenuItemDto,
      label: this.menuItemModel.name,
      children: [],
      expanded: true,
      rowUniqueId: generateTempGuid()
    };

    if(this.selectedNode){
      if (this.selectedNode?.children) {
        this.selectedNode.children.push(newChildNode);
      } else {
        this.selectedNode.children = [newChildNode];
      }
    } else{
      this.menuItemsTree.push(newChildNode);

    }

    this.refreshTable();
    this.initMenuItemModel();
  }

  refreshTable() {
    const sortNodes = (nodes: ItemsTreeNode[]): ItemsTreeNode[] => {
      return nodes
        .sort((a, b) => {
          return (a.data?.order || 0) - (b.data?.order || 0);
        })
        .map(node => ({
          ...node,
          children: node.children ? sortNodes(node.children as ItemsTreeNode[]) : []
        }));
    };
  
    this.menuItemsTree = sortNodes(this.menuItemsTree);
  }

  //#endregion

  //#region  Edit

  editRow(node: ItemsTreeNode) {
    this.isEditing = true;
      this.selectedNode = node;
      this.title = this.localizationService.instant('TenantManagement::ApplicationMenuItem:EditMenuItem');
      this.createNodeDialogShow = true;
      this.menuItemModel = {
        icon: node.data.icon,
        name: node.data.label,
        order: node.data.order,
        requiredPolicy: node.data.requiredPolicy,
        path: node.data.path,
        validators: {
          nameEmpty: false,
          orderEmpty: false,
          policyEmpty: false,
          pathEmpty: false
        }
      }
  }

  saveEditedNode() {
    if(!this.validate()) return;
    this.selectedNode.data.label = this.menuItemModel.name;
    this.selectedNode.data.order = this.menuItemModel.order;
    this.selectedNode.data.icon = this.menuItemModel.icon;
    this.selectedNode.data.path = this.menuItemModel.path;
    this.selectedNode.label = this.menuItemModel.name;
    this.selectedNode.data.requiredPolicy = this.menuItemModel.requiredPolicy;
    this.refreshTable();
    this.createNodeDialogShow = false;
    this.isEditing = false;
    this.initMenuItemModel();
  }

  //#endregion

  deleteRow(nodeToDelete: ItemsTreeNode) {
    const deleteNode = (nodes: ItemsTreeNode[], targetNode: ItemsTreeNode): ItemsTreeNode[] => {
      return nodes
        .filter(currentNode => currentNode !== targetNode)
        .map(currentNode => ({
          ...currentNode,
          children: currentNode.children ? deleteNode(currentNode.children as ItemsTreeNode[], targetNode) : []
        }));
    };
  
    this.menuItemsTree = deleteNode(this.menuItemsTree, nodeToDelete);
  }
  
  

  update(): Observable<void | ApplicationMenuItemDto[]> {
    this.loading = true;
    const list: ApplicationMenuItemDto[] = [];

    this.menuItemsTree.forEach(node => {
        const addData = (currentNode: ItemsTreeNode) => {
            list.push(currentNode.data);
            currentNode.children?.forEach(child => addData(child as ItemsTreeNode));
        };
        addData(node);
    });

    return this.applicationMenuItemService
        .update(
            this.applicationId,
            list,
        )
        .pipe(
            finalize(() => (this.loading = false)),
            tap(() => this.loadApplicationMenuItems())
        );
  }

    permissionVisibleChangeHandler(event){
      this.showPermissionDialog = event;
      if(!event){
        this.selectedPermissionPolicies = [];
      }
    }
  
    displayPermissionDialog(){
      this.selectedPermissionPolicies = this.menuItemModel?.requiredPolicy.split(',');
      this.showPermissionDialog = true;
    }
  
    selectedPermissionHandler(event: CustomPermissionDto[]){
      if(event.length > 0){
        this.menuItemModel.requiredPolicy = event.map(permission => permission.name).join(',');
      }
      this.showPermissionDialog = false;
    }
}