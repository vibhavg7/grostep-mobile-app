import { Injectable } from '@angular/core';
import { Observable, throwError, of } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { tap, map } from 'rxjs/operators';
import { catchError } from 'rxjs/internal/operators/catchError';

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    private orderServiceUrl = 'https://api.grostep.com/ordersapi/';
    private customerServiceUrl = 'https://api.grostep.com/customerapi/';
    private CUSTOMER_ID = 'customerid';
    constructor(private httpClient: HttpClient) { }

    fetchAllCustomerLiveOrders(pagenumber: number, pagesize: number) {
        const obj: any = {};
        obj.customerId = localStorage.getItem(this.CUSTOMER_ID);
        obj.page_number = pagenumber;
        obj.page_size = pagesize;
        console.log(obj);
        return this.httpClient.post(`${this.orderServiceUrl}customerliveorders`, obj)
            .pipe(
                tap(data => {
                })
                , map((data) => {
                    console.log(data);
                    return data;
                })
                , catchError(this.handleError)
            );
    }

    fetchCustomerLiveOrderCount() {
        const customerId = localStorage.getItem(this.CUSTOMER_ID);
        return this.httpClient.get(`${this.orderServiceUrl}customerliveordercount/${customerId}`)
            .pipe(
                tap(data => {
                })
                , map((data) => {
                    return data;
                })
                , catchError(this.handleError)
            );
    }
    fetchAllCustomerLiveOrderDetail(orderId: any) {
        return this.httpClient.get<any>(`${this.orderServiceUrl}customerliveorders/${orderId}`)
            .pipe(
                tap(data => {
                    // console.log(data);
                })
                , map((data) => {
                    // console.log(data);
                    return data;
                    // return data.addressInfo[0];
                })
                , catchError(this.handleError)
            );
    }
    fetchOrderInformationById(orderId: any) {
        return this.httpClient.get<any>(`${this.orderServiceUrl}customerorderInfoById/${orderId}`)
            .pipe(
                tap(data => {
                    // console.log(data);
                })
                , map((data) => {
                    // console.log(data);
                    return data;
                    // return data.addressInfo[0];
                })
                , catchError(this.handleError)
            );
    }
    fetchAllCustomerOrders(pagenumber: number, pagesize: number) {
        const obj: any = {};
        obj.customerId = localStorage.getItem(this.CUSTOMER_ID);
        obj.page_number = pagenumber;
        obj.page_size = pagesize;
        obj.filterBy = '';
        return this.httpClient.post(`${this.orderServiceUrl}customerorders`, obj)
            .pipe(
                tap(data => {
                })
                , map((data) => {
                    console.log(data);
                    return data;
                })
                , catchError(this.handleError)
            );
    }
    updateOrderStatus(orderId: any, orderStatus: any) {
        const obj: any = {};
        obj.status = orderStatus;
        return this.httpClient.put<any>(`${this.customerServiceUrl}updateOrder/${orderId}`, obj)
            .pipe(
                tap(data => {
                    // console.log(data);
                })
                , map((data) => {
                    return data;
                })
                , catchError(this.handleError)
            );
    }
    placeOrder(orderObj: any) {
        return this.httpClient.post(`${this.orderServiceUrl}placeorder`, orderObj)
            .pipe(
                tap(data => {
                })
                , map((data) => {
                    console.log(data);
                    return data;
                })
                , catchError(this.handleError)
            );
    }

    cancelOrder(orderId, orderStatus) {
        const obj: any = {};
        obj.status = orderStatus;
        return this.httpClient.put<any>(`${this.orderServiceUrl}cancelOrderByCustomer/${orderId}`, obj)
            .pipe(
                tap(data => {
                    // console.log(data);
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
