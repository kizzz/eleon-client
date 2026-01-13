import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { DialogHeaderService } from '../../shared/file-dynamic-dialog-header-service';
import { Subscription } from 'rxjs';

@Component({
  standalone: false,
  selector: 'app-file-dynamic-dialog-header',
  templateUrl: './file-dynamic-dialog-header.component.html',
  styleUrl: './file-dynamic-dialog-header.component.scss'
})
export class FileDynamicDialogHeaderComponent {
  title: string;
  titleSubscription: Subscription;

  constructor(private dialogHeaderService: DialogHeaderService, private dialogRef: DynamicDialogRef) {}

  ngOnInit() {
    this.titleSubscription = this.dialogHeaderService.getTitle().subscribe(title => {
      this.title = title;
    });
  }

  ngOnDestroy() {
    this.titleSubscription.unsubscribe();
  }
  closeDialog() {
    this.dialogRef.close();
  }
}
