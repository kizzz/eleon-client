import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [CommonModule, RouterModule],
  template: `<router-outlet></router-outlet>`,
})
export class AppComponent {}
