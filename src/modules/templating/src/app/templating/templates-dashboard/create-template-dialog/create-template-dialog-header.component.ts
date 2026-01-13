import { ChangeDetectionStrategy, Component, Input, Optional } from '@angular/core';
import { DynamicDialogConfig } from 'primeng/dynamicdialog'

@Component({
  standalone: false,
  selector: 'app-create-template-dialog-header',
  template: `
    <div class="dialog-header flex align-items-center gap-2">
      <span>{{ title }}</span>

      <p-tag
        [value]=
          "isSystem
            ? ('Templating::System' | abpLocalization)
            : ('Templating::Custom' | abpLocalization)"
      ></p-tag>
    </div>
  `,
  styles: [
    `
      .dialog-header {
        margin-bottom: 1rem;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateTemplateDialogHeaderComponent {
  title = '';
  isSystem = false;

  constructor(@Optional() private cfg: DynamicDialogConfig) {
    this.title = this.cfg?.header || this.title;
    this.isSystem = this.cfg?.data?.isSystem || this.isSystem;
  }
}