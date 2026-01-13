import { Component, OnInit } from "@angular/core";
import { MenuItem } from "primeng/api";

@Component({
  standalone: false,
  selector: "app-notifications",
  templateUrl: "./notifications.component.html",
  styleUrl: "./notifications.component.scss",
})
export class NotificationsComponent implements OnInit {
  items!: MenuItem[];

  ngOnInit(): void {
    this.items = [
      { label: "Add New", icon: "pi pi-fw pi-plus" },
      { label: "Remove", icon: "pi pi-fw pi-minus" },
    ];
  }
}
