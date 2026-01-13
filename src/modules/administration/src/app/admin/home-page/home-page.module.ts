import { NgModule } from '@angular/core';
import { HomeComponent } from './home/home.component';
import { PageTitleModule } from '@eleon/primeng-ui.lib';
import { HomePageRoutingModule } from './home-page.routing.module';

@NgModule({
  declarations: [
    HomeComponent
  ],
  imports: [
    PageTitleModule,
    HomePageRoutingModule
  ]
})
export class HomePageModule { }
