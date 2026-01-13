import { Component, OnInit } from "@angular/core";
import {
  NotificatorSettingsService,
  NotificatorSettingsDto,
  SendTestEmailInputDto,
  SystemLogLevel,
} from '@eleon/notificator-proxy';

import { Observable, finalize, map } from "rxjs";
import { PageStateService } from "@eleon/primeng-ui.lib";
import { LocalizedMessageService } from "@eleon/primeng-ui.lib";
import { ILocalizationService, ITemplatingDialogService, TemplateType } from '@eleon/angular-sdk.lib';

@Component({
  standalone: false,
  selector: "app-email-settings",
  templateUrl: "./email-settings.component.html",
  styleUrl: "./email-settings.component.scss",
})
export class EmailSettingsComponent implements OnInit {
  
  public settings: NotificatorSettingsDto;
  public loading = false;
  testEmailInput: SendTestEmailInputDto;
  showTestEmailDialog = false;
  senderEmailAddressEmpty = false;
  targetEmailAddressEmpty = false;
  subjectEmpty = false;
  title = 'TenantManagement::TenantSettings:NotificationSettings';

  emailTemplateContent = '';
  telegramTemplateContent = '';
  templateDialogVisible = false;
  templateDialogName: string | null = null;
  templateDialogType: TemplateType | null = null;
  templateDialogHeader = '';

  serverTypes = [];
  logLevels = [];

  constructor(
    private settingsService: NotificatorSettingsService,
    public state: PageStateService,
    private msgService: LocalizedMessageService,
    private localizationService: ILocalizationService,
    private templateDialogService: ITemplatingDialogService
  ) {}

  ngOnInit(): void {

    this.serverTypes = [
      { name: this.localizationService.instant('NotificatorModule::ServerType:Smtp'), value: 'smtp' },
      { name: this.localizationService.instant('NotificatorModule::ServerType:AzureEws'), value: 'azureews' },
    ];

    this.logLevels = [
      { name: this.localizationService.instant('NotificatorModule::SystemLogLevel:Information'), value: SystemLogLevel.Info },
      { name: this.localizationService.instant('NotificatorModule::SystemLogLevel:Warning'), value: SystemLogLevel.Warning },
      // { name: this.localizationService.instant('NotificatorModule::SystemLogLevel:Error'), value: SystemLogLevel.Error },
      { name: this.localizationService.instant('NotificatorModule::SystemLogLevel:Critical'), value: SystemLogLevel.Critical },
    ];

    this.loadSettings().subscribe();
    this.loadTemplatePreviews();
  }

  public save(): Observable<void> {
    return this.settingsService.update(
      this.settings
    );
  }

  public reset(): Observable<void> {
    return this.loadSettings();
  }

  private loadSettings(): Observable<void> {
    this.loading = true;
    return this.settingsService
      .get()
      .pipe(finalize(() => (this.loading = false)))
      .pipe(
        map((settings) => {
          this.settings = settings;
          
          // Initialize generalSettings if not present
          if (!this.settings.generalSettings) {
            this.settings.generalSettings = {
              systemEmails: [],
              minLogLevel: SystemLogLevel.Critical,
              sendErrors: false,
              templateType: 'PlainText'
            };
          }
          
          // Initialize azureEws settings if not present  
          if (!this.settings.azureEws) {
            this.settings.azureEws = {
              traceEnabled: false,
              ignoreServerCertificateErrors: false,
              ewsScopes: []
            };
          }
          
          // Initialize telegram settings if not present
          if (!this.settings.telegram) {
            this.settings.telegram = {
              enabled: false,
              minLogLevel: SystemLogLevel.Critical,
              templateType: 'PlainText'
            };
          }
        })
      );
  }

  public openTestEmailDialog(): void {
    this.testEmailInput ={
      senderEmailAddress: this.settings.smtpSettings.defaultFromAddress,
      subject: 'Test email',
      targetEmailAddress: '',
      body: 'Test email body message here'
    };

    this.showTestEmailDialog = true;
  }

  closeTestEmailDialog(): void {
    this.showTestEmailDialog = false;
    this.testEmailInput = null;
    this.senderEmailAddressEmpty = false;
    this.targetEmailAddressEmpty = false;
    this.subjectEmpty = false;
  }

  testEmailDialogVisibleChange(event: boolean): void {
    if(!event){
      this.closeTestEmailDialog();
    }
  }

  resetValidators(): void {
    this.senderEmailAddressEmpty = false;
    this.targetEmailAddressEmpty = false;
    this.subjectEmpty = false;
  }

  sendTestEmail(): void {
    if(!this.testEmailInput.senderEmailAddress?.length){
      this.msgService.error('TenantManagement::SendTestEmail:SenderEmailAddressEmpty');
      this.senderEmailAddressEmpty = true;
    }
    if(!this.testEmailInput.targetEmailAddress?.length){
      this.msgService.error('TenantManagement::SendTestEmail:TargetEmailAddressEmpty');
      this.targetEmailAddressEmpty = true;
    }
    if(!this.testEmailInput.subject?.length){
      this.msgService.error('TenantManagement::SendTestEmail:SubjectEmpty');
      this.subjectEmpty = true;
    }
    if(this.senderEmailAddressEmpty || this.targetEmailAddressEmpty || this.subjectEmpty){
      return;
    }

    this.loading = true;
    this.settingsService.sendCustomTestEmail(this.testEmailInput)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (reply) => {
          if(reply?.length > 0){
            this.msgService.error(reply);
            return;
          }
          this.closeTestEmailDialog();
          this.msgService.success('TenantManagement::SendTestEmail:Success');
        },
        error: (err) => {
          this.msgService.error(err.error.error.message);
        }
      });
  }
  
  public openEmailTemplateDialog(): void {
    this.templateDialogName = 'Notification Email';
    this.templateDialogType = TemplateType.Notification;
    this.templateDialogHeader = this.localizationService.instant('TenantManagement::EditSystemEmailTemplate');
    this.templateDialogVisible = true;

    this.templateDialogService.openCreateTemplateDialog(this.templateDialogHeader, this.templateDialogName, this.templateDialogType, this.templateDialogType, (template) => {
      this.onTemplateSaved(template);
      this.templateDialogVisible = false;
    });
  }
  
  public openTelegramTemplateDialog(): void {
    this.templateDialogName = 'Notification Telegram';
    this.templateDialogType = TemplateType.Notification;
    this.templateDialogHeader = this.localizationService.instant('TenantManagement::EditTelegramTemplate');
    this.templateDialogVisible = true;

    this.templateDialogService.openCreateTemplateDialog(this.templateDialogHeader, this.templateDialogName, this.templateDialogType, this.templateDialogType, (template) => {
      this.onTemplateSaved(template);
      this.templateDialogVisible = false;
    });
  }

  onTemplateDialogVisibleChange(event: boolean): void {
    this.templateDialogVisible = event;
    if (!event) {
      this.templateDialogName = null;
      this.templateDialogType = null;
      this.templateDialogHeader = '';
    }
  }

  onTemplateSaved(_: any): void {
    this.loadTemplatePreviews();
  }

  private loadTemplatePreviews(): void {
    this.loadTemplate('Notification Email', TemplateType.Notification)
      .subscribe({
        next: (template) => this.emailTemplateContent = template?.templateContent ?? '',
        error: () => this.emailTemplateContent = ''
      });

    this.loadTemplate('Notification Telegram', TemplateType.Notification)
      .subscribe({
        next: (template) => this.telegramTemplateContent = template?.templateContent ?? '',
        error: () => this.telegramTemplateContent = ''
      });
  }

  private loadTemplate(name: string, type: TemplateType): Observable<any> {
    return this.templateDialogService.loadPreviewTemplate(name, type);
  }
}
