import { AuditLogService } from '@eleon/system-log-proxy';
import { AuditLogDto } from '@eleon/system-log-proxy';
import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { Component, ContentChild, Input, OnInit, TemplateRef} from '@angular/core';
import { DocumentTemplateType } from '@eleon/primeng-ui.lib';

@Component({
  standalone: false,
  selector: 'app-audit-log-details',
  templateUrl: './audit-log-details.component.html',
  styleUrls: ['./audit-log-details.component.scss']
})

export class AuditLogDetailsComponent implements OnInit{
  loading: boolean = false;
  display: boolean = false;
  title: string;
  details: AuditLogDto;
  templateType: DocumentTemplateType = DocumentTemplateType.Json;

  ngOnInit(): void {
    return;
  }

  constructor(
    private auditLogService: AuditLogService,
    private localizationService: ILocalizationService
  ) {
    this.title = this.localizationService.instant('Infrastructure::RequestLog:Details');
  }

  get isMobile() {
    return window.screen.width < 1089;
  }

  showDialog(auditLogId: string) {
    this.display = true;
    this.loadDetails(auditLogId);
  }

  loadDetails(auditLogId: string) {
    this.loading = true;
    this.auditLogService.getAuditLogByIdById(auditLogId)
    .subscribe(data => {
      this.details = data;
      this.loading = false;
    })
  }

  getSeverity(code: number){
    if (code >= 100 && code <= 199) {
      return 'primary';
    } else if (code >= 200 && code <= 299) {
      return 'success';
    }  else if (code >= 300 && code <= 399) {
      return 'warning';
    } else{
      return 'danger';
    }
  }

  getSeverityForMethod(method: string){
    if (method === 'GET') {
      return 'primary';
    } else{
      return 'warning';
    }
  }

  isMobileVersion(): boolean {
    return window.innerWidth <= 576;
  }
}
