import { NgModule } from '@angular/core';
import { SharedModule } from '@eleon/angular-sdk.lib';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { TabsModule } from 'primeng/tabs';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { SelectButtonModule } from 'primeng/selectbutton';

import { CheckboxModule } from 'primeng/checkbox';
import { MultiSelectModule } from 'primeng/multiselect';
import { PageTitleModule } from '@eleon/primeng-ui.lib';
import { RequiredMarkModule } from '@eleon/angular-sdk.lib';

import { FileManagerRoutingModule } from './file-manager-routing.module';
import { ResponsiveTableModule, SharedTableModule } from '@eleon/primeng-ui.lib';
import { TooltipModule } from 'primeng/tooltip';
import { FileHierarchyTypeSelectionModule } from './file-hierarchy-type-selection/file-hierarchy-type-selection.module';
import { StorageProviderSelectionModule } from '@eleon/storage-provider.lib';
import { FileManagerExplorerComponent } from './file-manager-explorer/file-manager-explorer.component';
import { FolderPathComponent } from './file-manager-explorer/folder-path/folder-path.component';
import { FileUploadProcessComponent } from './shared/file-upload-process/file-upload-process.component';
import { CopyEntryComponent } from './file-manager-explorer/copy-entry/copy-entry.component';
import { MoveEntryComponent } from './file-manager-explorer/move-entry/move-entry.component';
import { FileMoveAllComponent } from './file-manager-explorer/file-move-all/file-move-all.component';
import { EntryItemComponent } from './shared/entry-item/entry-item.component';
import { UploadFileFolderComponent } from './file-manager-explorer/upload-file-folder/upload-file-folder.component';
import { FileManagerExplorerToolbarComponent } from './file-manager-explorer/file-manager-explorer-toolbar/file-manager-explorer-toolbar.component';
import { AddFolderComponent } from './file-manager-explorer/add-folder/add-folder.component';
import { PipesModule } from '@eleon/angular-sdk.lib';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSortModule } from '@angular/material/sort';
import { FileDragDropDirective } from './shared/file-drag-drop.directive';
import { FileSizePipe } from './shared/file-size.pipe';
import { MenuModule } from 'primeng/menu';
import {CdkAccordionModule} from '@angular/cdk/accordion';
import { PermissionManagementComponent } from './shared/permission-management/permission-management.component';
import { PermissionManagementTableComponent } from './shared/permission-management/permission-management-table/permission-management-table.component';
import { FileManagerExplorerTableComponent } from './file-manager-explorer/file-manager-explorer-table/file-manager-explorer-table.component';
import { FileShareManagementComponent } from './shared/file-share-management/file-share-management.component';
import { FileExternalViewComponent } from './file-external-view/file-external-view.component';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TagModule } from 'primeng/tag';
import { FileShareManagementExternalPrivateComponent } from './shared/file-share-management/file-share-management-external-private/file-share-management-external-private.component';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputMaskModule } from 'primeng/inputmask';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { FileHistoryComponent } from './shared/file-history/file-history.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { FocusTrapModule } from 'primeng/focustrap';
import { PopoverModule } from 'primeng/popover';
import { RenameEntryComponent } from './file-manager-explorer/rename-entry/rename-entry.component';
import { ProfilePictureModule, TextSelectionModule } from '@eleon/primeng-ui.lib';
import { FileDynamicDialogHeaderComponent } from './file-manager-explorer/file-dynamic-dialog-header/file-dynamic-dialog-header.component';
import { EditFolderComponent } from './file-manager-explorer/edit-folder/edit-folder.component';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { FileShareComponent } from './shared/file-share/file-share.component';
import { FileArchivesDashboardComponent } from './digital-archive/file-archives/file-archives-dashboard/file-archives-dashboard.component';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { CreateFileArchiveDialogComponent } from './digital-archive/file-archives/file-archives-dashboard/create-file-archive-dialog/create-file-archive-dialog.component';
import { FileArhiveFolderSelectionComponent } from './digital-archive/file-archives/file-archives-dashboard/file-arhive-folder-selection/file-arhive-folder-selection.component';
import { FileArchiveSelectionComponent } from './file-archive-selection/file-archive-selection.component';
@NgModule({
  declarations: [
    FileManagerExplorerComponent,
    FolderPathComponent,
    FileUploadProcessComponent,
    CopyEntryComponent,
    MoveEntryComponent,
    FileMoveAllComponent,
    EntryItemComponent,
    UploadFileFolderComponent,
    FileManagerExplorerToolbarComponent,
    AddFolderComponent,
    FileArchiveSelectionComponent,
    FileDragDropDirective,
    FileSizePipe,
    PermissionManagementComponent,
    PermissionManagementTableComponent,
    FileManagerExplorerTableComponent,
    FileShareManagementComponent,
    FileShareComponent,
    FileExternalViewComponent,
    FileShareManagementExternalPrivateComponent,
    FileHistoryComponent,
    RenameEntryComponent,
    FileDynamicDialogHeaderComponent,
    EditFolderComponent,
    FileArchivesDashboardComponent,
    CreateFileArchiveDialogComponent,
    FileArhiveFolderSelectionComponent
  ],
  imports: [
    SharedModule,
    PageTitleModule,
    ButtonModule,
    FocusTrapModule,
    TagModule,
    DialogModule,
    SelectButtonModule,
    InputTextModule,
    TextSelectionModule,
    InputMaskModule,
    PipesModule,
    MenuModule,
    ToggleSwitchModule,
    FormsModule,
    InputNumberModule,
    TabsModule,
    TableModule,
    ResponsiveTableModule,
    SelectModule,
    FileManagerRoutingModule,
    RadioButtonModule,
    RequiredMarkModule,
    CheckboxModule,
    MultiSelectModule,
    TooltipModule,
    FormsModule,
    FileHierarchyTypeSelectionModule,
    BreadcrumbModule,
    StorageProviderSelectionModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    ProgressSpinnerModule,
    MatDialogModule,
    MatListModule,
    MatChipsModule,
    PopoverModule,
    MatAutocompleteModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatCheckboxModule,
    DragDropModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ClipboardModule,
    MatSortModule,
    ProfilePictureModule,
    SharedTableModule,
    DynamicDialogModule,
    ReactiveFormsModule
  ],
  exports:[EditFolderComponent, FileManagerExplorerComponent]
})
export class FileManagerModule { }
