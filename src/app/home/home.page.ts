import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild } from '@angular/core';
import { CartService } from '../cart/cart.service';
import { Platform, IonRouterOutlet, NavController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {

  subscription: Subscription;
  cartCount: number;
  backButtonSubscription;
  @ViewChild(IonRouterOutlet, { static: false }) routerOutlet: IonRouterOutlet;
  constructor(
    private cartService: CartService,
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private router: Router,
    private platform: Platform
  ) {
    this.platform.backButton.subscribeWithPriority(0, () => {
      if (this.router.url === '/home/tabs/categories') {
        // tslint:disable-next-line:no-string-literal
        navigator['app'].exitApp();
      } else {
        this.navCtrl.navigateRoot(['/home/tabs/categories']);
      }
    });
  }

  ngOnInit() {
    this.subscription = this.cartService.getMessage().subscribe((message: any) => {
      this.cartCount = message.text;
      console.log(this.cartCount);
    });
  }

  ngOnDestroy() {
    // console.log(this.subscription);
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  ionViewWillEnter() {
    // getStorageAllCartItems and call promise
    this.cartService.getAllCartItems().subscribe((data) => {
      const cartList = JSON.parse(data.value);
      if (cartList !== null) {
        this.cartCount = cartList.length;
        this.cartService.sendMessage(cartList);
      }
    });
    this.platform.backButton.subscribeWithPriority(0, () => {
      if (this.router.url === '/home/tabs/categories') {
        // tslint:disable-next-line:no-string-literal
        navigator['app'].exitApp();
      } else {
        this.navCtrl.navigateRoot(['/home/tabs/categories']);
      }
      // else if (this.router.url === '/home/tabs/profile' || this.router.url === '/home/tabs/cart'
      //   || this.router.url === '/home/tabs/search') {
      //   this.navCtrl.navigateRoot(['/home/tabs/categories']);
      // } else {
      //   this.navCtrl.pop();
      // }
    });
  }


}
