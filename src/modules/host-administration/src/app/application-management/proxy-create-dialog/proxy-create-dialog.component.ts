import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MessageService } from 'primeng/api';
import { TreeNode } from 'primeng/api';
import { LocationDto } from '../../proxy/sites-management/module/locations/models';
import {
  PipesModule,
  RequiredMarkModule,
  SharedModule,
} from '@eleon/angular-sdk.lib';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ILocalizationService } from '@eleon/angular-sdk.lib';

@Component({
  selector: 'app-proxy-create-dialog',
  standalone: true,
  imports: [
    SharedModule,
    PipesModule,
    RequiredMarkModule,
    InputTextModule,
    FormsModule,
    ButtonModule,
    DialogModule,
  ],
  templateUrl: './proxy-create-dialog.component.html',
  styleUrls: ['./proxy-create-dialog.component.scss'],
})
export class ProxyCreateDialogComponent {
  @Input() model!: LocationDto;
  @Input() isEdit = false;
  @Input() allLocations: TreeNode<LocationDto>[] = [];
  @Input() visible = false;

  @Output() save = new EventEmitter<LocationDto>();
  @Output() cancel = new EventEmitter<void>();
  @Output() valueChange = new EventEmitter<LocationDto>();
  @Output() visibleChange = new EventEmitter<boolean>();

  nameEmpty = false;

  constructor(
    private messageService: MessageService,
    private localizationService: ILocalizationService
  ) {}

  resetValidators(): void {
    this.nameEmpty = false;
  }

  onInput(): void {
    this.resetValidators();
    this.valueChange.emit(this.model);
  }

  emitCancel(): void {
    this.resetValidators();
    this.visible = false;
    this.visibleChange.emit(false);
    this.cancel.emit();
  }

  onDialogHide(): void {
    this.visible = false;
    this.visibleChange.emit(false);
    this.emitCancel();
  }

  get dialogHeader(): string {
    return this.isEdit
      ? (this.localizationService.instant(
          'TenantManagement::EditLocation'
        ) as string)
      : (this.localizationService.instant(
          'TenantManagement::CreateLocation'
        ) as string);
  }

  emitSave(): void {
    const name = this.model.name?.trim() ?? '';
    let isValid = true;

    if (!name.length) {
      this.nameEmpty = true;
      this.messageService.add({
        severity: 'error',
        summary: this.localizationService.instant(
          'TenantManagement::Error:NameIsEmpty'
        ),
      });
      isValid = false;
    }

    if (name.length && this.allLocations?.some((n) => this.hasName(n, name))) {
      this.messageService.add({
        severity: 'error',
        summary: this.localizationService.instant(
          'TenantManagement::Error:NameIsNotUnique'
        ),
      });
      this.nameEmpty = true;
      isValid = false;
    }

    if (!isValid) return;

    this.model.name = name;
    this.resetValidators();
    this.visible = false;
    this.visibleChange.emit(false);
    this.save.emit(this.model);
  }

  private hasName(node: TreeNode<LocationDto>, name: string): boolean {
    const excludeId = this.isEdit ? this.model.id : undefined;
    if (node.data?.name?.toLowerCase() === name.toLowerCase()) {
      if (excludeId && node.data?.id === excludeId) return false;
      return true;
    }
    if (node.children?.length) {
      return node.children.some((c) => this.hasName(c, name));
    }
    return false;
  }
}
