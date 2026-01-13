import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { PackageTemplateService, PackageTemplateDto, PackageType, BillingPeriodType } from '@eleon/accounting-proxy';
import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { finalize } from 'rxjs/operators';

@Component({
  standalone: false,
  selector: 'app-package-template-details',
  templateUrl: './package-template-details.component.html',
  styleUrls: ['./package-template-details.component.scss']
})
export class PackageTemplateDetailsComponent implements OnInit {
  loading: boolean = false;
  packageTemplate: PackageTemplateDto | null = null;
  PackageType = PackageType;
  BillingPeriodType = BillingPeriodType;

  constructor(
    private route: ActivatedRoute,
    private packageTemplateService: PackageTemplateService,
    public localizationService: ILocalizationService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      if (params['id']) {
        this.loadPackageTemplateDetails(params['id']);
      }
    });
  }

  loadPackageTemplateDetails(id: string): void {
    this.loading = true;
    this.packageTemplateService
      .getPackageTemplateByIdById(id)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (dto) => {
          this.packageTemplate = dto;
        },
      });
  }

  getPackageTypeName(type: PackageType): string {
    return this.localizationService.instant(
      `Infrastructure::PackageType:${PackageType[type]}`
    );
  }

  getBillingPeriodTypeName(type: BillingPeriodType): string {
    return this.localizationService.instant(
      `Infrastructure::BillingPeriodType:${BillingPeriodType[type]}`
    );
  }
}
