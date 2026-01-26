import { AccountService } from './billing/module/controllers/account.service';
import { AccountMemberService } from './billing/module/controllers/account-member.service';
import { AccountPackageService } from './billing/module/controllers/account-package.service';
import { InvoiceService } from './billing/module/controllers/invoice.service';
import { PackageTemplateService } from './billing/module/controllers/package-template.service';

export const PROXY_SERVICES = [AccountService, AccountMemberService, AccountPackageService, InvoiceService, PackageTemplateService];