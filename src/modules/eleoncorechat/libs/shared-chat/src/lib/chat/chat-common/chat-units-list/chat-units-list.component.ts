import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from "@angular/core";
import { IIdentitySelectionDialogService, ILocalizationService } from '@eleon/contracts.lib'
import { CommonOrganizationUnitDto } from '@eleon/tenant-management-proxy';
import { Observable, of } from 'rxjs'

@Component({
  standalone: false,
  selector: "app-chat-units-list",
  templateUrl: "./chat-units-list.component.html",
  styleUrls: ["./chat-units-list.component.scss"],
})
export class ChatUnitsListComponent implements OnChanges {
  pageSize: number = 5;
  filtered: CommonOrganizationUnitDto[] = [];
  showUnitsDialog = false;

  public searchQuery: string = "";

  public get searching(): boolean {
    return this.searchQuery?.trim()?.length > 0;
  }

  @Input()
  units: CommonOrganizationUnitDto[];

  @Output()
  unitsChange = new EventEmitter<CommonOrganizationUnitDto[]>();

  @Input()
  loading: boolean = false;

  @Input()
  showSearch: boolean = false;

  @Input()
  allowEdit: boolean = false;

  @Output()
  visibilityChange = new EventEmitter<boolean>();

  constructor(
    private orgUnitService: IIdentitySelectionDialogService,
    private localizationService: ILocalizationService) {
    
    
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['units']) {
      this.selectedUnits = of(this.units || []);
      this.searchQuery = "";
      this.search();
    }
  }

  public search(): void {
    if (this.searching) {
      this.filtered = this.units.filter((m) =>
        m.displayName.toLowerCase().includes(this.searchQuery?.trim().toLowerCase())
      );
    } else {
      this.filtered = this.units;
    }
  }

  onUnitsSelected(units: CommonOrganizationUnitDto[]) {
    this.units = units;
    this.unitsChange.emit(this.units);
    this.search();
  }

  onRemove(unitId: string){
    this.units = this.units.filter(u => u.id !== unitId);
    this.unitsChange.emit(this.units);
  }

  selectedUnits: Observable<CommonOrganizationUnitDto[]> = of([]);

  openUnitsSelectionDialog(){
    this.showUnitsDialog = true;
    this.visibilityChange.emit(true);
    
    this.orgUnitService.openOrganizationUnitSelectionDialog({
      title: this.localizationService.instant('Collaboration::UnitSelection:Dialog:Title'),
      onlyUsers: true,
      defaultSelectedOrganizationUnits: this.selectedUnits,
      
      onSelect: (units) => {
        this.onUnitsSelected(units.selectedOrgUnits);
        this.visibilityChange.emit(false);
        this.showUnitsDialog = false;
      }
    })
  }
}
