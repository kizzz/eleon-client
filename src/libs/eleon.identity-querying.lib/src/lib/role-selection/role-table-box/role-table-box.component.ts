import { IApplicationConfigurationManager } from '@eleon/angular-sdk.lib';
import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { LazyLoadEvent, MessageService } from 'primeng/api';
import { CheckPermission } from '@eleon/angular-sdk.lib';
import { finalize, first, forkJoin, map } from 'rxjs';
import { DataService } from '@eleon/primeng-ui.lib';
import { DynamicDialogConfig } from 'primeng/dynamicdialog'
import { CommonRoleDto, RoleQueryingService } from '../../proxy';
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
		if (changes['ignoredRoles'] || changes['selectedRoles']) {
      this.recalculateState();
		}
	}

  recalculateState(){
    this.roles = this.roles?.map(r => {
				const extendedRole: ExtendedRoleDto = {
					...r,
					isSelected: false
				};
				if (this.ignoredRoles?.length) {
					extendedRole.isSelected = !!this.ignoredRoles.find(ignored => ignored.id === r.id || ignored.name === r.name);
				}
				if (this.selectedRoles?.length) {
					extendedRole.isSelected = !!this.selectedRoles.find(selected => selected.id === r.id || selected.name === r.name);
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

		if (this.ignoredRoles && this.ignoredRoles.find(role => role.id === event.id)) {
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
      this.selectEvent.emit(this.selectedRoles);
      role.isSelected = true;
    }
  }

  recursivePermissionsFind(node, name: string) {
    if (node.name == name && node.isGranted) {
      return true;
    }
    return node.permissions?.find(p => this.recursivePermissionsFind(p, name))
  }

  selectRoles(){
    this.selectEvent.emit(this.selectedRoles);
  }
}
