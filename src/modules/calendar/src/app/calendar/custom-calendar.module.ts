import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@eleon/angular-sdk.lib';
import { CalendarDisplayComponent } from './calendar-display/calendar-display.component';
import { FullCalendarModule } from '@fullcalendar/angular';
import { RouterModule } from '@angular/router';
import { PageTitleModule } from '@eleon/primeng-ui.lib';
import { OAuthModule } from 'angular-oauth2-oidc';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    CalendarDisplayComponent,
  ],
  imports: [
    FullCalendarModule,
    SharedModule,
    CommonModule,
    PageTitleModule,
    OAuthModule,
    HttpClientModule,
    RouterModule.forChild([
      {
        path: '',
        pathMatch: 'full',
        component: CalendarDisplayComponent,
        data:{
          name:"Infrastructure::Calendar",
        }
      }
    ])
  ],
  exports: [
    CalendarDisplayComponent,
  ]
})
export class CustomCalendarModule { }
