import { IAuthManager } from '@eleon/angular-sdk.lib';
import {
  Component,
  EventEmitter,
  HostBinding,
  Input,
  OnInit,
  Output,
} from "@angular/core";
import { Router } from "@angular/router";
import { Observable, finalize, first, map } from "rxjs";
import { PageStateService } from "@eleon/primeng-ui.lib";
import { SharedModule } from "@eleon/angular-sdk.lib";
import { MessageService } from "primeng/api";
import { PopoverModule } from "primeng/popover";
import { TooltipModule } from "primeng/tooltip";
import { BadgeModule } from 'primeng/badge';
import { ListboxModule } from 'primeng/listbox';
import { CommonUserService, GetCommonUsersInput } from '@eleon/tenant-management-proxy';
import { PipesModule } from '@eleon/angular-sdk.lib';

import { LocalizedConfirmationService } from '@eleon/primeng-ui.lib'
import { ProfilePictureModule } from '@eleon/primeng-ui.lib';

import { ILocalizationService, IQuickReloginService } from '@eleon/angular-sdk.lib';
interface UserNavigationInfo {
	id: string;
	systemUserName: string;
	displayUserName: string;
}

@Component({
	selector: 'app-quick-relogin',
	templateUrl: './quick-relogin.component.html',
	standalone: true,
		imports: [
			SharedModule,
			PopoverModule,
			TooltipModule,
			BadgeModule,
			ListboxModule,
			PipesModule,
      ProfilePictureModule,
		],
	styles: [``]
})
export class QuickReloginComponent {
	@Input()
	opened = false;

	loading = false;

	users: UserNavigationInfo[] = [];
	selectedUser: any;

	get enabled(): boolean {
		return this.quickReloginService.enabled;
	}

	constructor(
			private userService: CommonUserService,
			private quickReloginService: IQuickReloginService,
			private confirmService: LocalizedConfirmationService
		) {
	}

	onSelected(user: { value: UserNavigationInfo}){
		if (!user) {
			return;
		}
		
		const userName = user.value.systemUserName;
		this.confirmService.confirm('Infrastructure::QuickRelogin:Confirm:Relogin', () => {
			this.quickReloginService.quickRelogin({username: userName});
			this.selectedUser = null;
		});
	}

	loadUsers() {
		this.loading = true;
		this.userService.getCurrentUser()
			.pipe(first())
			.subscribe(user => {
				if (user) {
					this.userService.getAllUsersList()
						.pipe(finalize(() => this.loading = false))
						.subscribe(res => {
							this.users = res.filter(x => x.id !== user.id).map(user => ({
								id: user.id,
								systemUserName: user.userName,
								displayUserName: user.name + ' ' + user.surname
							}));
						});
				}
			});
		
	}
	
	openDialog(){
		if (!this.users || this.users.length === 0) {
			this.loadUsers();
		}
	}
}
