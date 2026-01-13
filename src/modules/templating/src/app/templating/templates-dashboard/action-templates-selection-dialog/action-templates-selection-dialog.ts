import { Component, OnInit } from '@angular/core';
import { LocalizedMessageService } from '@eleon/primeng-ui.lib';
import { MinimalTemplateDto, TemplateService, TemplateType, TextFormat } from '@eleon/templating-proxy';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  standalone: false,
  selector: 'app-action-templates-selection-dialog',
  templateUrl: './action-templates-selection-dialog.component.html',
  styleUrls: ['./action-templates-selection-dialog.component.scss'],
})
export class ActionTemplatesSelectionDialogComponent implements OnInit {
  templates: MinimalTemplateDto[] = [];
  loading = false;
  fixedType?: TemplateType;

  constructor(
    private templateService: TemplateService,
    public messageService: LocalizedMessageService,
    private dialogRef: DynamicDialogRef,
    private dialogConfig: DynamicDialogConfig
  ) {}

  ngOnInit(): void {
    this.fixedType = this.dialogConfig?.data?.fixedType ?? TemplateType.Action;
    this.loadTemplates();
  }

  getTemplateTypeName(type: TemplateType): string {
    return TemplateType[type];
  }

  getTemplateEngineName(format: TextFormat): string {
    return TextFormat[format];
  }

  onSelect(template: MinimalTemplateDto): void {
    if (!template?.id) {
      return;
    }
    this.loading = true;
    this.templateService.getByNameAndTypeByNameAndTypeAndCancellationToken(template.name, template.type).subscribe({
      next: (result) => {
        this.loading = false;
        this.dialogRef.close(result);
      },
      error: () => {
        this.loading = false;
        this.messageService.error('Templating::TemplateLoadFailed');
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private loadTemplates(): void {
    this.loading = true;
    this.templateService
      .getList({
        type: this.fixedType,
        skipCount: 0,
        maxResultCount: 200,
      })
      .subscribe({
        next: (result) => {
          this.templates = result?.items ?? [];
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.messageService.error('Templating::TemplateLoadFailed');
        },
      });
  }
}
