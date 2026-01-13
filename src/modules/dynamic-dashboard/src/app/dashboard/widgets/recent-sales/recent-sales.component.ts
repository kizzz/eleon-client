import { Component, OnInit } from "@angular/core";
import { Product } from "../demo/api/product";
import { ProductService } from "../demo/service/product.service";

@Component({
  standalone: false,
  selector: "app-recent-sales",
  templateUrl: "./recent-sales.component.html",
  styleUrl: "./recent-sales.component.scss",
})
export class RecentSalesComponent implements OnInit {
  products!: Product[];

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.productService
      .getProductsSmall()
      .then((data) => (this.products = data));
  }
}
