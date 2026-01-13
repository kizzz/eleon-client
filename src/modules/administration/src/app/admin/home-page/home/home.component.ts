import { Component, OnInit, ViewChild } from "@angular/core";
import { ILocalizationService } from '@eleon/angular-sdk.lib';


@Component({
  standalone: false,
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit {
  title: string;

  constructor(public localizationService: ILocalizationService) {}

  ngOnInit(): void {
    this.title = this.localizationService.instant("Infrastructure::Home");
  }
}
