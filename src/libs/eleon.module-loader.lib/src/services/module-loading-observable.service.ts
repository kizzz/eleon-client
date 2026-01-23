import { IModuleLoadingObservableService } from '@eleon/contracts.lib'
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Observable } from 'rxjs/internal/Observable';


export class ModuleLoadingObservableService extends IModuleLoadingObservableService {
  override modulesConfiguredSubject = new BehaviorSubject<boolean>(false);
  override modulesLoadingSubject = new BehaviorSubject<boolean>(false);
  override moduleLoadedSubject = new BehaviorSubject<{ name: string }>(null); 

  override setModulesConfigured(): void {
    if (!this.modulesConfiguredSubject.getValue()){
      this.modulesConfiguredSubject.next(true);
    }
  }

  override isModulesConfigured(): Observable<boolean> {
    return this.modulesConfiguredSubject.asObservable();
  }

  override isModulesLoading() : Observable<boolean> {
    return this.modulesLoadingSubject.asObservable();
  }
}