import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { tap, map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(private httpClient: HttpClient) { }
  private orderServiceUrl = 'http://ec2-18-224-29-78.us-east-2.compute.amazonaws.com:3000/ordersapi/';
  private CUSTOMER_ID = 'customerid';
  public ordersInfo: any = [];

  placeOrder(obj) {
    console.log(obj);
    return this.httpClient.post<any[]>(`${this.orderServiceUrl}placeorder`, obj)
      .pipe(
        tap((data: any) => {
        })
        , map((data) => {
          console.log(data);
          return data;
        })
        , catchError(this.handleError)
      );
  }

  fetchAllCustomerOrders() {
    const obj: any = {};
    obj.customerId = localStorage.getItem(this.CUSTOMER_ID);
    obj.page_number = 1;
    obj.page_size = 1000;
    obj.filterBy = '';
    return this.httpClient.post<any[]>(`${this.orderServiceUrl}customerorders`, obj)
    .pipe(
      tap((data: any) => {
        this.ordersInfo = data.customer_orders_info;
      })
      , map((data) => {
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
