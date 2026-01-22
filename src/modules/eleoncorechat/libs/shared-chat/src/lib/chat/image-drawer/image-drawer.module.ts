import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageDrawerBoxComponent } from './image-drawer-box/image-drawer-box.component';
import { SharedModule } from '@eleon/angular-sdk.lib';



@NgModule({
  declarations: [
    ImageDrawerBoxComponent
  ],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [
    ImageDrawerBoxComponent
  ]
})
export class ImageDrawerModule { }
