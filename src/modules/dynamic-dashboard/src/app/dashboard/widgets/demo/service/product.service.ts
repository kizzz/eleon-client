import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Product } from '../api/product';

@Injectable()
export class ProductService {

    constructor(private http: HttpClient) { }

    getProductsSmall() {
        return this.http.get<any>('/resources/demo/data/products-small.json')
            .toPromise()
            .then(res => res.data as Product[])
            .then(data => data);
    }

    getProducts() {
        return this.http.get<any>('/resources/demo/data/products.json')
            .toPromise()
            .then(res => res.data as Product[])
            .then(data => {
                data.push(data[2], data[1])
                return data;
            });
    }

    getProductsMixed() {
        return this.http.get<any>('/resources/demo/data/products-mixed.json')
            .toPromise()
            .then(res => res.data as Product[])
            .then(data => data);
    }

    getProductsWithOrdersSmall() {
        return this.http.get<any>('/resources/demo/data/products-orders-small.json')
            .toPromise()
            .then(res => res.data as Product[])
            .then(data => data);
    }
}
