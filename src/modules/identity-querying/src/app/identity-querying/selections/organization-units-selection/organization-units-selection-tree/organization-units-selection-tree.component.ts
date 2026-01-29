import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { Component, EventEmitter, Input, OnInit, Optional, Output } from "@angular/core";
import { MessageService, TreeNode } from "primeng/api";
import { Observable, first, forkJoin, map, of } from "rxjs";
import { OrganizationUnitSelectionEvent } from "./organization-unit-selection-event";
import { DynamicDialogConfig } from 'primeng/dynamicdialog'
import { CommonOrganizationUnitDto, OrganizationUnitQueryingService } from '@eleon/identity-querying.lib';

export interface JoinedOrganizationUnitDto extends CommonOrganizationUnitDto {
  children: JoinedOrganizationUnitDto[];
  label: string;
  expanded: boolean;
  key: string;
}

export type OrganizationTreeNode = TreeNode<CommonOrganizationUnitDto>;

@Component({
  standalone: false,
  selector: "app-organization-units-selection-tree",
  templateUrl: "./organization-units-selection-tree.component.html",
  styleUrls: ["./organization-units-selection-tree.component.scss"],
})
export class OrganizationUnitsSelectionTreeComponent implements OnInit {
  allOrganizationUnits: OrganizationTreeNode[];
  organizationUnits: OrganizationTreeNode[];
  organizationUnitsTree: OrganizationTreeNode[];
  organizationUnitsTreeFiltered: OrganizationTreeNode[];
  selectedOrganizationUnits: OrganizationTreeNode[] = [];
  originalOrganizationUnitsTree: OrganizationTreeNode[] = [];
  localLoading: boolean = false;

  displayCreate: boolean = false;
  selectedForOperation: CommonOrganizationUnitDto;
  searchQueryText?: string = "";
  isOnlySelected: boolean = false;

  @Input()
  showStatus = false;

  @Input()
  selectionMode: "single" | "multiple" | "checkbox" = "checkbox";

  @Input()
  loading: boolean = false;

  @Input()
  anySelected: boolean = false;

  @Input()
  anyName: string = "Any";

  @Input()
  maxHeight: string = "30rem";

  @Input()
  inlineCreation: boolean = false;

  @Input()
  isAnySelectionAvailable: boolean = true;
  @Input()
  defaultSelectedOrganizationUnits: Observable<CommonOrganizationUnitDto[]>;

  @Input()
  filterOrganizationUnitIds$?: Observable<string[]>;

  @Input()
  blocklist: string[] = [];

  @Input()
  onlyUsers: boolean = true;

  @Input()
  isFlat: boolean = false;

  @Input()
  isMove: boolean = false;

  @Input()
  isManage: boolean = false;
  
  @Input()
  disableCheckBoxSelection: boolean = false;

  @Input()
  isOnlySingleSelectionMode: boolean = false;

  @Input()
  getWithUsers: boolean = false;

  @Input()
  isShowSearch: boolean = false;

  @Input()
  getForUserId: string = null;

  @Input()
  companyFilter: string = null;

  @Input()
  selectedOrgUnit: CommonOrganizationUnitDto; 

  isInitialization: boolean = true;

  showSelectButton: boolean = false;

  @Output()
  selectionEvent: EventEmitter<OrganizationUnitSelectionEvent> =
    new EventEmitter<OrganizationUnitSelectionEvent>();

  constructor(
    public organizationUnitService: OrganizationUnitQueryingService,
    public localizationService: ILocalizationService,
    public localizedMessageService: MessageService,
    @Optional() private dialogConfig: DynamicDialogConfig
  ) {

    if (this.dialogConfig){
      this.onlyUsers = this.dialogConfig.data.onlyUsers || true;
      this.isFlat = this.dialogConfig.data.isFlat || false;
      this.getWithUsers = this.dialogConfig.data.getWithUsers || false;
      this.getForUserId = this.dialogConfig.data.getForUserId || null;
      this.companyFilter = this.dialogConfig.data.companyFilter || null;
      this.defaultSelectedOrganizationUnits = this.dialogConfig.data.defaultSelectedOrganizationUnits || null;
      this.isMove = this.dialogConfig.data.isMove || false;
      this.isManage = this.dialogConfig.data.isManage || false;
      this.blocklist = this.dialogConfig.data.blocklist || [];
      this.isOnlySingleSelectionMode = this.dialogConfig.data.isOnlySingleSelectionMode || false;
      this.isShowSearch = this.dialogConfig.data.isShowSearch || false;
      this.selectedOrgUnit = this.dialogConfig.data.selectedOrgUnit || null;
      this.selectionMode = this.dialogConfig.data.selectionMode || 'checkbox';
      this.disableCheckBoxSelection = this.dialogConfig.data.disableCheckBoxSelection || false;
      this.maxHeight = this.dialogConfig.data.maxHeight || "30rem";

      if (this.dialogConfig.data.onSelect && typeof this.dialogConfig.data.onSelect === 'function'){
        this.selectionEvent.subscribe(this.dialogConfig.data.onSelect);
      }

      this.showSelectButton = this.selectionMode !== 'single';
    }
  }

  ngOnInit(): void {
    this.localLoading = true;

    this.loadStructure();
  }

  ngOnChanges(): void {
    if(!this.isInitialization){
      this.loadStructure();
      if (this.allOrganizationUnits) {
        this.loadDefaults();
      }
    }
  }

  loadStructure() {
    const filterObservable = this.filterOrganizationUnitIds$ || of(undefined);
    forkJoin({
      items: this.onlyUsers
        ? this.organizationUnitService
            .getAvailableForUser({
              userId: this.getForUserId,
            })
            .pipe(
              map(res => res.map(x => x.organizationUnit)),
              first()
            )
        : this.organizationUnitService.getList(),
      filters: filterObservable,
    }).subscribe(({ items, filters }) => {
      let filteredItems = items
        .filter((unit) => !filters || filters.includes(unit.id))
        //.filter((unit) => !this.blocklist.includes(unit.id));
      if (!!this.companyFilter) {
        filteredItems = filteredItems.filter((unit) =>
          this.isInSameCompany(this.companyFilter, unit, filteredItems)
        );
      }

      this.allOrganizationUnits = filteredItems.map((item) =>
        this.joinTreeChildren(item, filteredItems, filters)
      );

      let min = Math.min(
        ...this.allOrganizationUnits.map((o) => o.data.code.split(".").length)
      );

      this.organizationUnits = this.allOrganizationUnits.filter(
        (item) => this.isFlat || item.data.code.split(".").length == min
      );
      this.loadDefaults();
      this.isInitialization = false;
    });
  }

  close() {
    this.displayCreate = false;
  }

  create() {
    this.displayCreate = false;
    this.loadStructure();
  }

  loadDefaults() {
    if (this.isAnySelectionAvailable) {
      this.organizationUnitsTree = [
        {
          label: this.anyName,
          key: "ALL",
          expanded: false,
          leaf: true,
        },
        ...(this.anySelected ? [] : this.organizationUnits),
      ];
    } else {
      this.organizationUnitsTree = this.organizationUnits;
    }

    this.filter();

    if (this.isAnySelectionAvailable && this.anySelected) {
      this.selectedOrganizationUnits = this.organizationUnitsTree;
      this.localLoading = false;
      return;
    }
    if (!this.defaultSelectedOrganizationUnits) {
      this.localLoading = false;
      return;
    }

    this.defaultSelectedOrganizationUnits.subscribe((checked) => {
      this.selectedOrganizationUnits = checked.map((selected) =>
        this.allOrganizationUnits.find((ou) => selected.code == ou.data.code)
      );
      this.localLoading = false;
    });
  }

  joinTreeChildren(
    currentUnit: CommonOrganizationUnitDto,
    units: CommonOrganizationUnitDto[],
    filters?: string[]
  ) {
    const newCurrentUnit: OrganizationTreeNode = {
      data: currentUnit,
      children: units
        .filter((unit) => this.isChild(currentUnit, unit))
        .filter((unit) => !filters || filters.includes(unit.id))
        .map((unit) => this.joinTreeChildren(unit, units)),
      label: currentUnit.displayName,
      key: currentUnit.code,
      expanded: true,
    };
    return newCurrentUnit;
  }

  isChild(parent: CommonOrganizationUnitDto, child: CommonOrganizationUnitDto) {
    const parentCodes = parent.code.split(".");
    const childCodes = child.code.split(".");
    return (
      parentCodes.length == childCodes.length - 1 &&
      childCodes.slice(0, parentCodes.length).join(".") == parentCodes.join(".")
    );
  }

  isDescendantOf(
    parent: CommonOrganizationUnitDto,
    child: CommonOrganizationUnitDto
  ) {
    if (parent.code === child.code) {
      return true;
    }

    const parentCodes = parent.code.split(".");
    const childCodes = child.code.split(".");
    return (
      parentCodes.length < childCodes.length &&
      childCodes.slice(0, parentCodes.length).join(".") == parentCodes.join(".")
    );
  }

  isInSameCompany(
    sampleOrgId: string,
    unit: CommonOrganizationUnitDto,
    units: CommonOrganizationUnitDto[]
  ): boolean {
    const org = units.find((x) => x.id === sampleOrgId);
    if (!org) {
      return false;
    }

    const sampleRoot = units.find((u) => this.isDescendantOf(u, org));
    if (!sampleRoot) {
      return false;
    }

    return this.isDescendantOf(sampleRoot, unit);
  }

  nodeSelect({ node }, isSelected) {
    if (node.key == "ALL") {
      this.localLoading = true;
      this.selectionEvent.emit(
        new OrganizationUnitSelectionEvent(
          true,
          null,
          isSelected,
          false,
          this.selectedOrganizationUnits.map((x) => x.data)
        )
      );
      return;
    }
    if(this.showCloseIcon(node)) return;
    this.selectionEvent.emit(
      new OrganizationUnitSelectionEvent(
        false,
        node.data,
        isSelected,
        false,
        this.selectedOrganizationUnits.map((x) => x.data)
      )
    );
  }

  isRowSelected(rowNode: any): boolean {
    const key = rowNode.node.key;
    return this.selectedOrganizationUnits.some((n) => n.key === key);
  }

  toggleRowSelection(rowNode: any): void {
    if(this.disableCheckBoxSelection) return;
    if (this.isRowSelected(rowNode)) {
      this.selectedOrganizationUnits.splice(
        this.selectedOrganizationUnits.findIndex(
          (n) => n.key === rowNode.node.key
        ),
        1
      );
    } else {
      this.selectedOrganizationUnits.push(rowNode.node);
    }
    this.selectedOrganizationUnits = [...this.selectedOrganizationUnits];

    // this.nodeSelect(rowNode, this.isRowSelected(rowNode));
  }

  filter() {
    this.organizationUnitsTreeFiltered = JSON.parse(JSON.stringify(this.organizationUnitsTree));
    const filterNodes = (node, searchText) => {
      if (!node.children) {
        return node.data?.displayName
          ?.toLowerCase()
          ?.includes(searchText.toLowerCase());
      }

      node.children = node.children.filter((child) =>
        filterNodes(child, searchText)
      );
      return (
        node.data?.displayName
          ?.toLowerCase()
          ?.includes(searchText.toLowerCase()) || node.children.length > 0
      );
    };

    this.organizationUnitsTreeFiltered =
      this.organizationUnitsTreeFiltered.filter((node) =>
        filterNodes(node, this.searchQueryText)
      );

    if (this.isOnlySelected) {
      this.organizationUnitsTreeFiltered =
        this.organizationUnitsTreeFiltered.filter((parent) => {
          return this.isRowSelectedForCheckBox(parent);
        });

      let filterSelectedChildren = (parent) => {
        if (parent.children && parent.children.length > 0) {
          parent.children = parent.children.filter((child) =>
            this.isRowSelectedForCheckBox(child)
          );
          parent.children.forEach((child) => filterSelectedChildren(child));
        }
      };

      this.organizationUnitsTreeFiltered.forEach((parent) => {
        filterSelectedChildren(parent);
      });
    }

    if (this.organizationUnitsTreeFiltered.length <= 0 && this.organizationUnitsTree.length > 1 ) {
      this.localizedMessageService.add({
        severity: 'warn',
        summary: this.localizationService.instant("Infrastructure::NoSelectedResultFound")
      }
      );
    }
  }

  isRowSelectedForCheckBox(rowNode: any): boolean {
    const key = rowNode.key;
    const isSelected = this.selectedOrganizationUnits.some(
      (n) => n.key === key
    );

    if (
      isSelected ||
      (rowNode.children &&
        rowNode.children.some((child) => this.isRowSelectedForCheckBox(child)))
    ) {
      return true;
    }

    return false;
  }

  showCloseIcon(unit: OrganizationTreeNode): boolean{
    if(!this.isMove) return false;

    if(this.isMove && !!unit){
      if(this.blocklist.includes(unit?.data?.id)){
        return true;
      }
      if(unit?.data?.code?.startsWith(this.selectedOrgUnit.code) || unit?.data?.code === this.selectedOrgUnit.code){
        return true;
      }
    }
    return false;
  }

  select(){
    this.selectionEvent.emit(
      new OrganizationUnitSelectionEvent(
        false,
        null,
        false,
        true,
        this.selectedOrganizationUnits.map((x) => x.data),
        true
      )
    );
  }
}
