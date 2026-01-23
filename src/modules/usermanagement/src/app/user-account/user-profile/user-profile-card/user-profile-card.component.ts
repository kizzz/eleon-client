import { IApplicationConfigurationManager } from '@eleon/angular-sdk.lib';
import { Component, Input, OnInit } from '@angular/core';
import { IUserService } from '@eleon/angular-sdk.lib';
import { CommonRoleDto } from '@eleon/angular-sdk.lib';
import { CommonUserDto } from '@eleon/angular-sdk.lib';

@Component({
  standalone: false,
  selector: 'app-user-profile-card',
  templateUrl: './user-profile-card.component.html',
  styleUrls: ['./user-profile-card.component.scss']
})
export class UserProfileCardComponent implements OnInit {

  @Input()
  userId: string;
  @Input()
  showMe: boolean;

  user: CommonUserDto;
  // icon: ProfilePictureSourceDto;
  roles: CommonRoleDto[];

  constructor(
    public accountService: IApplicationConfigurationManager,
    public userService: IUserService,
    // public pictureService: ProfilePictureService
  ) { }

  ngOnInit(): void {
    if (this.showMe) {
      this.userId = this.accountService.getAppConfig().currentUser.id;
    }
    this.loadUserProfile();
  }
  loadUserProfile() {
    this.userService.getById(this.userId)
        .subscribe(user => {
          this.user = user;
        })
    this.userService.getRolesById(this.userId)
          .subscribe((items) => {
            this.roles = items;
          })
    // this.pictureService.getProfilePicture(this.userId)
    //           .subscribe(picture => {
    //             this.icon = picture;
    //           })
  }

}
