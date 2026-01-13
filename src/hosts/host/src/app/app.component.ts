import { CommonModule } from "@angular/common"
import { HttpClientModule } from "@angular/common/http"
import { Component, ErrorHandler, inject, OnInit } from '@angular/core'
import { Router, RouterModule } from '@angular/router'

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HttpClientModule,
  ],
  selector: 'app-root',
  template: `<router-outlet></router-outlet>`,
})
export class HostComponent implements OnInit {
  constructor(
  ) {
  }

  ngOnInit() {
  }

}
