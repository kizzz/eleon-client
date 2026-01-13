import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { DatePipe } from "@angular/common";
import { Component, Input, OnInit } from "@angular/core";
import { DocumentVersionEntity } from '@eleon/auditor-proxy';

@Component({
  standalone: false,
  selector: "app-audit-version-warning",
  templateUrl: "./audit-version-warning.component.html",
  styleUrls: ["./audit-version-warning.component.scss"],
})
export class AuditVersionWarningComponent implements OnInit {
  @Input()
  version: DocumentVersionEntity;

  @Input()
  isArchive: boolean;

  public get warningMessage(): string {
    const key = this.isArchive
      ? "Auditor::ArchiveMessage"
      : "Auditor::VersionOutdatedMessage";
      
    return this.localizationService.instant(
      key,
      this.version.version,
      this.createdByMessage,
      this.datePipe.transform(this.version.createdAt, "medium")
    );
  }

  public get severity(): string {
    return this.isArchive ? "warn" : "error";
  }

  private get createdByMessage(): string {
    return (
      this.version.createdByUserName ||
      this.localizationService.instant(
        "Auditor::DocumentVersion:CreatedByNobody"
      )
    );
  }

  constructor(
    private localizationService: ILocalizationService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {}
}
