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
    this.otp = '';
    this.activatedRoute.paramMap.subscribe((data: any) => {
      if (!data.has('customerId')) {
        this.navCtrl.navigateBack('/auth/login');
        return;
      }
      this.customerId = +data.get('customerId');
    });
  }

  ionViewWillEnter() {
    this.otp = '';
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
    console.log(this.otp);
    this.authService.loginCustomer(this.authService.customerInfo.phone, this.otp)
      .subscribe((data: any) => {
        this.otp = '';
        if (data.status === 200) {
          if (data.customerData.personal_info_added === 1) {
            if (this.authService.redirectUrl === 'cartpage') {
              this.navCtrl.navigateBack([`/cart/${this.storeId}`]);
            } else {
              this.navCtrl.navigateRoot(['/home/tabs/profile']);
            }
          } else {
            this.router.navigate(['/auth/add-user-info', { storeId: this.storeId}]);
          }
        }
      });
  }

}
