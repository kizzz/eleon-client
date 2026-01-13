import { AccountService } from './accounting/module/controllers/account.service';
import { BillingInformationService } from './accounting/module/controllers/billing-information.service';
import { PackageTemplateService } from './accounting/module/controllers/package-template.service';

export const PROXY_SERVICES = [AccountService, BillingInformationService, PackageTemplateService];