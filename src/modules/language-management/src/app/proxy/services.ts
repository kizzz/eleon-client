import { LanguageService } from './language-management/module/controllers/language.service';
import { LocalizationOverrideService } from './language-management/module/controllers/localization-override.service';
import { TenantLocalizationService } from './language-management/module/controllers/tenant-localization.service';

export const PROXY_SERVICES = [LanguageService, LocalizationOverrideService, TenantLocalizationService];