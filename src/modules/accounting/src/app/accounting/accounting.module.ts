import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@eleon/angular-sdk.lib';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { BadgeModule } from 'primeng/badge';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { ChipModule } from 'primeng/chip';
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { FileUploadModule } from 'primeng/fileupload';
import { TagModule } from 'primeng/tag';
import { PageTitleModule } from '@eleon/primeng-ui.lib';
import { ResponsiveTableModule } from '@eleon/primeng-ui.lib';
import { AccordionModule } from 'primeng/accordion';
import { RequiredMarkModule } from '@eleon/angular-sdk.lib';
import { AccountingRoutingModule } from './accounting-routing.module';
import { AccountDashboardComponent } from './account/account-dashboard/account-dashboard.component';
import { AccountCreateComponent } from './account/account-create/account-create.component';
import { PackageTemplatesDashboardComponent } from './package-template/package-templates-dashboard/package-templates-dashboard.component';
import { PackageTemplateCreateComponent } from './package-template/package-template-create/package-template-create.component';
import { CheckboxModule } from 'primeng/checkbox';
import { PackageTemplateSelectionDialogComponent } from './package-template/package-template-selection-dialog/package-template-selection-dialog.component';
import { AccountSelectionDialogComponent } from './account/account-selection-dialog/account-selection-dialog.component';
import { PasswordModule } from 'primeng/password';
import { AccountStatusTagComponent } from './account-status-tag/account-status-tag.component';
import { DialogModule } from 'primeng/dialog';
import { PROXY_SERVICES } from '@eleon/accounting-proxy';
import { PackageTemplateModuleCreateComponent } from './package-template/package-template-module-create/package-template-module-create.component';
import { MemberCreateComponent } from './account/member-create/member-create.component';
import { MemberSelectionDialogComponent } from './account/member-selection-dialog/member-selection-dialog.component';
import { AccountCreateDialogComponent } from './account/account-create-dialog/account-create-dialog.component';
import { PackageTemplateCreateDialogComponent } from './package-template/package-template-create-dialog/package-template-create-dialog.component';
import { TabsModule } from 'primeng/tabs';
import { AccountPackagesManagementComponent } from './account/account-packages-management/account-packages-management.component';
import { AccountMembersManagementComponent } from './account/account-members-management/account-members-management.component';
import { AccountPackageCreateDialogComponent } from './account/account-package-create-dialog/account-package-create-dialog.component';
import { AccountUserManagementComponent } from './account/account-user-management/account-user-management.component';
import { AccountTenantManagementComponent } from './account/account-tenant-management/account-tenant-management.component';
import { UserMemberCreateComponent } from './account/user-member-create/user-member-create.component';
import { TenantMemberCreateComponent } from './account/tenant-member-create/tenant-member-create.component';

@NgModule({
  declarations: [
    AccountDashboardComponent,
    AccountCreateComponent,
    PackageTemplatesDashboardComponent,
    PackageTemplateCreateComponent,
    PackageTemplateSelectionDialogComponent,
    AccountSelectionDialogComponent,
    AccountStatusTagComponent,
    PackageTemplateModuleCreateComponent,
    MemberCreateComponent,
    MemberSelectionDialogComponent,
    AccountCreateDialogComponent,
    PackageTemplateCreateDialogComponent,
    AccountPackagesManagementComponent,
    AccountMembersManagementComponent,
    AccountPackageCreateDialogComponent,
    AccountUserManagementComponent,
    AccountTenantManagementComponent,
    UserMemberCreateComponent,
    TenantMemberCreateComponent
  ],
  imports: [
    AccountingRoutingModule,
    CommonModule,
    SharedModule,
    DatePickerModule,
    InputTextModule,
    TextareaModule,
    BadgeModule,
    TableModule,
    ButtonModule,
    InputNumberModule,
    ChipModule,
    TooltipModule,
    SelectModule,
    MultiSelectModule,
    FileUploadModule,
    TagModule,
    TabsModule,
    PageTitleModule,
    ResponsiveTableModule,
    AccordionModule,
    RequiredMarkModule,
    CheckboxModule,
    DialogModule,
    PasswordModule,
  ],
  exports: [
    PackageTemplateSelectionDialogComponent
  ],
  providers: [...PROXY_SERVICES.map(s => ({ provide: s, useClass: s }))]
})
export class AccountingModule {
  constructor() {
  }
 }
