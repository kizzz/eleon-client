import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Data, Router } from '@angular/router';
import { FileArchiveDto } from '@eleon/file-manager-proxy';
import { LazyLoadEvent, SortEvent } from 'primeng/api';
import { viewportBreakpoints } from '@eleon/angular-sdk.lib';
import { first } from 'rxjs';
import { FileArchiveService } from '@eleon/file-manager-proxy';
import { LocalizedMessageService } from '@eleon/primeng-ui.lib';
import { Table } from 'primeng/table';
import { PageStateService } from '@eleon/primeng-ui.lib';
import { LocalizedConfirmationService } from '@eleon/primeng-ui.lib';
import { FileArchiveHierarchyType } from '@eleon/file-manager-proxy';
import { LocalizedOptionService } from '@eleon/primeng-ui.lib';
import { StorageProviderDto } from '@eleon/angular-sdk.lib';
import { PermissionManagementComponent } from '../../../shared/permission-management/permission-management.component';
import { DialogHeaderService } from '../../../shared/file-dynamic-dialog-header-service';
import { PageControls, contributeControls, PAGE_CONTROLS } from '@eleon/primeng-ui.lib';
import { FileDynamicDialogHeaderComponent } from '../../../file-manager-explorer/file-dynamic-dialog-header/file-dynamic-dialog-header.component';
import { DialogService } from 'primeng/dynamicdialog';

interface RowValidators {
  name: boolean;
  hierarchyType: boolean;
  provider: boolean;
}

interface FileArchiveTableRow {
  data: FileArchiveDto;
  validators: RowValidators;
  displayEdit: boolean;
}

type DashboardMode = 'mydrives' | 'drives';

@Component({
  standalone: false,
  selector: 'app-file-archives-dashboard',
  templateUrl: './file-archives-dashboard.component.html',
  styleUrls: ['./file-archives-dashboard.component.scss']
})
export class FileArchivesDashboardComponent implements OnInit {
  @ViewChild('archivesTable')
  rowsTableRef: Table;

  rowsCount: number = 10;
  totalRecords: number = 0;
  rows: FileArchiveTableRow[] = [];
  loading: boolean = false;
  lastLoadEvent: LazyLoadEvent | null;
  searchQueryText: string;
  searchQuery: string;
  editingRow: FileArchiveTableRow;
  editingRowBackup: FileArchiveTableRow;
  viewportBreakpoints = viewportBreakpoints;
  selectedRow: FileArchiveTableRow;
  selectedArchiveDto: FileArchiveDto;
  createDialogVisible: boolean = false;
  dialogArchive: FileArchiveDto | null = null;
  dashboardMode: DashboardMode = 'mydrives';

  @PageControls()
  controls = contributeControls([
    PAGE_CONTROLS.RELOAD({
      excludeFromBars: true,
      action: () => this.reloadFileArchives(),
    }),
    PAGE_CONTROLS.CREATE({
      excludeFromBars: true,
      show: () => this.isDrivesMode,
      action: () => this.createFileArchive(),
    }),
  ]);
  
  constructor(
    public fileArchiveService: FileArchiveService,
    public localizationService: ILocalizationService,
    public msgService: LocalizedMessageService,
    public dynamicDialogService: DialogService,
    public confirmationService: LocalizedConfirmationService,
    public router: Router,
    public state: PageStateService,
    public optionService: LocalizedOptionService,
    private dialogHeaderService: DialogHeaderService,
    private route: ActivatedRoute
  ) {
    
   }

  ngOnInit(): void {
    this.resetSelectedRowVar();
    this.route.data.subscribe(data => this.setDashboardMode(data));
  }

  resetSelectedRowVar(){
    this.selectedRow = {} as FileArchiveTableRow;
    this.selectedRow.displayEdit = false;
    this.selectedArchiveDto = {} as FileArchiveDto;
  }

  get isMyDrivesMode(): boolean {
    return this.dashboardMode === 'mydrives';
  }

  get isDrivesMode(): boolean {
    return this.dashboardMode === 'drives';
  }

  private setDashboardMode(data: Data): void {
    const mode = data?.['dashboardMode'] as DashboardMode;
    if (mode === 'mydrives' || mode === 'drives') {
      this.dashboardMode = mode;
      this.resetSelectedRowVar();
      if (this.lastLoadEvent) {
        this.loadFileArchives(this.lastLoadEvent);
      }
    }
  }

  loadFileArchives(event: LazyLoadEvent) {
    this.lastLoadEvent = event;
    this.loading = true;
    const sortOrder: string = event?.sortOrder > 0 ? 'asc' : 'desc';
    const sortField: string = event?.sortField || 'CreationTime';
    const sorting: string = sortField + ' ' + sortOrder;

    this.fileArchiveService.getFileArchivesListByParamsByInput({
      maxResultCount: this.rowsCount,
      skipCount: event?.first,
      sorting,
      searchQuery: this.searchQuery, 
    })
    .pipe(first())
    .subscribe((rows) => {
      this.rows = rows?.items?.map(i => {
        const fileArchive = {
          data: i,
          validators: {
            name: false,
            hierarchyType: false,
            provider: false,
          },
          displayEdit: false
        };
        return fileArchive;
      })
      this.totalRecords = rows.totalCount;
      this.loading = false;
    });
  }

  reloadFileArchives() {
    if (this.lastLoadEvent != null)
      this.loadFileArchives(this.lastLoadEvent);
  }

  createFileArchive(): void {
    if (this.isMyDrivesMode) {
      return;
    }
    if (!!this.editingRow) {
      this.msgService.error('FileManager::Error:RowEditingInProcess');
      return;
    }

    this.createDialogVisible = true;
    this.dialogArchive = null;
  }

  onCreateDialogClose(): void {
    this.createDialogVisible = false;
    this.dialogArchive = null;
  }

  onDialogSaved(success: boolean): void {
    if (success) {
      this.reloadFileArchives();
    }
    this.onCreateDialogClose();
  }

  edit(row: FileArchiveTableRow) {

    if (this.isMyDrivesMode) {
      this.viewDetails(row);
      return;
    }

    const archive = row?.data;
    if (!archive?.id) {
      return;
    }

    this.dialogArchive = archive;
    this.createDialogVisible = true;
  }

  onStorageProviderSelected(dto: StorageProviderDto, row: FileArchiveTableRow) {
    row.data.storageProviderName = dto.name;
    row.data.storageProviderId = dto.id;
    row.validators.provider = false;
  }

  viewDetails(row: FileArchiveTableRow){
    this.router.navigate(['/digital-archive/explorer/' + row.data.id]);
  }

  onRowClick(row: FileArchiveTableRow): void {
    if (this.isMyDrivesMode) {
      this.viewDetails(row);
    } else {
      this.edit(row);
    }
  }

  hierarchyTypeLabel(value: FileArchiveHierarchyType | null | undefined): string {
    if (value === null || value === undefined) {
      return '';
    }
    const key = FileArchiveHierarchyType[value];
    return this.localizationService.instant(`FileManager::HierarchyType:${key}`);
  }
  
  select(event) {
    const row = event.data;
    // this.router.navigate(['/digital-archive/file-archives', row.data.id]);
  }

  sort(event: SortEvent) {
    console.log(event);
  }

  search(event) {
    this.searchQuery = this.searchQueryText;
    this.loadFileArchives(this.lastLoadEvent);
  }

  clear(event) {
    this.searchQueryText = '';
    this.search(event);
  }

  onSearchInput(event) {
    console.log(this.searchQueryText);
    if (this.searchQueryText?.length <= 3) {
      if (this.searchQuery) {
        this.searchQuery = null;
        this.loadFileArchives(this.lastLoadEvent);
      }
      return;
    }
    this.searchQuery = this.searchQueryText;
    this.loadFileArchives(this.lastLoadEvent);
  }

  removeFileArchive(row: FileArchiveTableRow): void {
    if (this.isMyDrivesMode) {
      return;
    }
    this.confirmationService.confirm('FileManager::Archives:RemoveConfirm', () => {
      this.loading = true;
      this.fileArchiveService.deleteFileArchiveById(row.data.id).subscribe(success => {
        this.loading = false;
        if (success) {
          this.state.setNotDirty();
          this.msgService.success('FileManager::Archives:RemoveSuccess');
          this.loadFileArchives(this.lastLoadEvent);
        } else {
          this.msgService.success('FileManager::Archives:RemoveFail');
        }
      });
    });
  }

  closeEditDialog(row: FileArchiveTableRow): void {
    this.selectedRow.displayEdit = false;
    this.selectedArchiveDto = {} as FileArchiveDto;
    this.selectedRow = {} as FileArchiveTableRow;
    row.displayEdit = false;
    this.loadFileArchives(this.lastLoadEvent);
  }

  updateFolderName(row: FileArchiveTableRow){
    this.selectedRow.displayEdit = false;
    this.selectedArchiveDto = {} as FileArchiveDto;
    this.selectedRow = {} as FileArchiveTableRow;
    row.displayEdit = false;
    this.loadFileArchives(this.lastLoadEvent);
  }

  openPermissions(row: FileArchiveTableRow) {
    if (this.isMyDrivesMode) {
      return;
    }
    const isMobile = window.innerWidth <= 768;
    const width = isMobile ? '95vw' : '600px';
    this.dialogHeaderService.setTitle(this.localizationService.instant('FileManager::Permissions:Archive'))
    const dialogRef = this.dynamicDialogService.open(PermissionManagementComponent, {
      width: width,
      height: "600px",
      baseZIndex: 5000,
      modal: true,
      data: {
        archiveId: row.data.id,
      },
      draggable: false,
      templates: {
        header: FileDynamicDialogHeaderComponent
      },
      styleClass: 'archivePermissionDialog dialog-pb-custom',
    });
  }

  editArchive(row: FileArchiveTableRow){
    this.selectedRow = row;
    this.selectedRow.displayEdit = true;
    this.selectedArchiveDto = Object.assign({}, this.selectedRow.data);
    row.displayEdit = true;
  }
}
