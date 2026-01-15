import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Optional,
  Output,
  SimpleChanges,
} from '@angular/core';
import { LocalizedMessageService } from '@eleon/primeng-ui.lib';
import { TextFormat, textFormatOptions } from '@eleon/templating-proxy';
import { CreateUpdateTemplateDto, TemplateDto, TemplateService, TemplateType, templateTypeOptions } from '@eleon/templating-proxy';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog'

interface TemplateValidators {
  nameEmpty: boolean;
  templateIdEmpty: boolean;
  templateContentEmpty: boolean;
}

@Component({
  standalone: false,
  selector: 'app-create-template-dialog',
  templateUrl: './create-template-dialog.component.html',
  styleUrls: ['./create-template-dialog.component.scss'],
})
export class CreateTemplateDialogComponent implements OnChanges {
  @Input() visible = false;
  @Input() header = '';
  @Input() templateName: string | null = null;
  @Input() templateType: TemplateType | null = null;
  @Input() fixedType?: TemplateType;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() saved = new EventEmitter<TemplateDto>();

  requiredPlaceholders: string[] = [];
  missingRequiredPlaceholders: string[] = [];
  loading = false;
  validators: TemplateValidators = { nameEmpty: false, templateContentEmpty: false, templateIdEmpty: false };

  private readonly baseTemplateFormatItems = textFormatOptions.map((opt) => ({
    label: opt.key,
    value: opt.value,
  }));

  private loadedTemplateId: string | null = null;
  form: CreateUpdateTemplateDto = this.createEmptyForm(TemplateType.Notification);

  templateTypeItems = templateTypeOptions.map((opt) => ({
    label: opt.key,
    value: opt.value,
  }));

  templateFormatItems = this.buildTemplateFormatItems(this.form.type);
  TemplateType = TemplateType;

  constructor(
    private templateService: TemplateService,
    public messageService: LocalizedMessageService,
    @Optional() private dialogConfig: DynamicDialogConfig,
    @Optional() private dialogRef?: DynamicDialogRef
  ) {
    if (this.dialogConfig) {
      this.header = this.dialogConfig.header || this.header;
      this.templateName = this.dialogConfig.data?.templateName || this.templateName;
      this.fixedType = this.dialogConfig.data?.fixedType === TemplateType.Action  ? this.dialogConfig.data.fixedType : this.fixedType;
      this.templateType = this.dialogConfig.data?.templateType || this.templateType;
      this.initializeForm();
      if (this.dialogConfig.data?.onCreate && typeof this.dialogConfig.data.onCreate === 'function') {
        this.saved.subscribe(this.dialogConfig.data.onCreate);
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    const shouldInitialize =
      (changes['visible'] && this.visible) ||
      (changes['templateName'] && this.visible) ||
      (changes['templateType'] && this.visible) ||
      (changes['fixedType'] && this.visible);

    if (shouldInitialize) {
      this.initializeForm();
    }
  }

  get dialogTitle(): string {
    if (this.header) {
      return this.header;
    }
    return this.loadedTemplateId
      ? 'Templating::EditTemplate'
      : 'Templating::CreateTemplate';
  }

  onVisibleChange(event: boolean): void {
    if (!event) {
      this.loading = false;
    }
    this.visibleChange.emit(event);
  }

  onCancel(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
      return;
    }

    this.visibleChange.emit(false);
  }

  onSave(): void {
    if (this.loading) {
      return;
    }

    if (!this.validateForm()) {
      return;
    }

    this.loading = true;

    const payload: CreateUpdateTemplateDto = {
      name: this.form.name?.trim() ?? '',
      type: this.fixedType === TemplateType.Action ? this.fixedType : this.form.type,
      templateId: this.form.templateId?.trim() ?? '',
      format: this.form.format,
      templateContent: this.form.templateContent ?? '',
      requiredPlaceholders: this.form.requiredPlaceholders || undefined,
      isSystem: !!this.form.isSystem,
    };

    const request$ = this.loadedTemplateId && !this.isGuidEmpty(this.loadedTemplateId)
      ? this.templateService.update(this.loadedTemplateId, payload)
      : this.templateService.create(payload);

    request$.subscribe({
      next: (result) => {
        this.loading = false;
        this.saved.emit(result);
        if (this.dialogRef) {
          this.dialogRef.close(result);
        } else {
          this.visibleChange.emit(false);
        }
        const successKey = this.loadedTemplateId
          ? 'Templating::TemplateUpdatedSuccessfully'
          : 'Templating::TemplateCreatedSuccessfully';
        this.messageService.success(successKey);
      },
      error: (err) => {
        this.loading = false;
        const message = JSON.parse(err?.message)?.error?.message;
        const errorKey = this.loadedTemplateId
          ? 'Templating::TemplateUpdateFailed'
          : 'Templating::TemplateCreationFailed';
        this.messageService.error(message || errorKey);
      },
    });
  }

  onReset(): void {
    if (this.loading || !this.form?.isSystem) {
      return;
    }

    this.loading = true;
    this.templateService.reset({
      name: this.form.name,
      type: this.form.type,
    }).subscribe({
      next: (template) => {
        const oldTemplateId = this.loadedTemplateId; 
        this.setFormFromTemplate(template);
        this.loadedTemplateId = oldTemplateId;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  private resetValidators(): void {
    this.validators = { nameEmpty: false, templateContentEmpty: false, templateIdEmpty: false };
    this.missingRequiredPlaceholders = [];
  }

  private initializeForm(): void {
    this.resetValidators();
    this.loadedTemplateId = null;

    if (this.templateName) {
      this.setFormFromTemplate(null);
      const typeToLoad =
        this.templateType ?? this.fixedType ?? this.form.type ?? TemplateType.Notification;
      this.loadTemplate(this.templateName, typeToLoad);
      return;
    }

    this.setFormFromTemplate(null);
  }

  private loadTemplate(name: string, type: TemplateType): void {
    this.loading = true;
    this.templateService
      .getByNameAndTypeByNameAndTypeAndCancellationToken(name, type)
      .subscribe({
      next: (template) => {
        this.setFormFromTemplate(template);
        this.loadedTemplateId = template?.id ?? null;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.error('Templating::TemplateLoadFailed');
      },
    });
  }

  private setFormFromTemplate(source: TemplateDto | null): void {
    this.loadedTemplateId = source?.id ?? null;
    const type = this.fixedType ?? source?.type ?? TemplateType.Notification;
    this.templateFormatItems = this.buildTemplateFormatItems(type);

    this.form = {
      name: source?.name ?? '',
      type,
      format:
        source?.format ??
        this.templateFormatItems[0]?.value ??
        TextFormat.Plaintext,
      templateContent: source?.templateContent ?? '',
      templateId: source?.templateId ?? '',
      requiredPlaceholders: source?.requiredPlaceholders ?? '',
      isSystem: source?.isSystem ?? false,
    };

    this.requiredPlaceholders = this.form.requiredPlaceholders
      ? this.form.requiredPlaceholders
          .split(';')
          .map((ph) => ph.trim())
          .filter((ph) => ph.length > 0)
      : [];
    this.missingRequiredPlaceholders = [];
  }

  private buildTemplateFormatItems(type: TemplateType) {
    const items = this.baseTemplateFormatItems;

    if (type === TemplateType.Notification) {
      return items.filter(
        (item) =>
          item.value === TextFormat.Plaintext ||
          item.value === TextFormat.Scriban
      );
    }

    if (type === TemplateType.Action) {
      return items.filter(
        (item) =>
          item.value === TextFormat.Json ||
          item.value === TextFormat.Plaintext
      );
    }

    return items;
  }

  private createEmptyForm(type: TemplateType): CreateUpdateTemplateDto {
    return {
      name: '',
      type,
      format: TextFormat.Plaintext,
      templateContent: '',
      requiredPlaceholders: '',
      templateId: '',
      isSystem: false,
    };
  }
  async copyId(id: string) {
    if (!id) return;

    await navigator.clipboard.writeText(id);
    this.messageService.success('Templating::PlaceholderCopied');
  }

  private validateForm(): boolean {
    const errors: string[] = [];
    this.missingRequiredPlaceholders = [];

    this.form.name = this.form.name?.trim() ?? '';
    this.form.templateContent = this.form.templateContent?.trim() ?? '';

    if (!this.form.name) {
      this.validators.nameEmpty = true;
      errors.push('Templating::TemplateNameEmpty');
    }

    if (this.form.type === TemplateType.Action) {
      if (!this.form.templateId) {
        this.validators.templateIdEmpty = true;
        errors.push('Templating::TemplateIdEmpty');
      }
    }

    if (!this.form.templateContent) {
      this.validators.templateContentEmpty = true;
      errors.push('Templating::TemplateContentEmpty');
    }

    const missingPlaceholders = this.requiredPlaceholders.filter(
      (placeholder) =>
        placeholder && !this.form.templateContent.includes(placeholder)
    );

    if (missingPlaceholders.length > 0) {
      this.missingRequiredPlaceholders = missingPlaceholders;
      errors.push('Templating::TemplateContentMissingPlaceholders');
    }

    if (errors.length === 0) {
      this.resetValidators();
      return true;
    }

    errors.forEach((err) => this.messageService.error(err));
    return false;
  }
  private isGuidEmpty(guid: string): boolean {
    const emptyGuid = '00000000-0000-0000-0000-000000000000';
    return guid === emptyGuid;
  }

  isPlaceholderMissing(placeholder: string): boolean {
    return this.missingRequiredPlaceholders.includes(placeholder);
  }
}
