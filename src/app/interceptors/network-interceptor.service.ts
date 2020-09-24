import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ToastController, NavController } from '@ionic/angular';
import { Plugins, NetworkStatus } from '@capacitor/core';
const { Network } = Plugins;

@Injectable()
export class NetworkInterceptorService implements HttpInterceptor {

  status: any;
  constructor(private router: Router, public toastCtrl: ToastController, private navCtrl: NavController) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> | any {
    this.getStatus();
    return next.handle(request).pipe(
      map((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          // console.log('event--->>>', event);
        }
        return event;
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          if (error.error.success === false) {
            // this.presentToast('Login failed');
          } else {
            // this.router.navigate(['login']);
          }
        }
        return throwError(error);
      })
    );
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

}
