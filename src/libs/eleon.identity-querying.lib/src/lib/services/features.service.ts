import { Injectable } from '@angular/core'
import { GetFeatureListResultDto, IFeaturesService, UpdateFeaturesDto } from '@eleon/contracts.lib'
import { FeaturesService } from '../proxy'
import { Observable } from 'rxjs'


@Injectable({
  providedIn: 'root'
})
export class FeatureService extends IFeaturesService {
  private proxy = new FeaturesService();

  get(providerName: string, providerKey: string) : Observable<GetFeatureListResultDto>  {
    return this.proxy.get(providerName, providerKey);
  }

  update(providerName: string, providerKey: string, input: UpdateFeaturesDto) : Observable<void> {
    return this.proxy.update(providerName, providerKey, input);
  }

  delete(providerName: string, providerKey: string) : Observable<void> {
    return this.proxy.delete(providerName, providerKey);
  }
}