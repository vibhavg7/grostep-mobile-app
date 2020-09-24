import { Injectable } from '@angular/core';
import { Observable, throwError, forkJoin } from 'rxjs';
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
  private storecategories: any = [];
  constructor(
    private httpClient: HttpClient,
    private authService: AuthService,
    private orderService: OrderService) { }


  get StoreCategories(): any {
    return this.storecategories;
  }

  public storeDataCatData(city): Observable<any[]> {
    const obj: any = {};
    obj.filterBy = city;
    const obj1: any = {};
    obj1.filterBy = city;
    const response1 = this.httpClient.post(`${this.categoryServiceUrl}/storecategories/citywise`, obj1);
    const response2 = this.httpClient.post(`${this.bannerServiceUrl}/bannerinfo/citywise`, obj);
    const response3 = this.orderService.fetchCustomerLiveOrderCount();
    const response4 = this.authService.getUserProfile();
    return forkJoin([response1, response2, response3, response4])
    .pipe(tap((d) => {
      this.storecategories = d[0].store_categories;
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
