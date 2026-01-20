import { IApplicationConfigurationManager } from '@eleon/angular-sdk.lib';
import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { LazyLoadEvent, MessageService } from 'primeng/api';
import { CheckPermission } from '@eleon/angular-sdk.lib';
import { finalize, first, forkJoin, map } from 'rxjs';
import { DataService } from '@eleon/primeng-ui.lib';
import { DynamicDialogConfig } from 'primeng/dynamicdialog'
import { CommonRoleDto, RoleQueryingService } from '@eleon/identity-querying.lib';
// import { PermissionsService } from '@eleon/tenant-management-proxy';


interface ExtendedRoleDto extends CommonRoleDto {
  isSelected: boolean;
}

@Component({
  standalone: false,
  selector: 'app-role-table-box',
  templateUrl: './role-table-box.component.html',
  styleUrls: ['./role-table-box.component.scss']
})
export class RoleSelectionBoxComponent implements OnInit, OnChanges {
  roles: ExtendedRoleDto[];
  totalRecords: number;
  loading: boolean;
  selectAll: boolean = false;
  filter: string;
  rows: number = 5;

  @Input()
  selectedRoles: CommonRoleDto[] = [];

	@Input()
	ignoredRoles: CommonRoleDto[] = [];

  @Input()
  isMultiple = false;
  @Output()
  selectEvent: EventEmitter<CommonRoleDto[]> = new EventEmitter<CommonRoleDto[]>();
  @Input()
  permissions: CheckPermission[];
  constructor(
    public roleService: RoleQueryingService,
    public messageService: MessageService,
    public configService: IApplicationConfigurationManager,
    // public permissionsService: PermissionsService,
    public localizationService: ILocalizationService,
    private dataService: DataService,
    private dynamicDialogConfig: DynamicDialogConfig
  ) {
    this.dataService.fieldToClear$.subscribe(value => {
      if(value){
        this.selectedRoles = [];
      }
    });

    if (this.dynamicDialogConfig){
      this.permissions = this.dynamicDialogConfig.data.permissions || [];
      this.ignoredRoles = this.dynamicDialogConfig.data.ignoredRoles || [];
      this.isMultiple = this.dynamicDialogConfig.data.isMultiple || false;
      this.selectedRoles = this.dynamicDialogConfig.data.selectedRoles || [];
      
      if (this.selectedRoles?.length && this.ignoredRoles?.length) {
        this.selectedRoles = this.filterIgnoredRoles(this.selectedRoles);
      }

      if (this.dynamicDialogConfig.data.onSelect && typeof this.dynamicDialogConfig.data.onSelect === 'function'){
        this.selectEvent.subscribe(this.dynamicDialogConfig.data.onSelect);
      }

      this.recalculateState();
    }
   }

  ngOnInit(): void {
    this.loading = true;
  }

	ngOnChanges(changes){
		if (changes['ignoredRoles']) {
      if (this.selectedRoles?.length && this.ignoredRoles?.length) {
        this.selectedRoles = this.filterIgnoredRoles(this.selectedRoles);
      }
      this.recalculateState();
		}
		if (changes['selectedRoles']) {
      if (this.selectedRoles?.length && this.ignoredRoles?.length) {
        this.selectedRoles = this.filterIgnoredRoles(this.selectedRoles);
      }
      this.recalculateState();
		}
	}

  recalculateState(){
    this.roles = this.roles?.filter(r => !this.isRoleIgnored(r)).map(r => {
				const extendedRole: ExtendedRoleDto = {
					...r,
					isSelected: false
				};
				// Check if role is in selectedRoles (but not if it's ignored)
				if (this.selectedRoles?.length) {
					const isSelected = !!this.selectedRoles.find(selected => selected.id === r.id || selected.name === r.name);
					const isIgnored = this.isRoleIgnored(r);
					extendedRole.isSelected = isSelected && !isIgnored;
				}
				return extendedRole;
			});
  }

  onLoadRoles(event: LazyLoadEvent) {
		this.loading = true;
    this.roleService.getList({
      maxResultCount: this.rows,
      skipCount: event.first,
      sorting: "1",
      filter: event.globalFilter
    })
		.pipe(finalize(() => this.loading = false))
		.subscribe(paged => {
      this.totalRecords = paged.totalCount;
      this.roles = paged.items.map(r => ({...r, isSelected: false}));
      this.recalculateState();
    })
  }

  selectRole(event: ExtendedRoleDto) {
    if (!event) {
      return;
    }

		if (this.isRoleIgnored(event)) {
			return;
		}

    if (!this.permissions?.length) {
      this.markRoleAsSelected(event);
      return;
    }
    // forkJoin(this.selectedRoles.map(selectedRole => 
    // this.permissionsService.get('R', selectedRole.name)
    //   .pipe(map(permissions => {
    //         const result = this.permissions.map(p => {
    //           return {
    //             name: p.permission,
    //             displayName: p.displayName,
    //             result: !!permissions.groups.find(g => this.recursivePermissionsFind(g, p.permission))
    //           };
    //         })
    //         const failed = result.filter(permission => !permission.result);
    //         if (!failed.length) {
    //           return true;
    //         }
    //         this.messageService.add(
    //           {
    //           summary: this.localizationService.instant('Permissions::Roles:SelectionError', failed.map(f=>
    //             this.localizationService.instant(f.displayName))
    //             .join(', ')),
    //           severity: 'error',
    //         });
    //         return false;
    //       }))))
    //       .pipe(first())
    //       .subscribe(result => {
    //         if (result) {
    //           this.markRoleAsSelected(event);
    //           return;
    //         }
    //       });

    // permissions temporarily disabled
    this.markRoleAsSelected(event);
  }

  private markRoleAsSelected(role: ExtendedRoleDto) {
    if (!this.selectedRoles) {
      this.selectedRoles = [];
    }
    
    // Prevent adding ignored roles
    if (this.isRoleIgnored(role)) {
      return;
    }
    
    if (this.isMultiple){
      if (!this.selectedRoles.find(r => r.id === role.id)) {
        this.selectedRoles.push(role);
        role.isSelected = true;
      }
      else{
        this.selectedRoles = this.selectedRoles.filter(r => r.id !== role.id);
        role.isSelected = false;
      }
    }
    else{
      this.selectedRoles = [role];
      this.roles.forEach(r => r.isSelected = false);
      role.isSelected = true;
      // Emit filtered roles (without ignored ones)
      this.selectEvent.emit(this.filterIgnoredRoles(this.selectedRoles));
    }
  }

  recursivePermissionsFind(node, name: string) {
    if (node.name == name && node.isGranted) {
      return true;
    }
    return node.permissions?.find(p => this.recursivePermissionsFind(p, name))
  }

  selectRoles(){
    // Filter out ignored roles before emitting
    const filteredRoles = this.filterIgnoredRoles(this.selectedRoles);
    this.selectEvent.emit(filteredRoles);
  }

  private isRoleIgnored(role: CommonRoleDto): boolean {
    if (!this.ignoredRoles?.length || !role) {
      return false;
    }
    return !!this.ignoredRoles.find(ignored => 
      (ignored.id && role.id && ignored.id === role.id) || 
      (ignored.name && role.name && ignored.name === role.name)
    );
  }

  private filterIgnoredRoles(roles: CommonRoleDto[]): CommonRoleDto[] {
    if (!roles?.length) {
      return [];
    }
    if (!this.ignoredRoles?.length) {
      return roles;
    }
    return roles.filter(role => !this.isRoleIgnored(role));
  }
}
