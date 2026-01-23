import { Injectable } from '@angular/core'
import { ChangePasswordInput, IProfileService, ProfileDto, UpdateProfileDto } from '@eleon/contracts.lib'
import { UserProfilePictureService } from '../proxy'
import { ProfileService } from '../proxy';
import { Observable } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class UserProfileService extends IProfileService {
  private proxy = new ProfileService();
  private profilePictureService = new UserProfilePictureService();


  get(): Observable<ProfileDto> {
    return this.proxy.get();
  }

  update(input: UpdateProfileDto): Observable<ProfileDto> {
    return this.proxy.update(input);
  }

  changePassword(input: ChangePasswordInput) : Observable<void> {
    return this.proxy.changePassword(input);
  }

  updateProfilePicture(input: { profilePictureBase64?: string; profilePictureThumbnailBase64?: string; }): Observable<boolean> {
    return this.profilePictureService.setUserProfilePictureByRequest(input);
  }
}