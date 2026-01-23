
import { CommonModule } from "@angular/common"
import { Component, OnInit } from '@angular/core'
import {
  CustomFeatureDto,
  CustomFeatureGroupDto,
  CustomFeaturesService,
} from '@eleon/tenant-management-proxy';
import { generateTempGuid, PipesModule, RequiredMarkModule, SharedModule } from '@eleon/angular-sdk.lib'
import { LocalizedConfirmationService, LocalizedMessageService } from '@eleon/primeng-ui.lib'
import {
  contributeControls,
  PageControls,
} from '@eleon/primeng-ui.lib'
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
import { TooltipModule } from "primeng/tooltip"
import { TreeModule, TreeNodeSelectEvent } from 'primeng/tree'
import { TreeTableModule } from 'primeng/treetable'
import { catchError, finalize, throwError } from 'rxjs'
import { FeatureGroupDto, } from '@eleon/angular-sdk.lib';

import { ILocalizationService } from '@eleon/angular-sdk.lib';
interface CustomGroup {
  data: CustomFeatureGroupDto;
  createCustomCategory: boolean;
  validators: {
    nameEmpty: boolean;
    categoryEmpty: boolean;
  };
}

interface CustomFeature {
  data: CustomFeatureDto;
  validators: {
    featureDisplayNameInvalid: boolean;
    featureNameInvalid: boolean;
    featureValueTypeNotSelected: boolean;
  };
}

@Component({
  selector: 'app-features-management-dashboard',
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
    ],
  templateUrl: './features-management-dashboard.component.html',
  styleUrls: ['./features-management-dashboard.component.css'],
})
export class FeaturesManagementDashboardComponent implements OnInit {
  // root state
  loading: boolean = true;
  selectedGroup: TreeNode;

  // static features data
  featuresGroupTree: TreeNode[] = [];
  featureTree: TreeNode[] = [];

  originalFeatureGroups: FeatureGroupDto[] = [];
  allFeatures: CustomFeatureDto[] = [];

  // dynamic data
  categories: TreeNode[] = [];
  categoryList: { value: string; name: string }[] = [];
  parentList: { value: string; name: string }[] = [];
  featureValueTypeList: {value: string; name: string; shortType: string }[] = [];

  // edit group
  group: CustomGroup;
  showGroupDialog: boolean = false;
  groupDialogTitle = '';
  isEditGroup = false;

  // edit feature
  feature: CustomFeature;
  showFeatureDialog: boolean = false;
  featureDialogTitle = '';
  isEditFeature = false;

  constructor(
    private confirmationService: LocalizedConfirmationService,
    private messageService: LocalizedMessageService,
    private localizationService: ILocalizationService,
    private customFeaturesService: CustomFeaturesService
  ) {}

  @PageControls() controls = contributeControls([
    {
      key: 'TenantManagement::Microservices:Update:Request',
      icon: 'pi pi-sync',
      severity: 'warning',
      show: () => true,
      loading: () => this.loading,
      disabled: () => this.loading,
      action: () => this.requestUpdateFeaturesAndPermissions(),
    },
    {
      key: 'TenantManagement::Feature:AddGroup',
      icon: 'pi pi-plus',
      severity: 'info',
      show: () => true,
      loading: () => this.loading,
      disabled: () => this.loading,
      action: () => this.addGroup(),
    },
    {
      key: 'TenantManagement::Feature:AddFeature',
      icon: 'pi pi-plus',
      severity: 'info',
      show: () => true,
      loading: () => this.loading,
      disabled: () => this.loading,
      action: () => this.addFeature(),
    },
  ]);

  ngOnInit(): void {
    this.reloadData();
  }

  requestUpdateFeaturesAndPermissions()
  {
    this.customFeaturesService.requestFeaturesPermissionsUpdate()
    .subscribe(res => {
      this.messageService.success("TenantManagement::Microservices:Update:Requested:Successfully")
    });
  }

  private reloadData(){
    this.loading = false;
    this.resetData();
    this.loadSupportedValueTypes();
    this.loadGroups();
    this.loadFeatures();
    this.loading = true;
  }

  private loadSupportedValueTypes(){
    this.customFeaturesService
      .getSupportedValueTypes()
      .subscribe((res) => {
        this.featureValueTypeList = Object.entries(res).map(([key, value]) => ({
          name: this.localizationService.instant(key),
          value: value,
          shortType: JSON.parse(value).Name ?? JSON.parse(value).name
        }));;
      });
  }

  private loadGroups(){
    this.customFeaturesService
    .getAllGroups()
    .subscribe((res) => {
      const DefaultCategory = this.localizationService.instant("TenantManagement::Feature:DefaultCategory")

      this.categoryList = res
          .map((group) => ({
            value: group.categoryName ?? '',
            name: group.categoryName?.length > 0 ? this.localizationService.instant(group.categoryName) : DefaultCategory
          }))
          .filter((category, index, self) =>
            index === self.findIndex((c) => c.value === category.value)
          );

      
      this.categories = this.categoryList.map((category) => {
        return {
          label: category.name,
          children: res.filter(g => category.name == DefaultCategory ? !(g.categoryName?.length > 0) : g.categoryName === category.name)
          .map((group) => {
            return {
              label: group.displayName,
              children: [],
              data: group,
              type: 'group',
              expanded: false,
            }
          }),
          type: 'category',
          expanded: true
        } satisfies TreeNode;

        
      })
    });
  }

  private loadFeatures(){
    this.customFeaturesService
      .getAllFeatures()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((res) => {
        this.allFeatures = res
      });
  }

  private resetData(){
    this.initGroup();
    this.allFeatures = [];
    this.categoryList = [];
    this.categories = [];
    this.featureTree = [];
  }
  onNewCategory(){
    this.group.data.categoryName = '';
  }
  addGroup() {
    this.initGroup();
    this.groupDialogTitle = this.localizationService.instant('TenantManagement::Feature:AddGroup:Title');
    this.showGroupDialog = true;
    this.isEditGroup = false;
  }

  editGroup(group: TreeNode) {
    this.initGroup();
    this.group.data = {
      categoryName: group.data.categoryName,
      name: group.data.name,
      id: group.data.id,
      displayName: group.data.displayName,
      isDynamic: true
    }
    this.groupDialogTitle = this.localizationService.instant('TenantManagement::Feature:EditGroup:Title', group.label);;
    this.showGroupDialog = true;
    this.isEditGroup = true;
  }

  initGroup() {
    this.group = {
      createCustomCategory: false,
      data: {
        name: '',
        displayName: '',
        id: generateTempGuid(),
        categoryName: '',
        isDynamic: true
      },
      validators: {
        nameEmpty: false,
        categoryEmpty: false,
      },
    };
  }

  saveGroup() {
    if (!this.validateGroup()) return;
    this.group.data.displayName = this.group.data.name;
    if (this.isEditGroup){
      this.loading = true;
      this.customFeaturesService.updateGroup(this.group.data)
        .pipe(
          finalize(() => (this.loading = false)),
          catchError((error) => {
            this.messageService.error('TenantManagement::Feature:GroupUpdate:Fail');
            return throwError(() => error);
          })
        )
        .subscribe({
          next: () => {
            this.messageService.success('TenantManagement::Feature:GroupUpdate:Success');
            this.reloadData();
            this.closeGroupDialog();
            this.initGroup();
          },
          error: () => {
          }
        });
    }else{
      this.loading = true;
      this.customFeaturesService.createGroup(this.group.data)
        .pipe(
          finalize(() => (this.loading = false)),
          catchError((error) => {
            this.messageService.error('TenantManagement::Feature:GroupCreated:Fail');
            return throwError(() => error);
          })
        )
        .subscribe({
          next: () => {
            this.messageService.success('TenantManagement::Feature:GroupCreated:Success');
            this.reloadData();
            this.closeGroupDialog();
            this.initGroup();
          },
          error: () => {
          }
        });
    }
  }

  closeGroupDialog() {
    this.showGroupDialog = false;
    this.isEditGroup = false;
  }

  resetGroupValidators() {
    this.group.validators.categoryEmpty = false;
    this.group.validators.nameEmpty = false;
  }

  validateGroup(){
    let isValid = true;
    if(!this.group?.data?.categoryName){
      isValid = false;
      this.group.validators.categoryEmpty = true;
      this.messageService.error('TenantManagement::Feature:Group:CategoryEmpty');
    } 
    if(!this.group?.data?.name){
      isValid = false;
      this.group.validators.nameEmpty = true;
      this.messageService.error('TenantManagement::Feature:Group:NameEmpty');
    }

    return isValid;
  }

  nodeSelect(event: TreeNodeSelectEvent) {
    if (!event?.node || event.node.type === "category") return;
    this.onChangeGroup(event.node);
  }

  onChangeGroup(group: TreeNode) {
    this.initFeaturesTreeTable(group);
    this.selectedGroup = group;
  }

  deleteGroup(group: TreeNode){
    this.confirmationService.confirm(
      "TenantManagement::Feature:Delete:Confirmation",
      () => {
        this.loading = true;
        this.customFeaturesService.deleteGroup(group.data.name)
        .pipe(
          finalize(() => this.loading = false),
          catchError((error) => {
            this.messageService.error('TenantManagement::Feature:GroupDeleted:Fail');
            return throwError(() => error);
          })
        )
        .subscribe(reply => {
          this.messageService.success('TenantManagement::Feature:GroupDeleted:Success');
          this.reloadData();
        });
      }
    );
  }

  // feature actions
  
  addFeature() {
    if(this.selectedGroup == null){
      this.messageService.error('TenantManagement::Feature:GroupNotSelected');
      return;
    }

    this.initFeature();
    this.featureDialogTitle = this.localizationService.instant('TenantManagement::Feature:AddFeature:Title', this.selectedGroup.data.categoryName, this.selectedGroup.data.name);
    this.showFeatureDialog = true;
  }

  initFeature(){
    this.parentList = this.allFeatures
    .filter((f) => f.groupName === this.selectedGroup.data.name)
    .map((f) => {
      return {
        value: f.name,
        name: f.displayName
      }
    })
    this.parentList.unshift({value: null, name: this.localizationService.instant('TenantManagement::Feature:DefaultParentName') });

    this.feature = {
      data: {
        displayName: '',
        groupName: '',
        id: generateTempGuid(),
        name: '',
        parentName: null,
        description: '',
        defaultValue: '',
        isVisibleToClients: false,
        isAvailableToHost: true,
        allowedProviders: '',
        valueType: this.featureValueTypeList.length > 0 ? this.featureValueTypeList[0].value : null,
        isDynamic: true
      },
      validators: {
        featureDisplayNameInvalid: false,
        featureNameInvalid: false,
        featureValueTypeNotSelected: false
      }
    };
  }

  getAllChildrenNames(parentName: string): string[] {
    const children = this.allFeatures.filter((f) => f.parentName === parentName);
    let childrenNames = children.map((child) => child.name);

    for (const child of children) {
        childrenNames = childrenNames.concat(this.getAllChildrenNames(child.name));
    }

    return childrenNames;
  }

  editFeature(feature: TreeNode) {
    this.initFeature();
    this.parentList = this.parentList.filter((f) => f.value !== feature.data.name); // remove self from the list

    // remove children from the list
    const childrenNames = this.getAllChildrenNames(feature.data.name);
    this.parentList = this.parentList.filter((f) => !childrenNames.includes(f.value)); 

    this.feature.data = {...feature.data};
    this.groupDialogTitle = this.localizationService.instant('TenantManagement::Feature:EditFeature:Title', feature.label);;

    this.isEditFeature = true;
    this.showFeatureDialog = true;
  }
  deleteFeature(feature: TreeNode) {
    this.confirmationService.confirm(
      "TenantManagement::Feature:Delete:Confirmation",
      () => {
        this.loading = true;
        this.customFeaturesService.deleteFeature(feature.data.name)
        .pipe(
          finalize(() => this.loading = false),
          catchError((error) => {
            this.messageService.error('TenantManagement::Feature:FeatureDeleted:Fail');
            return throwError(() => error);
          })
        )
        .subscribe(reply => {
          this.messageService.success('TenantManagement::Feature:FeatureDeleted:Success');
          this.allFeatures = [...this.allFeatures.filter((f) => f.name !== feature.data.name)];
          this.initFeaturesTreeTable(this.selectedGroup);
        });
      }
    );
  }
  closeFeatureDialog(){
    this.showFeatureDialog = false;
    this.isEditFeature = false;
  }
  saveFeature(){
    if (!this.validateFeature()) return;
    this.feature.data.groupName = this.selectedGroup.data.name;
    
    if(!this.isEditFeature){
      this.loading = true;
      this.customFeaturesService.createFeature(this.feature.data)
        .pipe(
          finalize(() => (this.loading = false)),
          catchError((error) => {
            this.messageService.error('TenantManagement::Feature:FeatureCreated:Fail');
            return throwError(() => error);
          })
        )
        .subscribe((reply: CustomFeatureDto)=>{
          this.allFeatures = [...this.allFeatures, reply];
          this.initFeaturesTreeTable(this.selectedGroup);
          this.messageService.success('TenantManagement::Feature:FeatureCreated:Success');
          this.closeFeatureDialog();
        });
    }
    else{
      this.loading = true;
      this.customFeaturesService.updateFeature(this.feature.data)
        .pipe(
          finalize(() => (this.loading = false)),
          catchError((error) => {
            this.messageService.error('TenantManagement::Feature:FeatureUpdate:Fail');
            return throwError(() => error);
          })
        )
        .subscribe((reply: CustomFeatureDto)=>{
          this.allFeatures = [...this.allFeatures.filter((f) => f.id !== this.feature.data.id), reply];
          this.initFeaturesTreeTable(this.selectedGroup);
          this.messageService.success('TenantManagement::Feature:FeatureUpdate:Success');
          this.closeFeatureDialog();
        });
    }
  }
  resetFeatureValidators() {
    this.feature.validators.featureDisplayNameInvalid = false;
    this.feature.validators.featureNameInvalid = false;
    this.feature.validators.featureValueTypeNotSelected = false;
  }
  validateFeature(){
    let isValid = true;
    if(!this.feature?.data?.name){
      isValid = false;
      this.feature.validators.featureNameInvalid = true;
      this.messageService.error('TenantManagement::Feature:Feature:NameEmpty');
    } 
    if(!this.feature?.data?.displayName){
      isValid = false;
      this.feature.validators.featureDisplayNameInvalid = true;
      this.messageService.error('TenantManagement::Feature:Feature:DisplayNameEmpty');
    }
    if(!this.feature?.data?.valueType){
      isValid = false;
      this.feature.validators.featureValueTypeNotSelected = true;
      this.messageService.error('TenantManagement::Feature:Feature:ValueTypeNotSelected');
    }

    return isValid;
  }

  featuresDialogVisibleChange(isVisible: boolean) {
    if (!isVisible) {
      this.showFeatureDialog = false;
    }
  }
  
  private initFeaturesTreeTable(currentGroup: TreeNode) {
    this.featureTree = [];
    let nodes: TreeNode[] = this.getListOfTreeNodes(currentGroup.data.name);

    this.featureTree = nodes;
  }

  private getListOfTreeNodes(groupName: string, parentName: string | null = null) : TreeNode[] {
    return this.allFeatures
      .filter((feature: any) => feature.groupName === groupName)
      .filter((feature: any) => feature.parentName === parentName)
      .map((feature) => {
        return {
          label: feature.displayName,
          data: feature,
          children: this.getListOfTreeNodes(groupName, feature.name),
          expanded: true
        };
      });
  }

  getValueTypeName(type: string){
    const t = JSON.parse(type)
    const shortType = t.Name ?? t.name;
    const result = this.featureValueTypeList.find(t => t.shortType === shortType);
    return result ? result.name : type;
  }
}
