import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subscription, debounceTime } from "rxjs";


import { ILayoutService } from '@eleon/angular-sdk.lib';
@Component({
  standalone: false,
  selector: "app-sales-overview",
  templateUrl: "./sales-overview.component.html",
  styleUrl: "./sales-overview.component.scss",
})
export class SalesOverviewComponent implements OnInit, OnDestroy {
  chartData: any;
  chartOptions: any;
  subscription!: Subscription;

  constructor(private layoutService: ILayoutService) {
    this.subscription = this.layoutService.configUpdate$
      .pipe(debounceTime(25))
      .subscribe((config) => {
        this.initChart();
      });
  }

  ngOnInit(): void {
    this.initChart();
  }

  initChart() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue("--text-color");
    const textColorSecondary = documentStyle.getPropertyValue(
      "--text-color-secondary"
    );
    const surfaceBorder = documentStyle.getPropertyValue("--surface-border");

    this.chartData = {
      labels: ["January", "February", "March", "April", "May", "June", "July"],
      datasets: [
        {
          label: "First Dataset",
          data: [65, 59, 80, 81, 56, 55, 40],
          fill: false,
          backgroundColor: documentStyle.getPropertyValue("--bluegray-700"),
          borderColor: documentStyle.getPropertyValue("--bluegray-700"),
          tension: 0.4,
        },
        {
          label: "Second Dataset",
          data: [28, 48, 40, 19, 86, 27, 100],
          fill: false,
          backgroundColor: documentStyle.getPropertyValue("--green-600"),
          borderColor: documentStyle.getPropertyValue("--green-600"),
          tension: 0.4,
        },
      ],
    };

    this.chartOptions = {
      plugins: {
        legend: {
          labels: {
            color: textColor,
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false,
          },
        },
        y: {
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false,
          },
        },
      },
    };
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
