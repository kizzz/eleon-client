import { Component, ViewChild } from '@angular/core';
import { CommonUserService, ImportExcelUsersValueObjectDto } from '@eleon/tenant-management-proxy';
import { FileSelectEvent, FileUpload } from 'primeng/fileupload';
import { finalize, first } from 'rxjs';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { FileHelperService } from '@eleon/primeng-ui.lib';
import { LocalizedMessageService } from '@eleon/primeng-ui.lib';
import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { RouterModule } from "@angular/router"
import { RequiredMarkModule, SharedModule } from "@eleon/angular-sdk.lib"
import { PageTitleModule } from "@eleon/primeng-ui.lib"
import { ResponsiveTableModule, TableCellsModule } from "@eleon/primeng-ui.lib"
import { ProfilePictureModule } from "@eleon/primeng-ui.lib"
import { BadgeModule } from "primeng/badge"
import { ButtonModule } from "primeng/button"
import { CheckboxModule } from "primeng/checkbox"
import { DialogModule } from "primeng/dialog"
import { SelectModule } from "primeng/select"
import { FileUploadModule } from "primeng/fileupload"
import { InputMaskModule } from "primeng/inputmask"
import { InputTextModule } from "primeng/inputtext"
import { MessageModule } from "primeng/message"
import { PasswordModule } from 'primeng/password'
import { RadioButtonModule } from 'primeng/radiobutton'
import { SplitButtonModule } from 'primeng/splitbutton'
import { TableModule } from "primeng/table"
import { TabsModule } from "primeng/tabs"
import { TagModule } from 'primeng/tag'
import { TooltipModule } from "primeng/tooltip"
import { TreeModule } from "primeng/tree"
import { TreeTableModule } from 'primeng/treetable';
import { HttpClientModule, provideHttpClient } from '@angular/common/http'

@Component({
	standalone: true,
  selector: 'app-user-create-from-file',
  templateUrl: './user-create-from-file.component.html',
  styleUrl: './user-create-from-file.component.scss',
	imports: [
		CommonModule,
		ButtonModule,
		InputTextModule,
		SharedModule,
		TableModule,
		FormsModule,
		PageTitleModule,
		FileUploadModule,
		HttpClientModule,
		BadgeModule,
		TooltipModule,
		DialogModule,
		SelectModule,
		MessageModule,
		MessageModule,
		CheckboxModule,
		TabsModule,
		InputMaskModule,
		RequiredMarkModule,
		TreeModule,
		ResponsiveTableModule,
		TableCellsModule,
		PasswordModule,
		ProfilePictureModule,
		SplitButtonModule,
		TagModule,
		RadioButtonModule,
		TreeTableModule,
	]
})
export class UserCreateFromFileComponent {

  file: string;
  fileName: string;
  loading: boolean = false;

	loaded = false;

  @ViewChild("fileUploadComponent") fileUploadRef: FileUpload;
  constructor(
		public userService: CommonUserService,
    public fileHelper: FileHelperService,
    public localizationService: ILocalizationService,
    public messageService: LocalizedMessageService,
    public dialogRef: DynamicDialogRef,
  ) {
    this.fileName = this.localizationService.instant('TenantManagement::NotSelected');
  }

	ngAfterViewInit(): void {
		this.loaded = true;
	}

  importUsers(event: FileSelectEvent) {
      const fileName = event.files?.[0]?.name;
      event.files?.[0].text().then(result => {
        if (!result) {
          return;
        }
        this.file = result;
        this.fileName = fileName;
        this.fileUploadRef.clear();
    })
  }
  downloadTemplate() {
    const blob = new Blob([`UserName;Email;PhoneNumber;OrganizationUnitNames (separated by ,);FullName;Password
;;;;;
    `], { type: 'text/csv' });
    this.fileHelper.saveFile(blob, 'template.csv')
  }

  downloadGeneratedFile() {

  }
  save() {
    if (!this.file) {
      this.messageService.error('TenantManagement::NoFileSelected')
      return;
    }
    this.loading = true;
    this.userService.importExcelUsersByFile(this.file)
			.pipe(first())
			.pipe(finalize(() => (this.loading = false)))
			.subscribe((result:ImportExcelUsersValueObjectDto) => {
				if(result.error){
					if(!!result.errorMessages?.length){
						this.messageService.errorMany(result.errorMessages);
					}
					if(!!result.csvUser?.length){
						const blob = new Blob([result.csvUser], { type: 'text/csv' });
						this.fileHelper.saveFile(blob, 'generated-report.csv')
					}
				}
				else{
					const blob = new Blob([result.csvUser], { type: 'text/csv' });
					this.fileHelper.saveFile(blob, 'generated-report.csv')
					this.closeDialog();
				}
    })
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
