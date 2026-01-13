import { Component, ContentChild, EventEmitter, Input, Output, TemplateRef } from '@angular/core';

import { ExternalLinkLoginType, externalLinkLoginTypeOptions } from '@eleon/file-manager-proxy';
import { LinkShareStatus } from '@eleon/file-manager-proxy';
import { LocalizedMessageService } from '@eleon/primeng-ui.lib';

import { ILocalizationService } from '@eleon/angular-sdk.lib';
export interface FileReviewerExternalPrivateOptions {
  externalPrivateType: ExternalLinkLoginType;
  key: string;
}

@Component({
  standalone: false,
  selector: 'app-file-share-management-external-private',
  templateUrl: './file-share-management-external-private.component.html',
  styleUrls: ['./file-share-management-external-private.component.scss']
})
export class FileShareManagementExternalPrivateComponent {

  fileReviewerExternalPrivateTypeOptions = externalLinkLoginTypeOptions;

  @Input()
  externalPrivateType: ExternalLinkLoginType = ExternalLinkLoginType.Password;
  @Input()
  key: string = "";
  visible = false;

  @Output()
  // TODO: change to ExternalLinkDto
  selectionEvent = new EventEmitter<any>();
  @Input()
  public beforeButton: TemplateRef<any>;
  @Input()
  tooltip: string;
  @ContentChild(TemplateRef)
  public button: TemplateRef<any>;
  
  constructor(
    public localizationService: ILocalizationService,
    public messageService: LocalizedMessageService,
  ) {

  }

  show() {
    this.visible = true;
  }

  select() {
    if (!this.validateExternalPrivateType(this.key, this.externalPrivateType)) {
      this.messageService.error('FileManager::'+ ExternalLinkLoginType[this.externalPrivateType] + ':Invalid')
      return;
    }

    this.selectionEvent.emit({
      loginType: this.externalPrivateType,
      loginKey: this.key,
      loginAttempts: 0,
      status: LinkShareStatus.Active,
      isOneTimeLink: false,
    });
    this.visible = false;
  }

  
  get prefix() {
    return {
    [ExternalLinkLoginType.Email]: this.localizationService.instant('FileManager::ExternalPrivate:Email'),
    [ExternalLinkLoginType.Sms]: this.localizationService.instant('FileManager::ExternalPrivate:Sms'),
    [ExternalLinkLoginType.Password]: this.localizationService.instant('FileManager::ExternalPrivate:Password'),
    }[this.externalPrivateType]
  }

  validateExternalPrivateType(value: string, type: ExternalLinkLoginType): boolean {
    switch (type) {
      case ExternalLinkLoginType.Sms:
        return this.validatePhoneNumber(value);
      case ExternalLinkLoginType.Email:
        return this.validateEmail(value);
      case ExternalLinkLoginType.Password:
        // Implement password validation logic if needed
        return true; // Placeholder for password validation
      default:
        return false; // Invalid type
    }
  }

  private validatePhoneNumber(phoneNumber: string): boolean {
    // Implement phone number validation logic
    // Return true if valid, false otherwise
    // Example: Simple validation for demonstration
    const phoneRegex = /^\+[0-9]{8,15}$/; // Assuming 15-digit phone number
    return phoneRegex.test(phoneNumber);
  }

  private validateEmail(email: string): boolean {
    // Implement email validation logic
    // Return true if valid, false otherwise
    // Example: Simple validation for demonstration
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailRegex.test(email);
  }
}
