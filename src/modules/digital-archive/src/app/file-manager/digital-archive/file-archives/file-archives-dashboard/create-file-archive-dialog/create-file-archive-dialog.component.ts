import { AfterViewInit, Component, EventEmitter, Input, OnChanges, Optional, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FileArchiveHierarchyType, FileArchiveDto, FileArchiveService, FileSystemEntryDto } from '@eleon/file-manager-proxy';
import { isFolder } from '../../../../shared/utils/entry-helpers';
import { StorageProviderDto } from '@eleon/angular-sdk.lib';
import { IProvidersService, VPortalOption } from '@eleon/angular-sdk.lib';
import { FileHierarchyTypeSelectionComponent } from '../../../../file-hierarchy-type-selection/file-hierarchy-type-selection/file-hierarchy-type-selection.component';

interface FileArchiveModelValidators {
  nameEmpty: boolean;
  hierarchyTypeEmpty: boolean;
  storageProviderEmpty: boolean;
  rootFolderEmpty: boolean;
}

interface FileArchiveModel {
  name: string;
  fileArchiveHierarchyType: FileArchiveHierarchyType;
  storageProviderId: string | null;
  rootFolderId: string;
  isActive: boolean;
  isPersonalizedArchive: boolean;
  validators: FileArchiveModelValidators;
}

@Component({
  standalone: false,
  selector: 'app-create-file-archive-dialog',
  templateUrl: './create-file-archive-dialog.component.html',
  styleUrls: ['./create-file-archive-dialog.component.scss']
})
export class CreateFileArchiveDialogComponent implements AfterViewInit, OnChanges {
  @ViewChild(FileHierarchyTypeSelectionComponent)
  hierarchySelector: FileHierarchyTypeSelectionComponent;

  @Input()
  display: boolean = false;

  @Input()
  archive: FileArchiveDto | null = null;

  @Output()
  saved = new EventEmitter<boolean>();

  @Output()
  closeEvent = new EventEmitter<void>();

  model: FileArchiveModel = this.createDefaultModel();
  hierarchyTypes = FileArchiveHierarchyType;
  loading = false;
  isEditMode = false;
  folderDialogVisible = false;
  selectedFolderName: string | null = null;
  FileArchiveHierarchyType = FileArchiveHierarchyType;

  constructor(
    private fileArchiveService: FileArchiveService,
    @Optional() private providersService: IProvidersService
  ) {
  }

  ngAfterViewInit(): void {
    this.hierarchySelector?.input();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['archive']) {
      this.isEditMode = !!this.archive?.id;
      if (this.archive) {
        this.patchModelFromArchive(this.archive);
      } else {
        this.resetModel();
      }
    }
  }

  onHierarchySelected(option: VPortalOption<FileArchiveHierarchyType>): void {
    this.model.fileArchiveHierarchyType = option?.value ?? FileArchiveHierarchyType.Virtual;
    this.model.validators.hierarchyTypeEmpty = false;

    if (!this.model.rootFolderId) {
      this.model.rootFolderId = './';
    }
  }

  onStorageProviderSelected(dto: StorageProviderDto): void {
    this.model.storageProviderId = dto?.id ?? null;
    this.model.rootFolderId = './';
    this.model.validators.storageProviderEmpty = false;
    this.selectedFolderName = null;
  }

  openFolderDialog(): void {
    if (!this.model.storageProviderId) {
      this.model.validators.storageProviderEmpty = true;
      return;
    }
    this.folderDialogVisible = true;
  }

  onFolderSelected(folder: FileSystemEntryDto): void {
    if (folder?.id && isFolder(folder)) {
      this.model.rootFolderId = folder.id;
      this.selectedFolderName = folder.name ?? folder.id;
    }
    this.folderDialogVisible = false;
  }

  onFolderDialogClose(): void {
    this.folderDialogVisible = false;
  }

  save(): void {
    if (!this.validate()) {
      return;
    }

    const payload: FileArchiveDto = {
      name: this.model.name,
      fileArchiveHierarchyType: this.model.fileArchiveHierarchyType,
      storageProviderId: this.model.storageProviderId,
      physicalRootFolderId: this.model.rootFolderId,
      isActive: this.model.isActive,
      isPersonalizedArchive: this.model.isPersonalizedArchive
    };

    this.loading = true;
    if (this.isEditMode) {
      this.updateArchive(payload);
    } else {
      this.createArchive(payload);
    }
  }

  cancel(): void {
    this.hide();
  }

  onHide(): void {
    this.hide();
  }

  private hide(): void {
    this.display = false;
    this.folderDialogVisible = false;
    this.resetModel();
    this.closeEvent.emit();
  }

  private resetModel(): void {
    this.model = this.createDefaultModel();
    this.selectedFolderName = null;
  }

  private createDefaultModel(): FileArchiveModel {
    return {
      name: '',
      fileArchiveHierarchyType: FileArchiveHierarchyType.Virtual,
      storageProviderId: null,
      rootFolderId: '/',
      isActive: true,
      isPersonalizedArchive: false,
      validators: {
        nameEmpty: false,
        hierarchyTypeEmpty: false,
        storageProviderEmpty: false,
        rootFolderEmpty: false,
      },
    };
  }

  private patchModelFromArchive(archive: FileArchiveDto): void {
    this.model = {
      name: archive.name ?? '',
      fileArchiveHierarchyType: archive.fileArchiveHierarchyType ?? FileArchiveHierarchyType.Virtual,
      storageProviderId: archive.storageProviderId ?? null,
      rootFolderId: archive.rootFolderId ?? '/',
      isActive: archive.isActive ?? true,
      isPersonalizedArchive: archive.isPersonalizedArchive ?? false,
      validators: {
        nameEmpty: false,
        hierarchyTypeEmpty: false,
        storageProviderEmpty: false,
        rootFolderEmpty: false,
      },
    };
    this.selectedFolderName = archive.rootFolderId ?? '/';
  }

  private validate(): boolean {
    this.model.validators = {
      nameEmpty: !this.model.name?.length,
      hierarchyTypeEmpty: this.model.fileArchiveHierarchyType === null || this.model.fileArchiveHierarchyType === undefined,
      storageProviderEmpty: !this.model.storageProviderId,
      rootFolderEmpty: !this.model.rootFolderId,
    };

    return !(
      this.model.validators.nameEmpty ||
      this.model.validators.hierarchyTypeEmpty ||
      this.model.validators.storageProviderEmpty ||
      this.model.validators.rootFolderEmpty
    );
  }

  private createArchive(payload: FileArchiveDto): void {
    this.fileArchiveService.createFileArchiveByFileArchive({
      ...payload,
      id: undefined
    }).subscribe({
      next: (success) => {
        this.loading = false;
        if (success) {
          this.saved.emit(true);
          this.hide();
        }
      },
      error: () => this.loading = false
    });
  }

  private updateArchive(payload: Partial<FileArchiveDto>): void {
    this.fileArchiveService.updateFileArchiveByFileArchive({
      ...this.archive,
      ...payload,
    }).subscribe({
      next: (success) => {
        this.loading = false;
        if (success) {
          this.saved.emit(true);
          this.hide();
        }
      },
      error: () => this.loading = false
    });
  }

  openProviderSelectionDialog(){
    this.providersService?.openProviderSelectionDialog(this.model.storageProviderId, (provider) => this.onStorageProviderSelected(provider));
  }
}
