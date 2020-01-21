import { Injectable } from '@angular/core';
import { Observable, throwError, forkJoin } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { tap, catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {

  private categoryServiceUrl = 'http://ec2-13-58-49-153.us-east-2.compute.amazonaws.com:3000/categoryapi';
  private bannerServiceUrl = 'http://ec2-13-58-49-153.us-east-2.compute.amazonaws.com:3000/bannerapi';
  private storecategories: any = [];
  constructor(private httpClient: HttpClient) { }


  get StoreCategories(): any {
    return this.storecategories;
  }

  public storeDataCatData(zipCode): Observable<any[]> {
    const obj: any = {};
    obj.page_number = 1; obj.page_size = 20; obj.filterBy = '';
    const obj1: any = {};
    obj1.filterBy = zipCode;
    const response1 = this.httpClient.post(`${this.categoryServiceUrl}/storecategories/zipcode`, obj1);
    const response2 = this.httpClient.post(`${this.bannerServiceUrl}/bannerinfo`, obj);
    return forkJoin([response1, response2])
    .pipe(tap((d) => {
      this.storecategories = d[0].store_categories;
      // console.log(d[1]);
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
