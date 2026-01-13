import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { Component, OnInit } from "@angular/core";
import { LocalizationOverrideService } from '@eleon/language-management-proxy';
import { LanguageInfoDto } from '@eleon/language-management-proxy';
import {
  LocalizationInformationDto,
  OverriddenLocalizationStringDto,
} from '@eleon/language-management-proxy';
import { LazyLoadEvent } from "primeng/api";
import { Observable, defer, finalize, from, of, switchMap } from "rxjs";
import { LocalizedConfirmationService } from "@eleon/primeng-ui.lib";

interface TargetValueFilter {
  value: "all" | "empty";
  label: string;
}
@Component({
  standalone: false,
  selector: "app-localization-entries-list",
  templateUrl: "./localization-entries-list.component.html",
  styleUrls: ["./localization-entries-list.component.scss"],
})
export class LocalizationEntriesListComponent implements OnInit {
  private inited = false;
  private lastLazyLoadEvent: LazyLoadEvent;

  public strings: OverriddenLocalizationStringDto[];
  public languages: LanguageInfoDto[];
  public resources: string[];
  public baseLanguage: string;
  public targetLanguage: string;
  public loading: boolean = false;
  public selectedResources: string[] = [];
  public targetValueFilter: "all" | "empty" = "all";
  public rowsCount: number = 25;
  public totalRecords: number = 0;
  public searchQuery: string = "";

  public get showResourceColumn(): boolean {
    return this.selectedResources.length > 1;
  }

  public get showTargetColumn(): boolean {
    return this.baseLanguage !== this.targetLanguage;
  }

  public targetValueFilters: TargetValueFilter[] = [
    {
      value: "all",
      label: this.localizationService.instant(
        "LanguageManagement::TargetValue:All"
      ),
    },
    {
      value: "empty",
      label: this.localizationService.instant(
        "LanguageManagement::TargetValue:Empty"
      ),
    },
  ];

  constructor(
    private localizationOverrideService: LocalizationOverrideService,
    private localizationService: ILocalizationService,
    private confirmationService: LocalizedConfirmationService
  ) {}

  public ngOnInit(): void {
    this.loading = true;
    this.localizationOverrideService
      .getLocalizationInformation()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((info) => {
        this.initLocalization(info);
        this.loadStrings();
      });
  }

  public onBaseLanguageChange(): void {
    this.loadStrings();
  }

  public onTargetLanguageChange(): void {
    this.loadStrings();
  }

  public onResourcesChanged(): void {
    this.loadStrings();
  }

  public onTargetValueFilterChange(): void {
    this.loadStrings();
  }

  public onStringEdited = (
    entry: OverriddenLocalizationStringDto
  ): Observable<boolean> => {
    const targetNotEmpty = !!entry.target?.length;
    if (targetNotEmpty) {
      return this.editString(entry);
    }

    return defer(() =>
      from(
        this.confirmationService.confirmAsync(
          "LanguageManagement::LocalizationEntryOverride:ResetToDefault:Confirm"
        )
      )
    ).pipe(
      switchMap((confirmed) => (confirmed ? this.editString(entry) : of(false)))
    );
  };

  public loadStrings(event?: LazyLoadEvent): void {
    if (!!event) {
      this.lastLazyLoadEvent = event;
    }

    if (!this.inited || !this.lastLazyLoadEvent) {
      return;
    }

    const sortField: string = this.lastLazyLoadEvent.sortField || "Key";
    const sortOrder: string =
      sortField === "Key"
        ? "desc"
        : this.lastLazyLoadEvent.sortOrder > 0
        ? "asc"
        : "desc";

    const sorting: string = sortField + " " + sortOrder;

    this.loading = true;
    this.localizationOverrideService
      .getLocalizationStringsByRequest({
        skipCount: this.lastLazyLoadEvent.first,
        maxResultCount: this.rowsCount,
        localizationResources: this.selectedResources,
        baseCulture: this.baseLanguage,
        targetCulture: this.targetLanguage,
        searchQuery: this.searchQuery,
        sorting: sorting,
        onlyEmpty: this.targetValueFilter === "empty",
      })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((strings) => {
        this.strings = strings.items;
        this.totalRecords = strings.totalCount;
      });
  }

  private editString(
    entry: OverriddenLocalizationStringDto
  ): Observable<boolean> {
    this.loading = true;
    return this.localizationOverrideService
      .overrideLocalizationEntryByRequest({
        key: entry.key,
        cultureName: this.targetLanguage,
        newValue: entry.target,
        resourceName: entry.resource,
      })
      .pipe(
        finalize(() => {
          this.loadStrings();
        })
      );
  }

  private initLocalization(info: LocalizationInformationDto): void {
    this.languages = info.languages;
    this.resources = info.localizationResources;
    this.selectedResources = [...this.resources];

    const defaultLanguage = info.languages.find(
      (l) => l.cultureName === info.defaultCulture
    );
    this.baseLanguage = defaultLanguage?.cultureName || "en";

    const currentLanguage = info.languages.find(
      (l) => l.cultureName === this.localizationService.currentLang
    );
    this.targetLanguage = currentLanguage?.cultureName || "en";

    this.inited = true;
  }
}
