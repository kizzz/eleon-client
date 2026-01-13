import { IAuditDialogService, ILocalizationService } from '@eleon/angular-sdk.lib'
import { DialogService } from 'primeng/dynamicdialog';
import { AuditHistoryBoxComponent } from '../audit-history-box'
import { Injectable } from '@angular/core'



@Injectable({
	providedIn: 'root'
})
export class AuditDialogService extends IAuditDialogService {
  
  constructor(private dialogService: DialogService, private localizationService: ILocalizationService) {
    super();
    
  }

  override openAuditLog(docId: string, docType: string, onVersionSelected: (version: any) => void): void {
    this.dialogService.open(AuditHistoryBoxComponent, {
      header: this.localizationService.instant('Auditor::AuditLogs'),
      data: {
        documentId: docId,
        documentType: docType,
        onRecordSelected: onVersionSelected
      },
      width: '60vw'
    });
  }
}