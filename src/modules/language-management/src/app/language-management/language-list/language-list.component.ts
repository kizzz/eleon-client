import { Component, OnInit } from "@angular/core";
import { LanguageService } from '@eleon/language-management-proxy';
import { LanguageDto } from '@eleon/language-management-proxy';
import { finalize } from "rxjs";

@Component({
  standalone: false,
  selector: "app-language-list",
  templateUrl: "./language-list.component.html",
  styleUrls: ["./language-list.component.scss"],
})
export class LanguageListComponent implements OnInit {
  public languages: LanguageDto[];
  public loading = true;
  public defaultLanguage: LanguageDto;

  constructor(private languageService: LanguageService) {}

  public ngOnInit(): void {
    this.loading = true;
    this.languageService
      .getLanguageList()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((languages) => {
        this.languages = languages;
        this.defaultLanguage = languages.find((l) => l.isDefault);
      });
  }

  public onDefaultLanguageChange(language?: LanguageDto): void {
    if (!language) {
      return;
    }

    this.loading = true;
    this.languageService
      .setDefaultLanguageByLanguageId(language.id)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(() => {
        for (const language of this.languages) {
          language.isDefault = false;
        }

        language.isDefault = true;
      });
  }

  public onLanguageEnabledChange(language: LanguageDto, isEnabled: boolean): void {
    this.loading = true;
    this.languageService
      .setLanguageEnabledByRequest({
        languageId: language.id,
        isEnabled: language.isEnabled,
      })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe();
  }
}
