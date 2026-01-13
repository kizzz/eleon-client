import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  contributeControls,
  PAGE_CONTROLS,
  PageControls,
} from '@eleon/primeng-ui.lib';
import { ILocalizationService, ITemplatingDialogService } from '@eleon/angular-sdk.lib';
import {
  MinimalTemplateDto,
  TextFormat,
  TemplateService,
  TemplateType,
} from '@eleon/templating-proxy';
import { LocalizedConfirmationService } from '@eleon/primeng-ui.lib';

enum TemplateDashboardPageKey {
  Notifications = 'notifications',
  ActionsLibrary = 'actionslibrary',
}

@Component({
  standalone: false,
  selector: 'app-templates-dashboard',
  templateUrl: './templates-dashboard.component.html',
  styleUrls: ['./templates-dashboard.component.scss'],
})
export class TemplatesDashboardComponent implements OnInit {
  title: string = '';
  createTitle: string = '';
  editTitle: string = '';
  templates: MinimalTemplateDto[] = [];
  loading = false;
  pageKey: TemplateDashboardPageKey = TemplateDashboardPageKey.Notifications;
  dialogVisible = false;
  editingTemplateName: string | null = null;
  editingTemplateType: TemplateType | null = null;

  @PageControls()
  controls = contributeControls([
    PAGE_CONTROLS.RELOAD({
      loading: () => this.loading,
      action: () => this.loadTemplates(),
      disabled: () => this.loading,
    }),
    PAGE_CONTROLS.ADD({
      loading: () => this.loading,
      action: () => this.onCreate(),
      disabled: () => this.loading,
    }),
  ]);

  constructor(
    private templateService: TemplateService,
    public localizationService: ILocalizationService,
    public router: Router,
    private confirmationService: LocalizedConfirmationService,
    private route: ActivatedRoute,
    private templateDialogService: ITemplatingDialogService
  ) {}

  ngOnInit(): void {
    this.route.data.subscribe((data) => {
      const key = data['titleKey'];
      const createKey = data['createTitleKey'];
      const editKey = data['editTitleKey'];
      this.createTitle = this.localizationService.instant(
        createKey ?? 'TemplatingModule::TemplatesDashboard:CreateTemplateTitle'
      );
      this.editTitle = this.localizationService.instant(
        editKey ?? 'TemplatingModule::TemplatesDashboard:EditTemplateTitle'
      );
      this.pageKey = data['pageKey'];
      const defaultKey = 'TemplatingModule::TemplatesDashboard:Title';
      this.title = this.localizationService.instant(key ?? defaultKey);
    });
    this.loadTemplates();
  }

  loadTemplates(): void {
    this.loading = true;
    this.templateService
      .getList({
        type: this.forcedTemplateType,
        skipCount: 0,
        maxResultCount: 100,
      })
      .subscribe({
        next: (result) => {
          this.templates = result?.items ?? [];
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });
  }

  getTemplateTypeName(type: TemplateType): string {
    return TemplateType[type];
  }

  getTemplateEngineName(format: TextFormat): string {
    return TextFormat[format];
  }

  onCreate(): void {
    this.editingTemplateName = null;
    this.editingTemplateType = this.forcedTemplateType;
    this.dialogVisible = true;

    this.templateDialogService.openCreateTemplateDialog(
      this.createTitle,
      this.editingTemplateName,
      this.editingTemplateType,
      this.forcedTemplateType,
      (template) => {
        this.onTemplateSaved();
        this.dialogVisible = false;
      }
    );
  }

  onEdit(template: MinimalTemplateDto): void {
    this.editingTemplateName = template?.name ?? null;
    this.editingTemplateType = template?.type ?? null;
    this.dialogVisible = true;

    this.templateDialogService.openCreateTemplateDialog(
      this.editTitle,
      this.editingTemplateName,
      this.editingTemplateType,
      this.forcedTemplateType,
      (template) => {
        this.onTemplateSaved();
        this.dialogVisible = false;
      }
    );
  }

  onRowClick(template: MinimalTemplateDto | null | undefined): void {
    if (!template) {
      return;
    }

    this.onEdit(template);
  }

  onDelete(template: MinimalTemplateDto): void {
    if (this.loading || !template?.id) {
      return;
    }

    this.confirmationService.confirm(
      'Templating::Templates:DeleteConfirmationMessage',
      () => {
        this.loading = true;
        this.templateService.delete(template.id).subscribe({
          next: () => this.loadTemplates(),
          error: () => {
            this.loading = false;
          },
        });
      }
    );
  }

  onTemplateSaved(): void {
    this.loadTemplates();
  }

  onDialogVisibleChange(visible: boolean): void {
    this.dialogVisible = visible;
    if (!visible) {
      this.editingTemplateName = null;
      this.editingTemplateType = null;
    }
  }

  get forcedTemplateType(): TemplateType {
    return this.pageKey === TemplateDashboardPageKey.Notifications
      ? TemplateType.Notification
      : TemplateType.Action;
  }
  async copyId(id: string, event: MouseEvent) {
    if (!id) return;

    await navigator.clipboard.writeText(id);
  }
}
