import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LifecycleTraceModule } from './lifecycle-trace/lifecycle-trace.module';
import { TagModule } from 'primeng/tag';
import { SharedModule } from '@eleon/angular-sdk.lib';

@NgModule({
  declarations: [],
  imports: [CommonModule, SharedModule, TagModule],
  exports: [LifecycleTraceModule],
})
export class LifecycleModule {}
