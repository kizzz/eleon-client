import { InternalStore } from '@eleon/angular-sdk.lib';
import { Injectable } from "@angular/core";
import { ProfileDto } from '@eleon/angular-sdk.lib';
import { Observable } from "rxjs";

export interface ManageProfileState {
  profile: ProfileDto;
}

@Injectable({ providedIn: "root" })
export class ManageProfileStateService {
  private readonly store = new InternalStore({} as ManageProfileState);

  get createOnUpdateStream() {
    return this.store.sliceUpdate;
  }

  getProfile$(): Observable<ProfileDto> {
    return this.store.sliceState((state) => state.profile);
  }

  getProfile(): ProfileDto {
    return this.store.state.profile;
  }

  setProfile(profile: ProfileDto) {
    this.store.patch({ profile });
  }
}
