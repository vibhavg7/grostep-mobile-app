import { Injectable } from '@angular/core';
import { Observable, throwError, forkJoin, of } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { tap, catchError, map } from 'rxjs/operators';
import { OrderService } from '../../order/order.service';
import { AuthService } from '../../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {

  private categoryServiceUrl = 'https://api.grostep.com/categoryapi';
  private bannerServiceUrl = 'https://api.grostep.com/bannerapi';
  private servicableAreaServiceUrl = 'http://localhost:3000/v2/servicableareaapi/';
  private storecategories: any = [];
  private TOKEN_KEY = 'bearertoken';
  constructor(
    private httpClient: HttpClient,
    private authService: AuthService,
    private orderService: OrderService) { }


  get StoreCategories(): any {
    return this.storecategories;
  }

  public storeDataCatData(serviceableAreaId): Observable<any[]> {

    const obj: any = {};
    obj.serviceableAreaId = serviceableAreaId;
    // return this.httpClient.post<any[]>(`${this.servicableAreaServiceUrl}areainfo/citywise`, obj)
    //   .pipe(
    //     tap((data: any) => {
    //       // this.customerInfo = data;
    //     })
    //     , map((data) => {
    //       return data;
    //     })
    //     , catchError(this.handleError)
    //   );
    // const obj: any = {};
    // obj.filterBy = city;
    // const obj1: any = {};
    // obj1.filterBy = city;
    // const response1 = this.httpClient.post(`${this.categoryServiceUrl}/storecategories/citywise`, obj1);
    // const response2 = this.httpClient.post(`${this.bannerServiceUrl}/bannerinfo/citywise`, obj);
    const response1 = this.httpClient.post(`${this.servicableAreaServiceUrl}areainfo/citywise`, obj);
    const response2 = (!!localStorage.getItem(this.TOKEN_KEY) ? this.orderService.fetchCustomerLiveOrderCount() : of([]));
    // // const response4 = this.authService.getUserProfile();
    return forkJoin([response1, response2])
    .pipe(tap((d) => {
      this.storecategories = d[0].store_categories;
      console.log(this.storecategories);
    }));
  }
  private handleError(err: HttpErrorResponse) {
    let errorMessage = '';
    if (err.error instanceof ErrorEvent) {
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      errorMessage = `Server returned code: ${err.status}, error message is: ${err.message}`;
    }
    return throwError(errorMessage);
  }
}
