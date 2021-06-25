import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ToastController, NavController } from '@ionic/angular';
import { Plugins, NetworkStatus } from '@capacitor/core';
const { Network } = Plugins;

@Injectable()
export class NetworkInterceptorService implements HttpInterceptor {

  token: string;
  private AUTH_HEADER = 'Authorization';
  status: any;
  private CUSTOMER_ID = 'customerid';
  private CUSTOMER_PHONE = 'customerphone';
  private TOKEN_KEY = 'bearertoken';
  private CUSTOMER_ADDRESS = 'customeraddress';
  private CUSTOMER_PROFILE = 'customerprofile';

  constructor(private router: Router, public toastCtrl: ToastController, private navCtrl: NavController) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> | any {
    this.token = localStorage.getItem('bearertoken');
    if (!request.headers.has('appclient')) {
      request = request.clone({
        headers: request.headers.set('appclient', 'customer_mobileapp')
      });
    }
    this.getStatus();
    request = this.addAuthenticationToken(request);
    return next.handle(request).pipe(
      map((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          // console.log('event--->>>', event);
        }
        return event;
      }),
      catchError((error: HttpErrorResponse) => {
        let handled = false;
        if (error instanceof HttpErrorResponse) {
          if (error.error instanceof ErrorEvent) {
            console.error('Error Event');
          } else {
            console.log(`error status : ${error.status} ${error.statusText}`);
            switch (error.status) {
              case 401:      // login
                localStorage.removeItem(this.CUSTOMER_ID);
                localStorage.removeItem(this.TOKEN_KEY);
                localStorage.removeItem(this.CUSTOMER_PHONE);
                localStorage.removeItem(this.CUSTOMER_PROFILE);
                this.router.navigateByUrl('/auth/login');
                handled = true;
                break;
              case 403:     // forbidden
                this.router.navigateByUrl('/unauthorized');
                handled = true;
                break;
            }
          }
        } else {
          console.error('some thing else happened');
        }
        if (handled) {
          console.log('return back ');
          return of(error);
        } else {
          console.log('throw error back to to the subscriber');
          return throwError(error);
        }
      })
    ) as Observable<HttpEvent<any>>;
    //   catchError((error: HttpErrorResponse) => {
    //     if (error.status === 401) {
    //       if (error.error.success === false) {
    //         // this.presentToast('Login failed');
    //       } else {
    //         // this.router.navigate(['login']);
    //       }
    //     }
    //     return throwError(error);
    //   })
    // );
  }

  async presentToast(msg) {
    const toast = await this.toastCtrl.create({ message: msg, duration: 1000, position: 'bottom' });

    toast.present();
  }

  async getStatus() {
    try {
      this.status = await Network.getStatus();
      if (!this.status.connected) {
        this.presentToast('Your internet connection appears to be offline. Data integrity is not guaranteed.');
        this.navCtrl.navigateRoot(['/blank']);
      }
      // console.log(this.status);
    } catch (e) { console.log('Error', e); }
  }

  private addAuthenticationToken(request: HttpRequest<any>): HttpRequest<any> {
    // If we do not have a token yet then we should not set the header.
    // Here we could first retrieve the token from where we store it.
    if (!this.token) {
      return request;
    }
    // // If you are calling an outside domain then do not add the token.
    // if (!request.url.match(/www.mydomain.com\//)) {
    //   return request;
    // }
    return request.clone({
      headers: request.headers.set(this.AUTH_HEADER, 'Bearer ' + this.token)
    });
  }

}
