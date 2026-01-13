import { IApplicationConfigurationManager } from '@eleon/angular-sdk.lib';
import { Component, OnInit } from "@angular/core"
import { ActivatedRoute } from "@angular/router"
import {
  CommonUserDto,
  CommonUserService,
  IdentitySettingService,
  ProfileService,
  UpdateProfileDto,
} from '@eleon/tenant-management-proxy';
import { LocalizedMessageService } from "@eleon/primeng-ui.lib"
import { ManageProfileStateService } from "../manage-profile.state.service"

type UserAccountTabKey =
  | "profile"
  | "notifications"
  | "controldelegations"
  | "sessions"
  | "security-logs"

interface UserAccountTabLink {
  key: UserAccountTabKey
  labelKey: string
  icon: string
  commands: string[]
}

@Component({
  standalone: false,
  selector: "app-user-account-settings",
  templateUrl: "./user-account-settings.component.html",
  styleUrls: ["./user-account-settings.component.scss"],
})
export class UserAccountSettingsComponent implements OnInit {
  private readonly defaultTabKey: UserAccountTabKey = "profile"

  changePasswordKey = "Account.ChangePasswordComponent";
  personalSettingsKey = "Account.PersonalSettingsComponent";
  profile$ = this.manageProfileState.getProfile$();
  user = {} as CommonUserDto;
  userId: string;
  hideChangePasswordTab?: boolean;
  showNotificationTitle: boolean = false;
  isChangeUsernameAllowed: boolean = false;
  isChangeEmailAllowed: boolean = false;
  showPasswordField: boolean = false;
  currentTabKey: UserAccountTabKey = this.defaultTabKey;

  readonly tabLinks: ReadonlyArray<UserAccountTabLink> = [
    {
      key: "profile",
      labelKey: "Infrastructure::MyAccount",
      icon: "fas fa-user",
      commands: ["..", "profile"],
    },
    {
      key: "notifications",
      labelKey: "Infrastructure::Notifications",
      icon: "fas fa-bell",
      commands: ["..", "notifications"],
    },
    {
      key: "controldelegations",
      labelKey: "Infrastructure::ControlDelegation",
      icon: "fas fa-people-arrows",
      commands: ["..", "controldelegations"],
    },
    {
      key: "sessions",
      labelKey: "Infrastructure::Sessions",
      icon: "fas fa-solid fa-desktop",
      commands: ["..", "sessions"],
    },
    {
      key: "security-logs",
      labelKey: "Infrastructure::UserSecurityLogs",
      icon: "fas fa-tasks",
      commands: ["..", "security-logs"],
    },
  ];

  constructor(
    // private extensionService: ExtensionsService,
    protected profileService: ProfileService,
    protected manageProfileState: ManageProfileStateService,
    protected activatedRoute: ActivatedRoute,
    protected userService: CommonUserService,
    protected config: IApplicationConfigurationManager,
    private identitySettingService: IdentitySettingService,
    public msgService: LocalizedMessageService,
  ) {
  }

  ngOnInit() {
    this.activatedRoute.data.subscribe((data) => {
      const tabKey = data["tab"] as string | undefined;
      this.currentTabKey = this.resolveTabKey(tabKey);
    });
    this.getIdentitySettings();
    this.profileService.get().subscribe((profile) => {
      this.manageProfileState.setProfile(profile);
      if (profile.isExternal) {
        this.hideChangePasswordTab = true;
      }

      this.loadUserDetails();
    });

    this.userId = this.config.getAppConfig()?.currentUser?.id;
    this.config.configUpdate$.subscribe(() => {
      this.userId = this.config.getAppConfig()?.currentUser?.id;
    });
  }

  loadUserDetails() {
    const currentUserId: string = this.config.getAppConfig().currentUser?.id;
    this.userService.getByIdById(currentUserId).subscribe((reply) => {
      this.user = reply;
    });
  }

  private getIdentitySettings() {
    return this.identitySettingService
      .getIdentitySettings()
      .subscribe((settings) => {
        if (settings?.length > 0) {
          this.isChangeUsernameAllowed =
            settings.filter(
              (x) =>
                x.name == "Abp.Identity.User.IsUserNameUpdateEnabled" &&
                x.value == "True"
            )?.length > 0;
          this.isChangeEmailAllowed =
            settings.filter(
              (x) =>
                x.name == "Abp.Identity.User.IsEmailUpdateEnabled" &&
                x.value == "True"
            )?.length > 0;
            this.showPasswordField = settings?.find(x=>x.name === "PasswordEnable")?.value === "True" ? true : false || false;
        }
      });
  }

  private resolveTabKey(tabValue?: string): UserAccountTabKey {
    const match = this.tabLinks.find((tab) => tab.key === tabValue);
    return match?.key ?? this.defaultTabKey;
  }
}
