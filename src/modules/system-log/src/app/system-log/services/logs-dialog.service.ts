import { ILocalizationService, ILogsDialogService } from '@eleon/angular-sdk.lib';

import { DialogService } from 'primeng/dynamicdialog';
import { Injectable } from '@angular/core'
import { AuditLogsTableComponent } from '../audit-logs-table/audit-logs-table.component'
import { UserSecurityLogsComponent } from '../security-logs/user-security-logs.component'
import { EntityChangesTableComponent } from '../entity-changes-table/entity-changes-table.component'


@Injectable({
	providedIn: 'root'
})
export class LogsDialogService extends ILogsDialogService {
  constructor(
    private dialogService: DialogService, 
    private localizationService: ILocalizationService
  ) {
    super();
}

  override openSecurityLogs(userId?: string): void {
    this.dialogService.open(UserSecurityLogsComponent, {
      header: this.localizationService.instant('Infrastructure::SecurityLogs'),
      closable: true,
      focusOnShow: false,
      data: {
        userId: userId,
        rowsCount: 10,
        minifiedFilters: true
      },
      width: '60%'
    });
  }

  override openAuditLogs(userId?: string): void {
    this.dialogService.open(AuditLogsTableComponent, {
      header: this.localizationService.instant('Auditor::AuditLogs'),
      data: {
        userId: userId,
        rowsCount: 10,
        minifiedFilters: true
      },
      width: '60%'
    });
  }

  override openEntityChanges(): void {
    this.dialogService.open(EntityChangesTableComponent, {
      header: this.localizationService.instant('Infrastructure::RequestLogs'),
      data: {
        
      },
      width: '60%'
    });
  }
}