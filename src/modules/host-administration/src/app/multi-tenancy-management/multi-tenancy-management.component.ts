import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  ApplicationConnectionStringService,
  ApplicationModuleDto,
  ClientApplicationService,
  ConnectionStringDto,
  CreateConnectionStringRequestDto,
  MenuType,
} from '@eleon/sites-management-proxy';
import {
  CommonTenantDto,
  ITenantService,
  PipesModule,
  RequiredMarkModule,
  SharedModule,
} from '@eleon/angular-sdk.lib';
import {
  LocalizedConfirmationService,
  LocalizedMessageService,
} from '@eleon/primeng-ui.lib';
import {
  contributeControls,
  PAGE_CONTROLS,
  PageControls,
} from '@eleon/primeng-ui.lib';
import { PageTitleModule } from '@eleon/primeng-ui.lib';
import {
  ResponsiveTableModule,
  SharedTableModule,
  TableCellsModule,
  TableRowEditorDirective,
} from '@eleon/primeng-ui.lib';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { MultiSelectModule } from 'primeng/multiselect';
import { ProgressBarModule } from 'primeng/progressbar';
import { RadioButtonModule } from 'primeng/radiobutton';
import { Table, TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { TreeModule } from 'primeng/tree';
import { TreeTableModule } from 'primeng/treetable';
import { catchError, finalize, Observable, of, throwError } from 'rxjs';

interface CustomConnectionStringData {
  data: CreateConnectionStringRequestDto;
  isEditing: boolean;
  prevConnectionString: string;
  validators: {
    connectionStringInvalid: boolean;
  };
}

@Component({
  selector: 'app-multi-tenancy-management',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    TableModule,
    ButtonModule,
    PageTitleModule,
    ResponsiveTableModule,
    RadioButtonModule,
    ToggleSwitchModule,
    InputTextModule,
    SelectModule,
    MultiSelectModule,
    DialogModule,
    TextareaModule,
    TooltipModule,
    TableCellsModule,
    SharedTableModule,
    PipesModule,
    RequiredMarkModule,
    TreeTableModule,
    InputGroupAddonModule,
    InputGroupModule,
    ProgressBarModule,
    InputNumberModule,
    TreeModule,
    CheckboxModule,
  ],
  templateUrl: './multi-tenancy-management.component.html',
  styleUrl: './multi-tenancy-management.component.css',
})
export class MultiTenancyManagementComponent implements OnInit {
  @Input()
  applicationId: string;
  @Input()
  applicationName: string;
  @Input()
  type: MenuType;
  useDedicatedDatabase: boolean = false;

  public update(): Observable<any> {
    if (this.rows.filter((r) => r.isEditing === true).length > 0) {
      this.messageService.error(
        'TenantManagement::ConnectionString:Update:Failed:FinishEditing'
      );
      return of({});
    }

    let rowsForUpdate = [];
    let success = 0;
    let fail = 0;
    let isValid = true;

    this.rows.forEach((row) => {
      if (this.checkIsUpdated(row)) {
        if (this.validateRow(row)) {
          rowsForUpdate.push(row);
        } else {
          isValid = false;
        }
      }
    });

    if (rowsForUpdate.length === 0) {
      return of({});
    }

    if (isValid) {
      this.loading = true;
      rowsForUpdate.forEach((row) => {
        const observable = this.applicationConnectionStringService
          .setConnectionString({
            tenantId: row.data.tenantId,
            applicationName: this.applicationName,
            connectionString: row.data.connectionString,
          })
          .pipe(
            finalize(() => (this.loading = false)),
            catchError((error) => {
              fail++;
              row.validators.connectionStringInvalid = true;
              this.onFinishUpdate(rowsForUpdate.length, success, fail);
              return throwError(() => error);
            })
          );
        observable.subscribe((_) => {
          success++;
          this.onFinishUpdate(rowsForUpdate.length, success, fail);
          row.prevConnectionString = row.data.connectionString;
        });
        return observable;
      });
    }
    return of({});
  }

  onFinishUpdate(count: number, success: number, fail: number) {
    if (success + fail >= count) {
      this.loading = false;
      if (fail > 0) {
        this.messageService.error(
          'TenantManagement::ConnectionStrings:Update:Failed',
          fail.toString(),
          count.toString()
        );
      } else {
        this.messageService.success(
          'TenantManagement::ConnectionStrings:Update:Success'
        );
      }
    }
  }

  loading: boolean = true;
  rowsCount: number = 10;
  get totalRecords() {
    return this.rows.length;
  }
  readonly: boolean = false;

  editingSomeRow = false;

  rows: CustomConnectionStringData[] = [];

  commonTenants: CommonTenantDto[] = [];
  getTenantName(tenantId?: string) {
    const res = !tenantId
      ? this.commonTenants.filter((t) => !t.id)
      : this.commonTenants.filter((t) => t.id === tenantId);
    return res.length > 0 ? res[0].name : '-';
  }

  constructor(
    private tenantService: ITenantService,
    private applicationConnectionStringService: ApplicationConnectionStringService,
    private messageService: LocalizedMessageService,
    private clientAppsService: ClientApplicationService
  ) {}

  ngOnInit(): void {
    this.clientAppsService.get(this.applicationId).subscribe((res) => {
      this.useDedicatedDatabase = res.useDedicatedDatabase;
    });
    this.loadConStrings();
  }

  refresh() {
    this.loading = true;
    this.loadConStrings();
  }

  tenantConString: {
    tenantId: string;
    connectionString: string;
    status: string;
  }[] = [];
  tenants: CommonTenantDto[] = [];

  private loadConStrings() {
    this.rows = [];
    this.tenantService
      .getCommonTenantList()
      .pipe(
        finalize(() => (this.loading = false)),
        catchError((error) => {
          this.messageService.error(
            'TenantManagement::ConnectionStrings:Load:Failed'
          );
          return throwError(() => error);
        })
      )
      .subscribe((res) => {
        this.commonTenants = res;
        this.rows = [];
        this.commonTenants.forEach((t) => {
          this.loading = true;
          this.applicationConnectionStringService
            .get(t.id, this.applicationName)
            .pipe(
              finalize(() => (this.loading = false)),
              catchError((error) => {
                this.messageService.error(
                  'TenantManagement::ConnectionStrings:Load:Failed'
                );
                return throwError(() => error);
              })
            )
            .subscribe((conString) => {
              this.rows = [
                ...this.rows,
                {
                  data: {
                    tenantId: t.id,
                    applicationName: this.applicationName,
                    connectionString: conString?.connectionString ?? '',
                  },
                  prevConnectionString: conString?.connectionString ?? '',
                  isEditing: false,
                  validators: {
                    connectionStringInvalid: false,
                  },
                },
              ].sort((r1, r2) =>
                r2.data.tenantId.localeCompare(r1.data.tenantId)
              );
            });
        });
      });
  }

  resetRowValidators(row: CustomConnectionStringData) {
    row.validators = {
      connectionStringInvalid: false,
    };
  }

  validateRow(row: CustomConnectionStringData) {
    let isValid = true;

    // if (!row.data.connectionString){
    //   this.messageService.error('TenantManagement::ConnectionString:Value:NotValid')
    //   row.validators.connectionStringInvalid = true;
    //   isValid = false;
    // }

    if (!isValid) {
      return isValid;
    }

    return isValid;
  }

  checkIsUpdated(row: CustomConnectionStringData) {
    if (row.data.connectionString) {
      return row.data.connectionString !== row.prevConnectionString;
    } else {
      return !!row.prevConnectionString;
    }
  }

  editRow(row: CustomConnectionStringData) {
    row.isEditing = !row.isEditing;
  }

  cancelEditRow(row: CustomConnectionStringData) {
    row.data.connectionString = row.prevConnectionString;
    row.isEditing = false;
  }

  useDedicated(useDedicatedDb: boolean) {
    this.loading = true;
    this.clientAppsService
      .useDedicatedDatabase(this.applicationId, useDedicatedDb)
      .pipe(
        finalize(() => (this.loading = false)),
        catchError((error) => {
          this.messageService.error(
            'TenantManagement::ConnectionString:UseDedicated:Failed'
          );
          return throwError(() => error);
        })
      )
      .subscribe((_) => {
        this.messageService.success(
          'TenantManagement::ConnectionString:UseDedicated:Success'
        );
      });
  }
}
