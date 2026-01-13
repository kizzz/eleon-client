import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { PackageTemplateService } from '@eleon/accounting-proxy';
import { PackageTemplateDto } from '@eleon/accounting-proxy';
import { BillingPeriodType } from '@eleon/accounting-proxy';
import { LazyLoadEvent } from "primeng/api";
import { viewportBreakpoints } from "@eleon/angular-sdk.lib";
import { contributeControls, PAGE_CONTROLS, PageControls } from "@eleon/primeng-ui.lib";

interface PackageTemplateTableRow {
  data: PackageTemplateDto;
}

@Component({
  standalone: false,
  selector: "app-package-templates-dashboard",
  templateUrl: "./package-templates-dashboard.component.html",
  styleUrls: ["./package-templates-dashboard.component.scss"],
})
export class PackageTemplatesDashboardComponent implements OnInit {
  rowsCount: number = 10;
  totalRecords: number = 0;
  rows: PackageTemplateTableRow[];
  loading: boolean = false;
  lastLoadEvent: LazyLoadEvent | null;
  creationDateRangeFilter: Date[] = null;
  searchQueryText: string;
  searchQuery: string;
  viewportBreakpoints = viewportBreakpoints;
  title: string;
  localizedBillingPeriodTypes: { value: BillingPeriodType; name: string }[];


  @PageControls()
    controls = contributeControls([
      PAGE_CONTROLS.RELOAD({
        show: () => true,
        loading: () => this.loading,
        action: () => this.reloadPackageTemplates(),
        disabled: () => this.loading,
      }),
      PAGE_CONTROLS.CREATE({
        show: () => true,
        loading: () => this.loading,
        action: () => this.router.navigate(['/account/packagetemplate/create/']),
        disabled: () => this.loading,
      }),
    ]);
    
  constructor(
    public packageTemplateService: PackageTemplateService,
    public localizationService: ILocalizationService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.title = this.localizationService.instant(
      "AccountingModule::PackageTemplate:Title"
    );
    this.localizedBillingPeriodTypes = [
      BillingPeriodType.Month,
      BillingPeriodType.Year,
      BillingPeriodType.Weekly,
      BillingPeriodType.Quarterly,
      BillingPeriodType.None,
    ].map((value) => ({
      value: value,
      name: this.localizationService.instant(
        `Infrastructure::BillingPeriodType:${BillingPeriodType[value]}`
      ),
    }));
  }

  loadPackageTemplates(event: LazyLoadEvent) {
    this.lastLoadEvent = event;
    this.loading = true;
    const sortField: string = event.sortField || "CreationTime";
    const sortOrder: string =
      sortField === "CreationTime"
        ? "desc"
        : event.sortOrder > 0
        ? "asc"
        : "desc";
    const sorting: string = sortField + " " + sortOrder;

    let fromCreationDate = null,
      toCreationDate = null;
    if (this.creationDateRangeFilter?.length === 2) {
      fromCreationDate = this.creationDateRangeFilter[0]?.toISOString();
      toCreationDate = this.creationDateRangeFilter[1]?.toISOString();
    }

    this.packageTemplateService
      .getPackageTemplateListByInput({
        maxResultCount: this.rowsCount,
        skipCount: event.first,
        sorting,
        dateFilterStart: fromCreationDate,
        dateFilterEnd: toCreationDate,
        searchQuery: this.searchQuery,
        billingPeriodTypeFilter: event.filters?.[
          "billingPeriodType"
        ]?.value?.map((x) => x.value),
      })
      .subscribe((rows) => {
        this.rows = rows.items.map((i) => ({ data: i }));
        this.totalRecords = rows.totalCount;
        this.loading = false;
      });
  }

  reloadPackageTemplates() {
    if (this.lastLoadEvent != null)
      this.loadPackageTemplates(this.lastLoadEvent);
  }

  select(event) {
    this.router.navigate([
      "/account/packagetemplate/details",
      event.data.id,
    ]);
  }

  search(event) {
    this.searchQuery = this.searchQueryText;
    this.loadPackageTemplates(this.lastLoadEvent);
  }

  clear(event) {
    this.searchQueryText = "";
    this.search(event);
  }

  onSearchInput(event) {
    if (this.searchQueryText?.length <= 3) {
      if (this.searchQuery) {
        this.searchQuery = null;
        this.loadPackageTemplates(this.lastLoadEvent);
      }
      return;
    }
    this.searchQuery = this.searchQueryText;
    this.loadPackageTemplates(this.lastLoadEvent);
  }

  getBillingPeriodTypeName(type: number) {
    return this.localizationService.instant(
      "Infrastructure::BillingPeriodType:" + BillingPeriodType[type]
    );
  }
}
