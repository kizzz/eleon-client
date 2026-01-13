import { Injectable, Injector } from "@angular/core";
import { IAuthManager, ISignalRConnector, ISignalRService } from '@eleon/contracts.lib';
import { SessionsService } from '@eleon/tenant-management-proxy';
import { extractApiBase } from '@eleon/angular-sdk.lib'

const CONFIG = {
	ROUTE: "/hubs/identity/identity-hub",
	METHODS: {
		CheckSession: "CheckSession",
	},

	getRoute(){
		return extractApiBase('eleonsoft') + CONFIG.ROUTE;
	}
};

@Injectable({
	providedIn: "root",
})
export class IdentityHubService {
	private signalRService: ISignalRService;
	private connector: ISignalRConnector;

	constructor(private injector: Injector) {
		this.signalRService = this.injector.get(ISignalRService);
	}

	public initConnection() {
		if (!this.connector){
			const connector = this.signalRService.startConnection(CONFIG.getRoute());

			connector.addMessageListener(CONFIG.METHODS.CheckSession, (data) => {
				console.log("IdentityHubService: CheckSession received", data);
				const auth = this.injector.get(IAuthManager);
				const sessions = this.injector.get(SessionsService);

				sessions.getCurrentSession().subscribe(res => {
					if (!res){
						auth.logout();
					}
				}, error => {
					auth.logout();
				})
			});

			this.connector = connector;
		}
	}
}
