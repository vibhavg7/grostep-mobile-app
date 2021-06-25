import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { NavController, AlertController } from '@ionic/angular';
import { OnEnter } from '../on-enter';
import { Subscription } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { CartService } from '../../cart/cart.service';
import { Plugins } from '@capacitor/core';
import { DeliveryAddressService } from '../../delivery-address/delivery-address.service';
const { Storage } = Plugins;
@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit, OnEnter, OnDestroy {

  errorMessage: any;
  subscription: Subscription;
  private NAME_KEY = 'name';
  private TOKEN_KEY = 'bearertoken';
  public user: any;
  constructor(
    private router: Router,
    private navCtrl: NavController,
    private alertController: AlertController,
    private cartService: CartService,
    private authService: AuthService,
    private deliveryAddressService: DeliveryAddressService,
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
      console.log(this.user);
      this.user.customer_name = (this.user.customer_name !== null) ?
                        this.titleCase(this.user.customer_name) : '';
      // this.user.customer_name.replace(/^./, this.user.customer_name[0].toUpperCase());
    }, (error) => {
      this.errorMessage = error;
    });
  }

  editCustomerDetails() {
    this.authService.redirectUrl = 'profile';
    this.router.navigate(['/auth/add-user-info', { customerId: localStorage.getItem('customerid')}]);
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ionViewWillEnter() {
    this.getObject();
  }

  async getObject() {
    const ret = await Storage.get({ key: 'usertempaddress1' });
    const city = JSON.parse(ret.value).city;
    const lat = JSON.parse(ret.value).lat;
    const long = JSON.parse(ret.value).long;
    this.auth.Lat = lat;
    this.auth.Long = long;
    this.auth.City = city;
  }

  clickMenu(value) {
    this.navCtrl.navigateForward(`/${value}`);
  }

  getAddress() {
    this.router.navigate(['/', 'delivery-address', { prevPage: 'profilepage' }]);
  }

  myFavouriteStores() {
    this.router.navigate(['/stores/favourite-store']);
  }

  logout() {
    this.presentAlertConfirm();
  }

  titleCase(str) {
    const splitStr = str.toLowerCase().split(' ');
    for (let i = 0; i < splitStr.length; i++) {
      // You do not need to check if i is larger than splitStr length, as your for does that for you
      // Assign it back to the array
      splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    // Directly return the joined string
    return splitStr.join(' ');
  }

  async presentAlertConfirm() {
    const alert = await this.alertController.create({
      header: 'Logout!',
      message: 'Are you sure you want to logout!',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Logout',
          handler: () => {
            console.log('Confirm Okay');
            this.auth.logout();
            // this.cartService.removeAllCartItems();
            this.cartService.removeVoucher();
            this.deliveryAddressService.removeDeliveryInstructions();
            this.navCtrl.navigateRoot(['/home/tabs/categories']);
          }
        }
      ]
    });

    await alert.present();
  }

}
