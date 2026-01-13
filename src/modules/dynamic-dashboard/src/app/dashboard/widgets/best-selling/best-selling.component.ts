import { Component, OnInit } from "@angular/core";
import { MenuItem } from "primeng/api";

@Component({
  standalone: false,
  selector: "app-best-selling",
  templateUrl: "./best-selling.component.html",
  styleUrl: "./best-selling.component.scss",
})
export class BestSellingComponent implements OnInit {
  items!: MenuItem[];

  ngOnInit(): void {
    this.items = [
      { label: "Add New", icon: "pi pi-fw pi-plus" },
      { label: "Remove", icon: "pi pi-fw pi-minus" },
    ];
  }
}
