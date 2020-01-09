import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-validate-otp',
  templateUrl: './validate-otp.page.html',
  styleUrls: ['./validate-otp.page.scss'],
})
export class ValidateOtpPage implements OnInit {

  storeId: number;
  customerId: number;
  otp: any = '';
  obj: any = {};
  constructor(private activatedRoute: ActivatedRoute,
              private authService: AuthService,
              private router: Router,
              private navCtrl: NavController) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe((data: any) => {
      if (!data.has('customerId')) {
        this.navCtrl.navigateBack('/auth/login');
        return;
      }
      this.customerId = +data.get('customerId');
    });
  }

  ionViewWillEnter() {
    this.storeId = +this.activatedRoute.snapshot.paramMap.get('storeId');
  }

  next(ev) {
    this.obj[ev.name] = ev.value;
  }

  validateOTP() {
    this.otp = '';
    for (const prop in this.obj) {
      if (Object.prototype.hasOwnProperty.call(this.obj, prop)) {
          this.otp += this.obj[prop];
      }
    }
    this.authService.loginCustomer(this.authService.customerInfo.phone, this.otp)
    .subscribe((data: any) => {
        this.otp = '';
        if (data) {
          this.router.navigate(['/auth/add-user-info', { storeId: this.storeId}]);
          // if (this.authService.redirectUrl === 'productpage') {
          //   this.router.navigate(['/home/tabs/categories/1/stores/1/storecategories/1/storeproducts']);
          // } else if (this.authService.redirectUrl === 'cartpage') {
          //   this.router.navigate(['/cart']);
          // } else {
          //   this.router.navigate(['/auth/add-user-info']);
          //   // this.router.navigate(['/home/tabs/profile']);
          // }
        }
    });
  }

}
