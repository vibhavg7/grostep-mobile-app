import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';
import { AuthService } from '../auth.service';
import { CartService } from '../../cart/cart.service';
import {
  Plugins
} from '@capacitor/core';
import { concatMap } from 'rxjs/operators';
const { Storage } = Plugins;
@Component({
  selector: 'app-validate-otp',
  templateUrl: './validate-otp.page.html',
  styleUrls: ['./validate-otp.page.scss'],
})
export class ValidateOtpPage implements OnInit {

  cartList: any;
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
              private cartService: CartService,
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

  async validateOTP(phoneOTP: any) {
    if (phoneOTP !== undefined && phoneOTP !== '' && phoneOTP.length === 4) {
      const cartData  = await Storage.get({ key: 'cartList' });
      const parsedData = JSON.parse(cartData.value).items;
      const cartArray = [];
      if (parsedData != null && Array.isArray(parsedData) && parsedData && parsedData.length > 0) {
        console.log(parsedData);
        // parsedData.forEach(data => {
        //   const obj: any = {};
        //   obj.store_id = data.store_id;
        //   obj.quantity = data.quantity;
        //   obj.store_product_mapping_id = data.store_product_mapping_id;
        //   obj.store_selling_price = data.store_selling_price;
        //   cartArray.push(obj);
        // });
      }
      this.isLoading = true;
      this.authService.loginCustomer(this.phonenumber, phoneOTP).pipe(
        concatMap(response => this.authService.getUserProfile())
        // concatMap(response => this.cartService.syncCartProducts(response.customerData.customer_id, cartArray))
      )
        .subscribe((data: any) => {
          if (+data.status === 200) {
            if (this.authService.redirectUrl === 'cartpage') {
              this.navCtrl.pop().then(() => this.navCtrl.pop());
            } else {
              this.navCtrl.navigateRoot(['/home/tabs/profile']);
            }
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
            if (data.status === 400) {
              this.presentToast('Unable to resend otp.Please try again later');
            } else if (data.status === 200) {
              this.hidevalue = false;
              this.maxTime = 60;
              this.StartTimer();
              this.presentToast('OTP sent successfully');
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
