import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { Component, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { StorageProvidersService, StorageProviderDto } from '@eleon/providers-proxy';
import { ConfirmationService, MessageService } from "primeng/api";
import { contributeControls, PAGE_CONTROLS, PageControls } from '@eleon/primeng-ui.lib';
import { StorageProviderCreateDialogComponent } from '../storage-provider-create-dialog/storage-provider-create-dialog.component';

interface StorageProviderRow {
  data: StorageProviderDto;
}

@Component({
  standalone: false,
  selector: "app-storage-providers-list",
  templateUrl: "./storage-providers-list.component.html",
  styleUrls: ["./storage-providers-list.component.scss"],
})
export class StorageProvidersListComponent implements OnInit {
  providers: StorageProviderRow[];
  loading: boolean;
  searchQueryText: string;
  searchQuery: string;
  readonly rowsCount = 10;
  totalRecords = 0;
  @ViewChild('storageProviderCreateDialog') storageProviderCreateDialog: StorageProviderCreateDialogComponent;

    @PageControls()
    controls = contributeControls([
      PAGE_CONTROLS.RELOAD({
        loading: () => this.loading,
        action: () => this.loadStorageProviders(),
        disabled: () => this.loading,
      }),
      PAGE_CONTROLS.ADD({
        loading: () => this.loading,
        action: () => this.storageProviderCreateDialog.showDialog(),
        disabled: () => this.loading,
      }),
    ]);

  constructor(
    public storageProvidersService: StorageProvidersService,
    public localizationService: ILocalizationService,
    public messageService: MessageService,
    public router: Router,
    protected confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadStorageProviders();
  }

  search(event) {
    this.searchQuery = this.searchQueryText;
    this.loadStorageProviders();
  }

  clear(event) {
    this.searchQueryText = "";
    this.search(event);
  }

  onSearchInput(event) {
    if (this.searchQueryText?.length <= 3) {
      if (this.searchQuery) {
        this.searchQuery = null;
        this.loadStorageProviders();
      }
      return;
    }

    this.searchQuery = this.searchQueryText;
    this.loadStorageProviders();
  }

  loadStorageProviders() {
    this.loading = true;
    this.storageProvidersService
      .getStorageProvidersListByInput({
        sorting: "name asc",
        searchQuery: this.searchQuery,
        maxResultCount: 100,
      })
      .subscribe((list) => {
        this.providers = list.map((x) => ({ data: x }));
        this.loading = false;
        this.totalRecords = list.length;
      });
  }

  removeStorageProvider(row: StorageProviderRow, event: MouseEvent): void {
    event.stopPropagation();
    this.confirmationService.confirm({
      message: this.localizationService.instant("StorageModule::ConfirmDelete"),
      accept: () => {
        this.loading = true;
        this.storageProvidersService
          .removeStorageProviderByStorageProviderId(row.data.id)
          .subscribe({
            next: (wasSaved) => {
              this.loading = false;
              if (wasSaved) {
                this.messageService.add({
                  severity: "success",
                  summary: this.localizationService.instant("StorageModule::ProvidersOptions:RemoveSuccess"),
                });
                this.loadStorageProviders();
              } else {
                this.messageService.add({
                  severity: "error",
                  summary: this.localizationService.instant("StorageModule::ProvidersOptions:RemoveFail"),
                });
              }
            },
            error: () => {
              this.messageService.add({
                severity: "error",
                summary: this.localizationService.instant("StorageModule::ProvidersOptions:RemoveError"),
              });
              
            },
          });
      },
      acceptLabel: this.localizationService.instant("Infrastructure::Yes"),
      rejectLabel: this.localizationService.instant("Infrastructure::No"),
      acceptButtonStyleClass: "p-button-md p-button-raised p-button-text p-button-info",
      acceptIcon: "pi pi-check",
      rejectButtonStyleClass: "p-button-md p-button-raised p-button-text p-button-danger",
      rejectIcon: "pi pi-times",
    });
  }

  editStorageProvider(row: StorageProviderRow): void {
    this.router.navigate([
      "/storage/providers-options/config/",
      row.data.id,
    ]);
  }

  createStorage(event) {
    this.router.navigate(["/storage/providers-options/config/", event]);
  }
}
