import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-validate-otp',
  templateUrl: './validate-otp.page.html',
  styleUrls: ['./validate-otp.page.scss'],
})
export class ValidateOtpPage implements OnInit {

  hidevalue = false;
  phonenumber: any;
  storeId: number;
  maxTime: any = 60;
  timer: any;
  customerId: number;
  phoneOTP: any = '';
  isLoading = false;
  @ViewChild('input', { static: false }) input;
  constructor(private activatedRoute: ActivatedRoute,
              private authService: AuthService,
              private toastCtrl: ToastController,
              private router: Router,
              private navCtrl: NavController) { }

  ngOnInit() {
    // this.otp = '';
    this.phonenumber = this.authService.customerInfo.phone;
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

  ionViewDidEnter() {
    this.StartTimer();
    setTimeout(() => {
      this.input.setFocus();
    }, 0);
  }

  StartTimer() {
    this.timer = setTimeout(x => {
      if (this.maxTime <= 0) { }
      this.maxTime -= 1;
      if (this.maxTime > 0 && this.maxTime < 10) {
        this.maxTime = '0' + this.maxTime;
        this.hidevalue = false;
        this.StartTimer();
      } else if (this.maxTime > 0) {
        this.hidevalue = false;
        this.StartTimer();
      } else {
        this.hidevalue = true;
      }
    }, 1000);
  }

  validateOTP(phoneOTP: any) {
    if (phoneOTP === undefined || phoneOTP === '' || phoneOTP.length < 4) {

    } else if (phoneOTP !== undefined && phoneOTP !== '' && phoneOTP.length === 4) {
      this.isLoading = true;
      this.authService.loginCustomer(this.phonenumber, phoneOTP)
        .subscribe((data: any) => {
          if (data.status === 200) {
            if (this.authService.redirectUrl === 'cartpage') {
              // this.router.navigate(['/cart', { storeId: this.storeId, categoryId: 0, storecategoryId: 0 }]);
              // this.navCtrl.navigateBack(['/cart', { storeId: this.storeId }]);
              this.navCtrl.pop().then(() => this.navCtrl.pop());
            } else {
              this.navCtrl.navigateRoot(['/home/tabs/profile']);
            }
            // if (data.customerData.personal_info_added === 1) {
            //   if (this.authService.redirectUrl === 'cartpage') {
            //     // this.router.navigate(['/cart', { storeId: this.storeId, categoryId: 0, storecategoryId: 0 }]);
            //     // this.navCtrl.navigateBack(['/cart', { storeId: this.storeId }]);
            //     this.navCtrl.pop().then(() => this.navCtrl.pop());
            //   } else {
            //     this.navCtrl.navigateRoot(['/home/tabs/profile']);
            //   }
            // } else {
            //   this.router.navigate(['/auth/add-user-info', { storeId: this.storeId }]);
            // }
          } else {
            this.presentToast('Please enter valid OTP');
          }
          this.isLoading = false;
        });
    } else {
      this.presentToast('Please enter valid OTP');
    }
  }

  resendOTP() {
    if (this.hidevalue) {
      if (this.phonenumber === undefined || this.phonenumber.length < 10) {
      } else if (this.phonenumber !== undefined && this.phonenumber.length === 10) {
        this.isLoading = true;
        this.authService.resendOTP(this.customerId)
          .subscribe((data: any) => {
            // console.log(data);
            if (data.status === 400) {
              this.presentToast('Unable to resend otp.Please try again later');
            } else if (data.status === 200) {
              this.hidevalue = false;
              this.maxTime = 60;
              this.StartTimer();
              this.presentToast('OTP sent successfully');
              // this.router.navigate(['/', 'auth', 'validate-otp', data.customer_id, { storeId: this.storeId }]);
            }
            this.isLoading = false;
          });
      } else {
        this.presentToast('Unable to register.Please enter valid phone number');
      }
    }
  }

  async presentToast(msg) {
    const toast = await this.toastCtrl.create({ message: msg, duration: 1000, position: 'middle' });

    toast.present();
  }
}
