import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { LocalizationOverrideService } from '@eleon/language-management-proxy';
import { LanguageInfoDto } from '@eleon/language-management-proxy';
import { OverriddenLocalizationStringDto } from '@eleon/language-management-proxy';
import { Observable, finalize } from "rxjs";
import { LocalizedMessageService } from "@eleon/primeng-ui.lib";
import { PageStateService } from "@eleon/primeng-ui.lib";
import {
  ValidationRuleSet,
  ValidationService,
  createValidationState,
} from "@eleon/primeng-ui.lib";

type ValueOverridesValidators = {
  base: boolean;
  target: boolean;
};

interface ValueOverrides {
  resetTarget: boolean;
  base: string;
  target: string;
  validators: ValueOverridesValidators;
}

const ValueOverridesValidationRules: ValidationRuleSet<
  ValueOverrides,
  ValueOverridesValidators
> = {
  base: {
    validator: (x) => !!x.base?.length,
    message:
      "LanguageManagement::LocalizationEntryOverride:Errors:BaseValueRequired",
  },
  target: {
    validator: (x) => !!x.target?.length || x.resetTarget,
    message:
      "LanguageManagement::LocalizationEntryOverride:Errors:TargetValueRequired",
  },
};

@Component({
  standalone: false,
  selector: "app-localization-entry-edit-dialog",
  templateUrl: "./localization-entry-edit-dialog.component.html",
  styleUrls: ["./localization-entry-edit-dialog.component.scss"],
})
export class LocalizationEntryEditDialogComponent {
  public showDialog: boolean = false;
  public entry: OverriddenLocalizationStringDto;
  public baseLanguage: string;
  public baseLanguageName: string;
  public baseLanguageIcon: string;
  public targetLanguage: string;
  public targetLanguageName: string;
  public targetLanguageIcon: string;
  public overrides: ValueOverrides;
  public saving: boolean = false;
  public reseting: boolean = false;

  public get title(): string {
    if (!this.entry) {
      return "";
    }

    return this.localizationService.instant(
      "LanguageManagement::EditLocalizationEntry",
      this.entry.key
    );
  }

  @Output()
  public saved = new EventEmitter<void>();

  constructor(
    private localizationService: ILocalizationService,
    private localizationOverrideService: LocalizationOverrideService,
    private validationService: ValidationService,
    private msgService: LocalizedMessageService,
    public state: PageStateService
  ) {}

  public show(
    entry: OverriddenLocalizationStringDto,
    baseLanguage: string,
    targetLanguage: string,
    languages: LanguageInfoDto[]
  ): void {
    this.entry = entry;
    this.showDialog = true;

    this.baseLanguage = baseLanguage;
    this.baseLanguageIcon = baseLanguage;
    this.baseLanguage = languages.find(
      (x) => x.cultureName === baseLanguage
    ).displayName;

    this.targetLanguageIcon = targetLanguage;
    this.targetLanguage = targetLanguage;
    this.targetLanguageName = languages.find(
      (x) => x.cultureName === targetLanguage
    ).displayName;

    this.overrides = {
      resetTarget: false,
      base: entry.base,
      target: entry.target,
      validators: createValidationState(ValueOverridesValidationRules),
    };
  }

  public cancel(): void {
    this.showDialog = false;
    this.baseLanguage = null;
    this.baseLanguageIcon = null;
    this.baseLanguageName = null;
    this.targetLanguage = null;
    this.targetLanguageIcon = null;
    this.targetLanguageName = null;
    this.entry = null;
    this.overrides = null;
  }

  public resetTarget(): void {
    if (
      !this.validationService.validate(
        ValueOverridesValidationRules,
        this.overrides
      )
    ) {
      return;
    }

    this.overrides.resetTarget = true;
    this.overrides.target = "";

    this.reseting = true;
    this.saveInternal()
      .pipe(finalize(() => (this.reseting = false)))
      .subscribe(() => {
        this.saved.emit();
      });
  }

  public save(): void {
    if (
      !this.validationService.validate(
        ValueOverridesValidationRules,
        this.overrides
      )
    ) {
      return;
    }

    this.saving = true;
    this.saveInternal()
      .pipe(finalize(() => (this.saving = false)))
      .subscribe(() => {
        this.saved.emit();
        this.msgService.success('LanguageManagement::LocalizationEntryOverride:SaveSuccess');
      });
  }

  private saveInternal(): Observable<boolean> {
    return this.localizationOverrideService
      .overrideLocalizationEntryByRequest({
        key: this.entry.key,
        cultureName: this.targetLanguage,
        newValue: this.overrides.target,
        resourceName: this.entry.resource,
      })
      .pipe(
        finalize(() => {
          this.showDialog = false;
        })
      );
  }
}
