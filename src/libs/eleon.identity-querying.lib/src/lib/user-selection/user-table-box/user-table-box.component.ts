import { Component, EventEmitter, Input, OnChanges, OnInit, Optional, Output, SimpleChanges } from '@angular/core';
import { IApplicationConfigurationManager } from '@eleon/angular-sdk.lib';
import { LazyLoadEvent, MessageService } from 'primeng/api';
import { first, forkJoin, map } from 'rxjs';
// import { PermissionsService } from '@eleon/tenant-management-proxy';
import { DataService } from '@eleon/primeng-ui.lib';
import { CheckPermission } from '@eleon/angular-sdk.lib';
import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { DynamicDialogConfig } from 'primeng/dynamicdialog'
import { CommonOrganizationUnitDto, CommonUserDto, UserQueryingService } from '../../proxy';

@Component({
  standalone: false,
  selector: 'app-user-table-box',
  templateUrl: './user-table-box.component.html',
  styleUrls: ['./user-table-box.component.scss']
})
export class UserSelectionBoxComponent implements OnInit, OnChanges {
  users: CommonUserDto[];
  totalRecords: number;
  loading: boolean;
  selectAll: boolean = false;
  filter: string;
  rows: number = 5;
  selectedUsers: CommonUserDto[] = [];

	lastLoadEvent: LazyLoadEvent | null;

  @Input()
  isMultiple: boolean = false;

  @Input()
  filterUsersByPermissions: boolean = false;
  @Output()
  selectEvent: EventEmitter<CommonUserDto[]> = new EventEmitter<CommonUserDto[]>();
  @Input()
  permissions: CheckPermission[] = [];
  @Input()
  currentSelectionMode: string = 'multiple';

	@Input()
	ignoredUsers: CommonUserDto[] = [];

  constructor(
    public userService: UserQueryingService,
    public messageService: MessageService,
    public configService: IApplicationConfigurationManager,
    // public permissionsService: PermissionsService,
    public localizationService: ILocalizationService,
    private dataService: DataService,
    @Optional() private dialogConfig: DynamicDialogConfig
  ) { 
    this.dataService.fieldToClear$.subscribe(value => {
      if(value){
        this.selectedUsers = [];
      }
    });

    if (this.dialogConfig){
      this.permissions = this.dialogConfig.data.permissions || [];
      this.filterUsersByPermissions = this.permissions?.length > 0;
      this.ignoredUsers = this.dialogConfig.data.ignoredUsers || [];
      this.isMultiple = this.dialogConfig.data.isMultiple || false;
      this.currentSelectionMode = this.isMultiple ? 'multiple' : 'single';
      this.selectedUsers = this.dialogConfig.data.selectedUsers || [];

      if (this.dialogConfig.data.onSelect && typeof this.dialogConfig.data.onSelect === 'function'){
        this.selectEvent.subscribe(this.dialogConfig.data.onSelect);
      }
    }
  }
	ngOnChanges(changes: SimpleChanges): void {
		if (changes['ignoredUsers']) {
			this.onLoadUsers(this.lastLoadEvent)
		}
	}

  ngOnInit(): void {
    this.loading = true;
  }

  onLoadUsers(event: LazyLoadEvent) {
		this.lastLoadEvent = event;

    this.userService.getList({
      maxResultCount: this.rows,
      skipCount: event?.first,
      sorting: "1",
      filter: event?.globalFilter,
      permissions: this.filterUsersByPermissions ? this.permissions.map(p => p.permission).join(',') : null,
      ignoredUsers: this.ignoredUsers.map(u => u.id),
			ignoreCurrentUser: false,
    }).subscribe(paged => {
      // TODO: serverside filter
      this.totalRecords = paged.totalCount;
      this.users = paged.items;
      this.loading = false;
    })
  }

  selectUsers(event: CommonUserDto[]) {
    if (!event) {
      return;
    }

    if (!Array.isArray(this.selectedUsers)) {
      this.selectedUsers = [this.selectedUsers];
    }

    if (!this.permissions?.length || this.filterUsersByPermissions) {
      this.selectEvent.emit(this.selectedUsers);
      return;
    }

    // forkJoin( this.selectedUsers.map(selectedUser => {
    //   return this.permissionsService.get('U', selectedUser.id)
    //   .pipe(first(),
    //   map(permissions => {
    //     const result = this.permissions.map(p => {
    //       return {
    //         name: p.permission,
    //         displayName: p.displayName,
    //         result: !!permissions.groups.find(g => this.recursivePermissionsFind(g, p.permission))
    //       };
    //     })
    //     const failed = result.filter(permission => !permission.result);
    //     if (failed.length) {
    //       this.messageService.add({
    //         severity: "error",
    //         summary: this.localizationService.instant('Permissions::Users:SelectionError:Details'),
    //       });
    //       return false;
    //     }
    //     return true
    //   }))
    // })).subscribe(result => {
    //   if (result) {
    //     this.selectEvent.emit(this.selectedUsers);
    //   }
    // })

    // permissions temporarily disabled
    this.selectEvent.emit(this.selectedUsers);
  }
  recursivePermissionsFind(node, name: string) {
    if (node.name == name && node.isGranted) {
      return true;
    }
    return node.permissions?.find(p => this.recursivePermissionsFind(p, name))
  }

  getOrganizationUnitsDisplayNames(organizationUnits: CommonOrganizationUnitDto[]): string {
    return organizationUnits?.map(unit => unit?.displayName)?.join(', ');
  }

  getFullName(row: CommonUserDto){
    return row?.name + ' ' + row?.surname
  }
}
