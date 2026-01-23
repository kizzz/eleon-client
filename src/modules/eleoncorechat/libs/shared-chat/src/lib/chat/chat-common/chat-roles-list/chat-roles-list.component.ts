import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from "@angular/core";
import { IIdentitySelectionDialogService, ILocalizationService } from '@eleon/angular-sdk.lib'
import { CommonRoleDto } from '@eleon/angular-sdk.lib';

@Component({
  standalone: false,
  selector: "app-chat-roles-list",
  templateUrl: "./chat-roles-list.component.html",
  styleUrls: ["./chat-roles-list.component.scss"],
})
export class ChatRolesListComponent implements OnChanges {
  pageSize: number = 5;
  filtered: CommonRoleDto[] = [];

  public searchQuery: string = "";

  public get searching(): boolean {
    return this.searchQuery?.trim()?.length > 0;
  }

  @Input()
  roles: CommonRoleDto[];

  @Output()
  rolesChange = new EventEmitter<CommonRoleDto[]>();

  @Input()
  loading: boolean = false;

  @Input()
  allowEdit: boolean = false;

  @Output()
  visibilityChange = new EventEmitter<boolean>();


  constructor(
    private roleService: IIdentitySelectionDialogService,
    private localizationService: ILocalizationService
  ) {

  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['roles']) {
      this.searchQuery = "";
      this.search();
    }
  }

  public search(): void {
    if (this.searching) {
      this.filtered = this.roles.filter((m) =>
        m.name.toLowerCase().includes(this.searchQuery?.trim().toLowerCase())
      );
    } else {
      this.filtered = this.roles;
    }
  }

  onRolesSelected(roles: CommonRoleDto[]) {
    this.roles = [...roles];
    this.rolesChange.emit(this.roles);
    this.search();
  }

  onRoleRemoved(roleId: string){
    this.roles = this.roles.filter(r => r.id !== roleId);
    this.rolesChange.emit(this.roles);
  }

  openRolesDialog(){
    this.visibilityChange.emit(true);
    this.roleService.openRoleSelectionDialog({
      title: this.localizationService.instant('Collaboration::RoleSelection:Dialog:Title'),
      permissions: [],
      selectedRoles: this.roles,
      ignoredRoles: [],
      isMultiple: true,
      onSelect: (roles) => {
        this.onRolesSelected(roles as any);
        this.visibilityChange.emit(false);
      }
    });
  }
}
