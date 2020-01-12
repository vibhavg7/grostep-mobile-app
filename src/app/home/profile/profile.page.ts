import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { NavController } from '@ionic/angular';
import { OnEnter } from '../on-enter';
import { Subscription } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { CartService } from '../../cart/cart.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit, OnEnter, OnDestroy {

  errorMessage: any;
  subscription: Subscription;
  private NAME_KEY = 'name';
  private TOKEN_KEY = 'token';
  public user: any;
  constructor(
    private router: Router,
    private navCtrl: NavController,
    private cartService: CartService,
    private auth: AuthService) { }

  public async ngOnInit(): Promise<void> {
    await this.onEnter();

    this.subscription = this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd && event.url === '/home/tabs/profile') {
        this.onEnter();
      }
    });
  }

  public async onEnter(): Promise<void> {
    this.auth.getUserProfile().subscribe((data) => {
      this.user = data.customer_info[0];
    }, (error) => {
      this.errorMessage = error;
    });
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ionViewWillEnter() {
  }

  myOrder() {
    this.router.navigate(['/', 'order']);
  }

  myCoupons() {
    this.router.navigate(['/', 'offer']);
  }

  changePassword() {
    this.router.navigate(['/', 'home', 'tabs', 'profile', 'password-management']);
  }

  getAddress() {
    this.router.navigate(['/', 'delivery-address']);
  }

  myFavouriteStores() {
    this.router.navigate(['/stores/favourite-store']);
  }

  logout() {
    this.auth.logout();
    this.cartService.removeAllCartItems();
    this.cartService.removeVoucher();
    this.navCtrl.navigateRoot(['/home/tabs/categories']);
  }

}
