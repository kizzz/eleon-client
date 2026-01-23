import { AccountService } from './accounting/module/controllers/account.service';
import { AccountMemberService } from './accounting/module/controllers/account-member.service';
import { AccountPackageService } from './accounting/module/controllers/account-package.service';
import { PackageTemplateService } from './accounting/module/controllers/package-template.service';

export const PROXY_SERVICES = [AccountService, AccountMemberService, AccountPackageService, PackageTemplateService];