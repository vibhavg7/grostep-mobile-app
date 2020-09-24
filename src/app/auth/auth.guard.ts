import { Injectable } from '@angular/core';
import { CanActivate, CanLoad, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
// import { ModalController } from '@ionic/angular';
import { CustomerLoginComponent } from '../shared/customer-login/customer-login.component';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {
    private TOKEN_KEY = 'token';
    constructor(private authService: AuthService,
                // private modalCtrl: ModalController,
                private router: Router) { }
    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        return this.checkLoggedIn(state.url);
    }

    checkLoggedIn(url: string) {
        if (!!localStorage.getItem(this.TOKEN_KEY)) {
            return true;
        }
        this.authService.redirectUrl = url;
        this.router.navigate(['/', 'auth', 'login']);
        // this.modalCtrl.create({ component: CustomerLoginComponent, componentProps: { storeId: this.storeId, prevPage: 'cartpage' } })
        // .then((modalEl) => {
        //   modalEl.present();
        //   return modalEl.onDidDismiss();
        // }).then((resultData: any) => {
        //   if (resultData.role === 'voucherapplied') {
        //     this.voucher = resultData.data.voucherDetail;
        //     console.log(this.voucher);
        //   }
        // });
        return false;

    }
}
