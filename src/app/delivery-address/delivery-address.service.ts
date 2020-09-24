import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { tap, map, catchError } from 'rxjs/operators';
import { throwError, forkJoin, from, Observable } from 'rxjs';
import { Plugins } from '@capacitor/core';

const { Storage } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class DeliveryAddressService {

  private deliveryInstructions = '';
  private CUSTOMER_ID = 'customerid';
  private deliveryServiceUrl = 'https://api.grostep.com/deliveryapi/';
  private storeServiceUrl = 'https://api.grostep.com/storesapi/';
  constructor(private httpClient: HttpClient) { }

  addDeliveryInstructions(value) {
    this.deliveryInstructions = value;
    this.setInstructionsObject(value);
  }


  async setInstructionsObject(instructions) {
    await Storage.set({
      key: 'deliveryInstructions',
      value: instructions
    });
  }

  async removeInstructions() {
    await Storage.remove({ key: 'deliveryInstructions' });
  }

  // getDeliveryInstructions(): Observable<any> {
  //   return from(Storage.get({ key: 'cartList' }));
  // }

  getDeliveryInstructions(): Observable<any> {
    // return this.deliveryInstructions;
    return from(Storage.get({ key: 'deliveryInstructions' }));
  }

  removeDeliveryInstructions() {
    this.deliveryInstructions = '';
    this.removeInstructions();
    return this.deliveryInstructions;
  }

  getDeliveryRatesAndFees(deliverycity, deliverystate, storeid) {
    const deliveryRatesobj: any = {}; deliveryRatesobj.city = deliverycity; deliveryRatesobj.state = deliverystate;
    const deliverySlotObj: any = {}; deliverySlotObj.offset = '+5.5'; deliverySlotObj.storeId = storeid;
    const customerId = +localStorage.getItem(this.CUSTOMER_ID);
    const response1 = this.httpClient.post<any[]>(`${this.storeServiceUrl}storeinfo/storedeliveryslots`, deliverySlotObj);
    const response2 = this.httpClient.post<any>(`${this.deliveryServiceUrl}deliveryratesandfees/${customerId}`, deliveryRatesobj);
    return forkJoin([response1, response2])
      .pipe(tap((data: any) => {
        // this.storecategories = d[0].store_categories;
        // console.log(d[1]);
      }), map((data: any) => {
        console.log(data);
        return data;
      }));
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
