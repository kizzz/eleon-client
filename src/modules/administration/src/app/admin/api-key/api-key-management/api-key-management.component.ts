import { LazyLoadEvent } from "primeng/api";
import { Component, OnInit, ViewChild } from "@angular/core";
import {
  ApiKeyService,
  ApiKeyType,
  IdentityApiKeyDto,
} from '@eleon/tenant-management-proxy';
import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { LocalizedConfirmationService, LocalizedMessageService } from '@eleon/primeng-ui.lib'; 
import { ActivatedRoute, Router } from "@angular/router";
import { finalize } from 'rxjs'
import { contributeControls, PageControls } from '@eleon/primeng-ui.lib'
import { PermissionManagementComponent } from '../../identity-extended/permission-management/permission-management.component';
import { ILogsDialogService } from '@eleon/angular-sdk.lib';

function getDateByYear(year: number) : Date{
	const currentDate = new Date();
	return new Date(currentDate.getFullYear() + year, currentDate.getMonth(), currentDate.getDate());
}

@Component({
  standalone: false,
  selector: "app-api-key-management",
  templateUrl: "./api-key-management.component.html",
  styleUrls: ["./api-key-management.component.scss"],
})
export class ApiKeyManagementComponent implements OnInit {
  title: string;
  apiKeys: IdentityApiKeyDto[] = [];
  loading: boolean = true;

	isCreating: boolean = false;
	selectedApiKey: IdentityApiKeyDto | null = null;
	isExpiredKey: boolean = false;
	expiresDate = getDateByYear(1);
	minDate = new Date();
	maxDate = getDateByYear(10)
	apiKeyTypes = [];

	@ViewChild(PermissionManagementComponent)
	permissionManagementComponent!: PermissionManagementComponent;

	@PageControls()
		controls = contributeControls([
			{
				key: "TenantManagement::ApiKeys:Refresh",
				action: () => this.loadApiKeys(),
				disabled: () => this.loading,
				show: () => true,
				loading: () => this.loading,
				icon: "fa fa-sync",
				severity: "warning",
			},
			{
				key: "TenantManagement::ApiKeys:AddApiKey",
				action: () => this.create(),
				disabled: () => this.loading,
				show: () => true,
				loading: () => this.loading,
				icon: "fa fa-plus",
				severity: "primary",
			},
		]);

  constructor(
    private apiKeyService: ApiKeyService,
    public localizationService: ILocalizationService,
		private confirmationService: LocalizedConfirmationService,
		private messageService: LocalizedMessageService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private logsService: ILogsDialogService
  ) {}

  ngOnInit(): void {
    this.title = this.localizationService.instant("TenantManagement::ApiKeys");
		this.apiKeyTypes = [
			{ name: this.localizationService.instant("TenantManagement::ApiKeyTypes:SDK"), value: ApiKeyType.SDK },
			{ name: this.localizationService.instant("TenantManagement::ApiKeyTypes:External"), value: ApiKeyType.External },
			{ name: this.localizationService.instant("TenantManagement::ApiKeyTypes:Gateway"), value: ApiKeyType.Gateway },
			// { name: this.localizationService.instant("TenantManagement::ApiKeyTypes:Custom"), value: ApiKeyType.Custom },
			// { name: this.localizationService.instant("TenantManagement::ApiKeyTypes:Undefined"), value: ApiKeyType.Undefined }
		]
		this.loadApiKeys();
  }

	loadApiKeys() {
		this.loading = true;
		this.apiKeyService.getApiKeys({
			keyTypes: [ApiKeyType.SDK, ApiKeyType.External, ApiKeyType.Gateway, ApiKeyType.Custom, ApiKeyType.Undefined]
		})
			.pipe(finalize(() => {
				this.loading = false;
			})).subscribe(res => {
				this.apiKeys = res;
			});
	}

	create(){
		this.selectedApiKey = {
			id: '',
			name: '',
			refId: '',
			type: ApiKeyType.External,
			creationTime: new Date().toISOString(),
			expiresAt: null,
			invalidated: false,
			allowAuthorize: false,
			data: '',
		};
		this.isCreating = true;
		this.isExpiredKey = false;
	}

	update(key: IdentityApiKeyDto) {
		this.selectedApiKey = { ...key };
		this.isCreating = false;
	}

	deleteKey(apiKeyId: string) {

		this.confirmationService.confirm('TenantManagement::ApiKeys:DeleteConfirmation', () => {
			this.loading = true;
			this.apiKeyService.removeApiKey(apiKeyId)
				.pipe(finalize(() => {
					this.loading = false;
				})).subscribe(res => {
					this.loadApiKeys();
				});
		});
	}

	managePermissions(apiKey: IdentityApiKeyDto) {
		this.permissionManagementComponent.showApiKey(apiKey.id, apiKey.name);
	}

	save(){
		if (this.isCreating){
			this.loading = true;
			this.apiKeyService.addIdentityApiKey({
				name: this.selectedApiKey.name,
				refId: this.selectedApiKey.refId,
				type: this.selectedApiKey.type,
				allowAuthorize: this.selectedApiKey.allowAuthorize,
				expiresAt: (this.isExpiredKey ? this.expiresDate?.toISOString() : null),
				data: this.selectedApiKey.data
			}).pipe(finalize(() => this.loading = false)).subscribe(res => {
				this.close();
				this.loadApiKeys();
			});
		}
		else {
			this.loading = true;
			this.apiKeyService.update({
				id: this.selectedApiKey.id,
				name: this.selectedApiKey.name,
				refId: this.selectedApiKey.refId,
				allowAuthorize: this.selectedApiKey.allowAuthorize,
				data: this.selectedApiKey.data
			}).pipe(finalize(() => this.loading = false)).subscribe(res => {
				this.close();
				this.loadApiKeys();
			});
		}
	}

	close(){
		this.selectedApiKey = null;
	}

	hiddenKey(key: string){
		if (key && key.length > 6){
			return key.substring(0, 6) + '*'.repeat(50);
		}
		return key;
	}

	showType(type: ApiKeyType): string {
		return this.apiKeyTypes.find(t => t.value === type)?.name || this.localizationService.instant("TenantManagement::ApiKeyTypes:Undefined");
	}

	copyKey(key: string) {
		navigator.clipboard.writeText(key).then(() => {
			this.messageService.success("TenantManagement::ApiKeys:KeyCopied");
		}).catch(err => {
			console.error('Failed to copy key: ', err);
			this.messageService.error("TenantManagement::ApiKeys:KeyCopyFailed");
		});
	}

  openLogs(apiKey: IdentityApiKeyDto) {
    if (!apiKey || !apiKey.name) {
      console.error('API key or API key name is missing.');
      return;
    }


    this.logsService.openSecurityLogs(apiKey.name);
  }
}
