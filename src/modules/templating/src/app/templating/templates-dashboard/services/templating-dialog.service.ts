import { Injectable, TemplateRef } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { ActionTemplatesSelectionDialogComponent } from '../action-templates-selection-dialog/action-templates-selection-dialog';
import { TemplateService, TemplateType } from '@eleon/templating-proxy';
import { ILocalizationService, ITemplatingDialogService } from '@eleon/angular-sdk.lib';
import { CreateTemplateDialogComponent } from '../create-template-dialog/create-template-dialog.component'
import { CreateTemplateDialogHeaderComponent } from '../create-template-dialog/create-template-dialog-header.component'
import { Observable } from 'rxjs'

@Injectable({
  providedIn: 'root',
})
export class TemplatingDialogService extends ITemplatingDialogService {
  constructor(private dialogService: DialogService, private localizationService: ILocalizationService, private templateService: TemplateService) {
    super();
  }

  override openTemplateChosingDialog(onTemplateSelected: (template: any) => void): void {
    const ref = this.dialogService.open(ActionTemplatesSelectionDialogComponent, {
      header: this.localizationService.instant('Templating::ActionsLibrary:SelectTemplate'),
      width: '720px',
      data: {
        fixedType: TemplateType.Action,
      },
    });

    ref.onClose.subscribe((template) => {
      if (template) {
        onTemplateSelected(template);
      }
    });
  }

  override openCreateTemplateDialog(header: string, templateName: string | null, templateType, fixedType: any, onTemplateCreated: (template: any) => void): void {
    const ref = this.dialogService.open(CreateTemplateDialogComponent, {
      header: header,
      width: '720px',
      data: {
        fixedType: fixedType,
        templateType: templateType,
        createMode: true,
        templateName: templateName,
        isSystem: false,
        onCreate: onTemplateCreated,
      },
      templates: {
        header: CreateTemplateDialogHeaderComponent,
      }
    });

    ref.onClose.subscribe((template) => {
      if (template) {
        onTemplateCreated(template);
      }
    });
  }

  override loadPreviewTemplate(name: string, type: TemplateType): Observable<any> {
    return this.templateService.getByNameAndTypeByNameAndTypeAndCancellationToken(name, type);
  }
}

