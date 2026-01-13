import { Component, OnInit } from '@angular/core';
import { PrimeNG } from 'primeng/config';

@Component({
    standalone: false,
    selector: 'app-root',
    templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {

    constructor(private primeng: PrimeNG) { }

    ngOnInit() {
        this.primeng.setConfig({ ripple: true });
    }
}
