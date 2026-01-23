import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { MessageService, TreeNode } from 'primeng/api';
import {
  ApplicationMenuItemDto,
  ApplicationMenuItemService,
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
import { TreeModule } from 'primeng/tree';
import { SelectModule } from 'primeng/select'

interface ItemsTreeNode extends TreeNode {
  data: ApplicationMenuItemDto;
  rowUniqueId: string;
  isDefault: boolean;
}

interface MenuItemModel {
  name: string;
  order: number;
  icon: string;
  requiredPolicy: string;
  path: string;
  rowUniqueId: string;
  id?: string;
  menuType: MenuType;
  isUrl: boolean;
  isNewWindow: boolean;
  validators: {
    nameEmpty: boolean;
    orderEmpty: boolean;
    pathEmpty: boolean;
  },
}

@Component({
  selector: 'app-application-menu-item-management',
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
    TreeModule,
    SelectModule],
  templateUrl: './application-menu-item-management.component.html',
  styleUrls: ['./application-menu-item-management.component.css'],
  providers:[
    TableModule,
  ]
})

export class ApplicationMenuItemManagementComponent implements OnInit {
  menuItems: ApplicationMenuItemDto[] = [];
  //right side
  menuItemsTree: ItemsTreeNode[] = [];
  selectedNode: ItemsTreeNode | null = null;
  //left side
  categoriesTree: ItemsTreeNode[] = [];
  selectedCategory: ItemsTreeNode | null = null;

  commonMenuItemsTree: ItemsTreeNode[] = [];

  loading= false;
  createNodeDialogShow: boolean = false;
  menuItemModel: MenuItemModel;
  isCategoryAdd: boolean  = false;
  isAddMenuItem: boolean  = false;
  isCategoryEditing: boolean  = false;
  title: string = '';
  isEditing: boolean = false;
  pathTooltip: string = '';
  showPermissionDialog: boolean = false;
  selectedPermissionPolicies: string[] = [];

  menuTypesList = [
    { name: MenuType[MenuType.Top], value: MenuType.Top },
    { name: MenuType[MenuType.User], value: MenuType.User },
    { name: MenuType[MenuType.General], value: MenuType.General },
  ]

  openingBehaviorList = [
    { name: "Same Page", value: false },
    { name: "New Window", value: true }
  ]

  linkTypesList = [
    { name: "Path", value: false },
    { name: "Url", value: true }
  ]
  
  @Input()
  applicationId: string;
  @Input()
  applicationName: string;
  @Input()
  menuType: MenuType;


  constructor(
    private messageService: MessageService,
    private localizationService: ILocalizationService,
    private applicationMenuItemService: ApplicationMenuItemService,
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
    }
    this.loadApplicationMenuItems();
    this.initMenuItemModel();
  }

  initMenuItemModel() {
    this.menuItemModel = {
      menuType: this.menuType,
      name: '',
      order: 999,
      icon: '',
      requiredPolicy: '',
      path: '',
      rowUniqueId: '',
      id: '',
      isNewWindow: false,
      isUrl: false,
      validators: {
        nameEmpty: false,
        orderEmpty: false,
        pathEmpty: false
      }
    };
  }

  loadApplicationMenuItems() {
    if (!this.applicationId) return;
    this.loading = true;
  
    this.applicationMenuItemService
      .getListByApplicationIdAndMenuType(this.applicationId, this.menuType)
      .subscribe((result) => {     
        //fill categories  begin
        
        this.categoriesTree = result?.filter((category) => category.itemType === ItemType.Category)
        .map(
        (category) =>
          ({
            label: category.label?.length ? this.localizationService.instant(category.label) : null,
            children: null,
            expanded: true,
            data: category,
            isDefault: false,
            rowUniqueId: generateTempGuid(),
            icon: category?.icon,
          } satisfies ItemsTreeNode)
        );  

        const defaultCategoryNode: ItemsTreeNode = {
          data: null,
          label: 'No Category',
          children: [],
          expanded: true,
          rowUniqueId: generateTempGuid(),
          isDefault: true,
          icon: 'pi pi-folder-open',
        };

        this.categoriesTree.unshift(defaultCategoryNode);
        //fill categories end

        this.menuItems = result;
        const menuItemsMap: { [key: string]: ItemsTreeNode } = {};
  
        const defaultNode: ItemsTreeNode = {
          data: null,
          label: 'No Category',
          children: [],
          expanded: true,
          rowUniqueId: generateTempGuid(),
          isDefault: true,
          icon: 'pi pi-folder-open',
        };
        this.commonMenuItemsTree = [defaultNode];
  
        this.menuItems.forEach((item) => {
          menuItemsMap[item.id] = {
            data: item,
            label: item.label,
            children: [],
            expanded: true,
            icon: item.icon,
            rowUniqueId: generateTempGuid(),
            isDefault: false,
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
          } else if (item.itemType === ItemType.Category && !item.parentName) {
            this.commonMenuItemsTree.push(node);
          } else if (item.parentName === "No Category") {
            defaultNode.children.push(node);
          } else {
            defaultNode.children.push(node);
          }
        });
  
        this.refreshCategories();
        this.loading = false;

        this.categorySelect({node: this.categoriesTree[0]});
      });
  }
  

  resetValidators() {
    this.menuItemModel.validators = {
      nameEmpty: false,
      orderEmpty: false,
      pathEmpty: false
    }
  }

  checkLabelUnique(nodeList: ItemsTreeNode[], labelToCheck: string, id: string): boolean {
    for (const node of nodeList) {
      if (node.label === labelToCheck && node.data.id !== this.menuItemModel?.id) {
        return false;
      }
      if (node.children && !this.checkLabelUnique(node.children as ItemsTreeNode[], labelToCheck, id)) {
        return false;
      }
    }
    return true;
  }
  

  validateLabelUnique() {
    let tree = this.commonMenuItemsTree;
    if(this.selectedCategory != null){
      const selectedNode = this.commonMenuItemsTree.find(
        (node) => node.label === (this.selectedCategory?.label || this.selectedCategory?.data?.label)
      );
    
      tree = selectedNode?.children?.map((child) => ({
        ...child,
        rowUniqueId: (child as ItemsTreeNode).rowUniqueId || generateTempGuid(),
        isDefault: (child as ItemsTreeNode).isDefault || false,
      })) as ItemsTreeNode[] || [];
    }
    const isLabelUnique = this.checkLabelUnique(tree, this.menuItemModel.name, this.menuItemModel.id);
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
    let isValid = false;
    this.menuItemModel.name = this.menuItemModel?.name?.trim();
    if(!this.menuItemModel.name){
      this.menuItemModel.validators.nameEmpty = true;
      this.messageService.add({severity:'error', summary: this.localizationService.instant('TenantManagement::ApplicationMenuItem:NameEmpty')});
    } else if(this.menuItemModel?.name?.length > 0 && !this.validateLabelUnique()){
      this.menuItemModel.validators.nameEmpty = true;
    } else if(this.menuItemModel.order < 0){
      this.menuItemModel.validators.orderEmpty = true;
      this.messageService.add({severity:'error', summary: this.localizationService.instant('TenantManagement::ApplicationMenuItem:OrderEmpty')});
    } 
     else{
      isValid = true;
    }
    return isValid;
  }

  //#region Add 

  addCategory() {
    this.isCategoryAdd = true;
    this.createNodeDialogShow = true;
    this.title =  this.localizationService.instant('TenantManagement::ApplicationMenuItem:AddCategory');
  }

  addMenuItem(){
    if(!this.selectedCategory){
      this.messageService.add({severity:'error', summary: this.localizationService.instant('TenantManagement::ApplicationMenuItem:SelectCategory')})
      return;
    }
    this.isAddMenuItem = true;
    this.createNodeDialogShow = true;
    this.title =  this.localizationService.instant('TenantManagement::ApplicationMenuItem:AddMenuItem');
  }

  addRow(node: ItemsTreeNode) {
    this.selectedNode = node;
    this.createNodeDialogShow = true;
    this.title =  this.localizationService.instant('TenantManagement::ApplicationMenuItem:AddMenuItem');
  }

  createMenuItemVisibleChange(visible: boolean) {
    if (!visible) {
      this.createNodeDialogShow = false;
      this.isCategoryAdd = false;
      this.isCategoryEditing = false;
      this.isEditing = false;
      this.isAddMenuItem = false;
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

    if(this.isCategoryAdd){
      this.onRowCategoryAdd();
    } else {
      this.onRowAdd();
    }
    this.initMenuItemModel();
    this.isCategoryAdd = false;
    this.createNodeDialogShow = false;
    this.isAddMenuItem = false;
  }
  
  onRowAdd() {
    let targetNode = this.isAddMenuItem? this.selectedCategory : this.selectedNode;
    const newChildNode: ItemsTreeNode = {
      data: { 
        label: this.menuItemModel.name,
        itemType: ItemType.MenuItem,
        menuType: this.menuItemModel.menuType,
        order: this.menuItemModel.order,
        applicationId: this.applicationId,
        icon: this.menuItemModel.icon,
        parentName: targetNode?.data?.label || targetNode?.label,
        path: this.menuItemModel.path,
        requiredPolicy: this.menuItemModel.requiredPolicy,
        display: true,
        isUrl: this.menuItemModel.isUrl,
        isNewWindow: this.menuItemModel.isNewWindow
       },
      label: this.menuItemModel.name,
      children: [],
      expanded: true,
      rowUniqueId: generateTempGuid(),
      isDefault: false,
    };

    this.addToParentNode(newChildNode);

    this.initMenuItems();
    this.initMenuItemModel();
  }

  addToParentNode(newNode: ItemsTreeNode) {
    const parentName = newNode.data?.parentName;
  
    const findAndAdd = (nodes: ItemsTreeNode[]): boolean => {
      for (const node of nodes) {
        if (node.label === parentName) {
          if (!node.children) {
            node.children = [];
          }
          node.children.push(newNode);
          return true;
        }
        if (node.children && findAndAdd(node.children as ItemsTreeNode[])) {
          return true;
        }
      }
      return false;
    };
  
    findAndAdd(this.commonMenuItemsTree);
  }
  

  refreshTable() {
    if (!this.menuItemsTree?.length) return;
  
    const sortNodes = (nodes: ItemsTreeNode[]): ItemsTreeNode[] => {
      return nodes
        .sort((a, b) => {
          if (a.isDefault) return -1;
          if (b.isDefault) return 1;
          return (a.data?.order || 0) - (b.data?.order || 0);
        })
        .map(node => ({
          ...node,
          children: node.children ? sortNodes(node.children as ItemsTreeNode[]) : [],
        }));
    };
  
    this.menuItemsTree = sortNodes(this.menuItemsTree);
  }
  

  refreshCategories() {
    const sortNodes = (nodes: ItemsTreeNode[]): ItemsTreeNode[] => {
      return nodes
        .sort((a, b) => {
          if (a.isDefault) return -1;
          if (b.isDefault) return 1;
          return (a.data?.order || 0) - (b.data?.order || 0);
        })
        .map(node => ({
          ...node,
          children: node.children ? sortNodes(node.children as ItemsTreeNode[]) : []
        }));
    };
  
    this.categoriesTree = sortNodes(this.categoriesTree);
  }


  onRowCategoryAdd() {
    const newCategoryNode: ItemsTreeNode = {
      data: {
          label: this.menuItemModel.name,
          itemType: ItemType.Category,
          path: '',
          parentName: '',
          menuType: this.menuItemModel.menuType,
          order: this.menuItemModel.order,
          applicationId: this.applicationId,
          icon: this.menuItemModel.icon,
          requiredPolicy: '',
          display: true,
          isUrl: this.menuItemModel.isUrl,
          isNewWindow: this.menuItemModel.isNewWindow
      },
      label: this.menuItemModel.name,
      children: [],
      expanded: true,
      rowUniqueId: generateTempGuid(),
      isDefault: false,
      icon: this.menuItemModel?.icon,
  };

  this.commonMenuItemsTree.push(newCategoryNode);
  this.categoriesTree.push(newCategoryNode);
  this.refreshCategories();
  this.isCategoryAdd = false;
  this.initMenuItemModel();
  }

  categorySelect(event: any) {
    this.selectedCategory = event.node;
    this.initMenuItems();
  }


  initMenuItems() {
    const selectedNode = this.commonMenuItemsTree.find(
      (node) => node.label === (this.selectedCategory?.label || this.selectedCategory?.data?.label)
    );
  
    this.menuItemsTree = selectedNode?.children?.map((child) => ({
      ...child,
      rowUniqueId: (child as ItemsTreeNode).rowUniqueId || generateTempGuid(),
      isDefault: (child as ItemsTreeNode).isDefault || false,
    })) as ItemsTreeNode[] || [];

    this.refreshTable();
  }

  //#endregion


  //#region  Edit

  editRow(node: ItemsTreeNode) {
    this.isEditing = true;
      this.selectedNode = node;
      this.isCategoryEditing = false;

      this.title = this.localizationService.instant('TenantManagement::ApplicationMenuItem:EditMenuItem');

      this.createNodeDialogShow = true;
      this.menuItemModel = {
        menuType: node.data.menuType,
        icon: node.data.icon,
        name: node.data.label,
        order: node.data.order,
        requiredPolicy: node.data.requiredPolicy,
        path: node.data.path,
        rowUniqueId: node.rowUniqueId,
        id: node.data.id,
        isUrl: node.data.isUrl,
        isNewWindow: node.data.isNewWindow,
        
        validators: {
          nameEmpty: false,
          orderEmpty: false,
          pathEmpty: false
        }
      }
  }

  editCategory(node: ItemsTreeNode) {
    this.isEditing = true;
    let cloned = structuredClone(node);
    this.selectedCategory = cloned;
    this.isCategoryEditing = true;

    this.title = this.localizationService.instant('TenantManagement::ApplicationMenuItem:EditMenuCategory');

    this.createNodeDialogShow = true;
    this.menuItemModel = {
      menuType: MenuType.General,
      icon: cloned.data.icon,
      name: cloned.data.label,
      order: cloned.data.order,
      requiredPolicy: cloned.data.requiredPolicy,
      path: cloned.data.path,
      rowUniqueId: cloned.rowUniqueId,
      id: cloned.data.id,
      isUrl: cloned.data.isUrl,
      isNewWindow: cloned.data.isNewWindow,
      validators: {
        nameEmpty: false,
        orderEmpty: false,
        pathEmpty: false
      }
    }
  }
  

  saveEditedNode() {
    if (!this.validate()) return;
  
    if (this.isCategoryEditing) {
      this.selectedCategory.data.label = this.menuItemModel.name;
      this.selectedCategory.data.order = this.menuItemModel.order;
      this.selectedCategory.data.icon = this.menuItemModel.icon;
      this.selectedCategory.label = this.menuItemModel.name;
      this.selectedCategory.data.requiredPolicy = this.menuItemModel.requiredPolicy;
      this.selectedCategory.icon = this.menuItemModel.icon;
  
      this.updateNodeInTree(this.commonMenuItemsTree, this.selectedCategory);
  
      this.refreshCategories();
    } else {
      if (!this.selectedNode){
        return;
      }
      this.selectedNode.data.label = this.menuItemModel.name;
      this.selectedNode.data.order = this.menuItemModel.order;
      this.selectedNode.data.icon = this.menuItemModel.icon;
      this.selectedNode.data.path = this.menuItemModel.path;
      this.selectedNode.data.menuType = this.menuItemModel.menuType;
      this.selectedNode.data.isUrl = this.menuItemModel.isUrl;
      this.selectedNode.data.isNewWindow = this.menuItemModel.isNewWindow;

      this.selectedNode.label = this.menuItemModel.name;
      this.selectedNode.data.requiredPolicy = this.menuItemModel.requiredPolicy;
      this.selectedCategory.icon = this.menuItemModel.icon;
  
      this.updateNodeInTree(this.commonMenuItemsTree, this.selectedNode);
  
      this.refreshTable();
    }
  
    this.createNodeDialogShow = false;
    this.isEditing = false;
    this.isCategoryEditing = false;
    this.initMenuItemModel();
  }
  
  updateNodeInTree(tree: ItemsTreeNode[], updatedNode: ItemsTreeNode): void {
    tree.forEach((node) => {
      if (node.rowUniqueId === updatedNode.rowUniqueId) {
        node.data = { ...updatedNode.data };
        node.label = updatedNode.label;
  
        if (node.children) {
          node.children.forEach((child) => {
            if (child.data) {
              child.data.parentName = updatedNode.label;
            }
          });
        }
      } else if (node.children) {
        this.updateNodeInTree(node.children as ItemsTreeNode[], updatedNode);
      }
    });
  }

  //#endregion

  deleteRow(nodeToDelete: ItemsTreeNode) {
    const deleteNode = (nodes: ItemsTreeNode[], targetNode: ItemsTreeNode): ItemsTreeNode[] => {
      return nodes
        .filter((currentNode) => currentNode.rowUniqueId !== targetNode.rowUniqueId)
        .map((currentNode) => ({
          ...currentNode,
          children: currentNode.children
            ? deleteNode(currentNode.children as ItemsTreeNode[], targetNode)
            : [],
        }));
    };
  
    this.commonMenuItemsTree = deleteNode(this.commonMenuItemsTree, nodeToDelete);
    this.initMenuItems();
    if (!this.menuItemsTree?.length) {
      this.selectedNode = null;
    }
  }

  deleteCategory(nodeToDelete: ItemsTreeNode) {
    const deleteNodeByName = (nodes: ItemsTreeNode[], targetNode: ItemsTreeNode): ItemsTreeNode[] => {
      return nodes
        .filter((currentNode) => currentNode.label !== targetNode.label)
        .map((currentNode) => ({
          ...currentNode,
          children: currentNode.children
            ? deleteNode(currentNode.children as ItemsTreeNode[], targetNode)
            : [],
        }));
    };

    const deleteNode = (nodes: ItemsTreeNode[], targetNode: ItemsTreeNode): ItemsTreeNode[] => {
      return nodes
        .filter((currentNode) => currentNode.rowUniqueId !== targetNode.rowUniqueId)
        .map((currentNode) => ({
          ...currentNode,
          children: currentNode.children
            ? deleteNode(currentNode.children as ItemsTreeNode[], targetNode)
            : [],
        }));
    };
  
    this.commonMenuItemsTree = deleteNodeByName(this.commonMenuItemsTree, nodeToDelete);
    this.categoriesTree = deleteNode(this.categoriesTree, nodeToDelete);
    this.refreshCategories();
    if (this.selectedCategory === nodeToDelete) {
      this.selectedCategory = null;
      this.menuItemsTree = [];
      this.menuItemsTree = [...this.menuItemsTree];
    }
  }

  update(): Observable<any> {
    this.loading = true;
    const list: ApplicationMenuItemDto[] = [];

    this.commonMenuItemsTree.forEach(node => {
        const addData = (currentNode: ItemsTreeNode) => {
            if (!currentNode.isDefault) {
              currentNode.data.menuType = this.menuType;
              list.push(currentNode.data);
            }
            currentNode.children?.forEach(child => addData(child as ItemsTreeNode));
        };
        addData(node);
    });
    return this.applicationMenuItemService
        .update(this.applicationId, list)
        .pipe(
            finalize(() => (this.loading = false)),
            tap(() => {
                this.loadApplicationMenuItems();
            })
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

  selectedPermissionHandler(event: any[]){
    if(event.length > 0){
      this.menuItemModel.requiredPolicy = event.map(permission => permission.name).join(',');
    }
    this.showPermissionDialog = false;
  }
}