import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserProfileCardComponent } from './user-profile-card/user-profile-card.component';
import { TagModule } from 'primeng/tag';
import {CardModule} from 'primeng/card';
import {ProgressBarModule} from 'primeng/progressbar';
import {SkeletonModule} from 'primeng/skeleton';



@NgModule({
  declarations: [
    UserProfileCardComponent
  ],
  imports: [
    CommonModule,
    TagModule,
    CardModule,
    ProgressBarModule,
    SkeletonModule,
  ],
  exports: [
    UserProfileCardComponent,
  ]
})
export class UserProfileModule { }

