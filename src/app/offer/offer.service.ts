import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { tap, map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OfferService {

  constructor(private httpClient: HttpClient) { }
  private storeServiceUrl = 'http://ec2-18-188-251-155.us-east-2.compute.amazonaws.com:3000/vouchersapi/';

  fetchAllOffers() {
    return this.httpClient.get<any[]>(`${this.storeServiceUrl}customeroffers`)
    .pipe(
      tap((data: any) => {
        // this.offers = data.store_categories;
        // console.log(this.storeCategories);
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
