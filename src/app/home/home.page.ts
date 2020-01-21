import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild } from '@angular/core';
import { CartService } from '../cart/cart.service';
import { Platform, IonRouterOutlet, NavController } from '@ionic/angular';
import { Router } from '@angular/router';
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy, AfterViewInit {

  cartCount: number;
  backButtonSubscription;
  @ViewChild(IonRouterOutlet, { static: false }) routerOutlet: IonRouterOutlet;
  constructor(
    private cartService: CartService,
    private navCtrl: NavController,
    private router: Router,
    private platform: Platform
  ) { }

  ngOnInit() { }
  ngAfterViewInit() {
    this.platform.backButton.subscribeWithPriority(0, () => {
      if (this.router.url === '/home/tabs/categories') {
        // tslint:disable-next-line:no-string-literal
        navigator['app'].exitApp();
      } else if (this.router.url === '/home/tabs/profile' || this.router.url === '/home/tabs/cart'
                  || this.router.url === '/home/tabs/search') {
          this.navCtrl.navigateRoot(['/home/tabs/categories']);
      } else {
        this.navCtrl.pop();
      }
    });
  }
  ngOnDestroy() {
    // this.backButtonSubscription.unsubscribe();
  }

  ionViewWillEnter() {
    this.cartCount = this.cartService.getCartCount();
    console.log(this.cartCount);
  }

}
