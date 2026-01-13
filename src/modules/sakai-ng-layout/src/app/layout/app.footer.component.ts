import { Component } from '@angular/core';

import { from, map, Observable, of } from 'rxjs';
import { ILayoutService } from '@eleon/angular-sdk.lib';
// import { VPORTAL_VERSION } from '../../environments/version';

@Component({
    standalone: false,
    selector: 'app-footer',
    templateUrl: './app.footer.component.html'
})
export class AppFooterComponent {
    currentDateStr: string = new Date().getFullYear().toString();

    version$: Observable<string> = of(`v`
    // ${VPORTAL_VERSION}`
);
    constructor(public layoutService: ILayoutService) {
        this.version$ = from(fetch('/resources/version.json').then(t => t.json())).pipe(map(t => t.version));
    }
}
