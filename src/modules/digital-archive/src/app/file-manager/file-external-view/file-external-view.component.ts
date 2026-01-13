import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Params } from '@angular/router';
import { FileExternalLinkService } from '@eleon/file-manager-proxy';
import { FileExternalLinkReviewerInfoDto } from '@eleon/file-manager-proxy';
import { ExternalLinkLoginType, FileReviewerType } from '@eleon/file-manager-proxy';
import { InputMask } from 'primeng/inputmask';
import { InputText } from 'primeng/inputtext';


import { ILocalizationService, ILayoutService } from '@eleon/angular-sdk.lib';
export interface OtpInput {
  otp: string;
}

@Component({
  standalone: false,
  selector: 'app-file-external-view',
  templateUrl: './file-external-view.component.html',
  styleUrls: ['./file-external-view.component.scss']
})
export class FileExternalViewComponent implements OnInit{


  @ViewChildren('otpInput')
  otpInputs: QueryList<InputMask>;

  loginSetting: FileExternalLinkReviewerInfoDto;

  otp: OtpInput[] = new Array(6).fill("").map(r => ({
    otp: r
  }));

  reviewerType = FileReviewerType;
  FileReviewerExternalPrivateType = ExternalLinkLoginType;

  url: SafeResourceUrl;

  password?: string;

  isOtp: boolean = false;
  message: string;

  otpParts: number[] = [null,null,null,null,null,null];

  id: string;


  constructor(
    public activatedRoute: ActivatedRoute,
    public domSanitizer: DomSanitizer,
    public localizationService: ILocalizationService,
    public externalLinkService: FileExternalLinkService,
    public layoutService: ILayoutService,
  ) {

  }
  ngOnInit(): void {
    this.layoutService.config.update((config) => {
      return {
        ...config,
        menuMode: 'slim',
        isSave: false,
      }
    })
    this.layoutService.config.update((config) => ({
      ...config,
      isFullWidth: true,
    }));
    // document.documentElement.setAttribute('show-header', 'false');
    // document.documentElement.setAttribute('minimal-controls', 'true')
    this.activatedRoute.paramMap
      .pipe()
      .subscribe((c: Params) => {
        const id = c['get']('id');
        this.id = id;
        if (id) {
          this.externalLinkService.getLoginInfo(id)
            .subscribe(result => {
              this.loginSetting = result;
              document.documentElement.setAttribute('show-header', "true");
                this.login();
            })
        }
      });
  }

  onOtpInput($event, i) {
    if ($event != Number($event)) {
      const old = this.otp[i].otp;
      this.otp[i].otp = null;
      this.otp[i].otp = old;
    }
    else if (parseInt($event) > 9) {
      for (let j = 0; j < $event.length; j++) {
        if (this.otp.length > i+j) {
          this.otp[i+j].otp = null;
          this.otp[i+j].otp = $event[j];
          this.otpInputs.get(i+j).writeValue($event[j]);
          this.otpInputs.get(i+j).focus();
        }
      }
    }
    else {
      this.otp[i].otp = $event;
      this.otpInputs.get(i+1).focus();
    }
  }

  nextOtp(i) {
    // if (i+1 >= this.inputMasks.length) {
    //   return;
    // }
    // this.inputMasks.get(i+1).focus();
  }

  login() {
      this.externalLinkService.directLogin(this.id, this.password)
        .subscribe(result => {
          if (!result) {
            this.message = this.localizationService.instant('FileManager::WrongPassword');
            return;
          }
          this.url = this.domSanitizer.bypassSecurityTrustResourceUrl(result);
        })
  }

}
