import { Component, OnInit, HostListener, AfterViewInit, ViewChild } from '@angular/core';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import {
  Plugins,
  PushNotification,
  PushNotificationToken,
  PushNotificationActionPerformed
} from '@capacitor/core';
import { NavController, Platform, ToastController } from '@ionic/angular';

const { PushNotifications, Storage } = Plugins;


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit, AfterViewInit {

  isLoading = false;
  storeId: number;
  token: any;
  public loginForm: FormGroup;
  phoneNumber: any = '';
  @ViewChild('input', { static: false }) input;
  constructor(
    private authService: AuthService,
    private platform: Platform,
    private activatedRoute: ActivatedRoute,
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private router: Router) { }

  @HostListener('paste', ['$event']) blockPaste(e: KeyboardEvent) {
    e.preventDefault();
  }

  @HostListener('copy', ['$event']) blockCopy(e: KeyboardEvent) {
    e.preventDefault();
  }

  @HostListener('cut', ['$event']) blockCut(e: KeyboardEvent) {
    e.preventDefault();
  }
  ngOnInit() {
    // PushNotifications.register();

    // // On success, we should be able to receive notifications
    // PushNotifications.addListener('registration',
    //   (token: PushNotificationToken) => {
    //     alert('Push11111111 registration success, token: ' + token.value);
    //     this.token = token.value;
    //   }
    // );
  }


  ionViewDidEnter() {
    setTimeout(() => {
      this.input.setFocus();
    }, 0);
  }

  ngAfterViewInit() {
    // this.platform.backButton.subscribeWithPriority(0, () => {
    //   if (this.router.url.split(';')[0] === '/auth/login' && this.router.url.split(';')[1] !== undefined
    //     && this.router.url.split(';')[1] !== '') {
    //     this.navCtrl.pop();
    //   } else {
    //     this.navCtrl.navigateRoot(['/home/tabs/categories']);
    //   }
    // });
  }

  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;

  }

  ionViewWillEnter() {
    this.storeId = +this.activatedRoute.snapshot.paramMap.get('storeId');
    this.platform.backButton.subscribeWithPriority(0, () => {
      // alert(this.router.url);
      // this.navCtrl.pop();
      if (this.router.url.split(';')[0] === '/auth/login' && this.router.url.split(';')[1] !== undefined
        && this.router.url.split(';')[1] !== '') {
        this.navCtrl.pop();
      } else {
        this.navCtrl.navigateRoot(['/home/tabs/categories']);
      }
    });
  }

  async getcustomerToken(phoneNumber) {
    const customertoken = await Storage.get({ key: 'customertoken' });
    // alert(customertoken.value);
    if (phoneNumber === undefined || phoneNumber.length < 10) {
    } else if (phoneNumber !== undefined && phoneNumber.length === 10) {
      this.isLoading = true;
      this.authService.registerCustomer(phoneNumber, customertoken.value)
        .subscribe((data: any) => {
          if (data.status === 400) {
            this.presentToast('Unable to register.Please enter valid phone number');
          } else if (data.status === 200) {
            this.router.navigate(['/', 'auth', 'validate-otp', data.customer_id, { storeId: this.storeId }]);
          }
          this.isLoading = false;
        });
    } else {
      this.presentToast('Unable to register.Please enter valid phone number');
    }
  }

  backToHome() {
    // this.navCtrl.pop();
    if (this.router.url.split(';')[0] === '/auth/login' && this.router.url.split(';')[1] !== undefined
      && this.router.url.split(';')[1] !== '') {
      this.navCtrl.pop();
    } else {
      this.navCtrl.navigateRoot(['/home/tabs/categories']);
    }
  }

  login(phoneNumber: any) {
    this.getcustomerToken(phoneNumber);
  }

  async presentToast(msg) {
    const toast = await this.toastCtrl.create({ message: msg, duration: 1000, position: 'middle' });

    toast.present();
  }

}
