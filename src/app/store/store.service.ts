import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { tap, map } from 'rxjs/operators';
import { catchError } from 'rxjs/internal/operators/catchError';

@Injectable({
  providedIn: 'root'
})
export class StoreService {

  storeDeliveryslots: any;
  selectedDeliverySlotId: any;
  delivernow = true;
  constructor(private httpClient: HttpClient) { }
  private storeServiceUrl = 'http://ec2-18-224-29-78.us-east-2.compute.amazonaws.com:3000/storesapi/';
  private storeInfo: any;
  private storeCategories: any = [];
  private storeCategory: any;
  private storeProducts: any;

  get StoreInfo() {
    return this.storeInfo;
  }
  set StoreInfo(storeData) {
    this.storeInfo = storeData;
  }

  get StoreCategory() {
    return this.storeCategory;
  }
  set StoreCategory(storeCategoryData) {
    this.storeCategory = storeCategoryData;
  }
  fetchAllStoresBasedOnZipCode(zipcode: any, filterBy: any): Observable<any> {
    const obj: any = {};
    obj.zipcode = zipcode;
    obj.filterBy = filterBy;
    return this.httpClient.post<any[]>(`${this.storeServiceUrl}storeinfo/zipCode`, obj)
      .pipe(
        tap(data => {
          // console.log(JSON.stringify(data));
        })
        , map((data) => {
          return data;
        })
        , catchError(this.handleError)
      );
  }

  fetchStoreCategories(storeId: any): Observable<any> {
    return this.httpClient.get<any[]>(`${this.storeServiceUrl}storeinfo/categories/${storeId}`)
      .pipe(
        tap((data: any) => {
          this.storeCategories = data.store_categories;
          // console.log(this.storeCategories);
        })
        , map((data) => {
          return data;
        })
        , catchError(this.handleError)
      );
  }

  fetchStoreProducts(categoryid, storeid) {
    const obj: any = {};
    obj.category_mapping_id = categoryid;
    obj.store_id = storeid;
    return this.httpClient.post<any[]>(`${this.storeServiceUrl}storeinfo/storeproductscategorywise`, obj)
      .pipe(
        tap((data: any) => {
          this.storeProducts = data.store_products_info;
        })
        , map((data) => {
          return data;
        })
        , catchError(this.handleError)
      );
  }

  fetchStoreDeliverySlots(storeid) {
    const obj: any = {};
    obj.offset = '+5.5';
    obj.storeId = storeid;
    return this.httpClient.post<any[]>(`${this.storeServiceUrl}storeinfo/storedeliveryslots`, obj)
      .pipe(
        tap((data: any) => {
          this.storeDeliveryslots = data.slots;
        })
        , map((data) => {
          // console.log(data);
          return data;
        })
        , catchError(this.handleError)
      );
  }

  private handleError(err: HttpErrorResponse) {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    let errorMessage = '';
    if (err.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      errorMessage = `Server returned code: ${err.status}, error message is: ${err.message}`;
    }
    // console.error(errorMessage);
    return throwError(errorMessage);
  }
}
