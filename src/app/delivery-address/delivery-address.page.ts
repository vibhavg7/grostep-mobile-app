import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { AlertController, NavController, ToastController, Platform, IonInfiniteScroll } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import {
  Plugins,
  Capacitor
} from '@capacitor/core';
import { CartService } from '../cart/cart.service';
import { switchMap } from 'rxjs/operators';
const { Storage } = Plugins;
@Component({
  selector: 'app-delivery-address',
  templateUrl: './delivery-address.page.html',
  styleUrls: ['./delivery-address.page.scss'],
})
export class DeliveryAddressPage implements OnInit {

  addressListCount: any;
  cartList: any;
  addressIsSelected = false;
  city: any = '';
  errorMessage: any;
  storeId: string;
  prevPage: any = '';
  addressList: any = [];
  skeletonStoreCount: any;
  isLoading = false;
  currentPage = 1;
  pageSize = 10;
  totalPages: number;
  @ViewChild(IonInfiniteScroll, { static: false }) infiniteScroll: IonInfiniteScroll;
  constructor(
    private platform: Platform,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private navCtrl: NavController,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private cartService: CartService,
    private zone: NgZone,
    private auth: AuthService) { }

  ngOnInit() {
    this.skeletonStoreCount = new Array(10);
  }

  ionViewWillEnter() {
    this.platform.backButton.subscribeWithPriority(0, () => {
      const arrData: any = this.router.url.split(';');
      if (arrData[0] === '/delivery-address' && arrData.length === 3) {
        this.navCtrl.pop();
      } else {
        this.navCtrl.navigateRoot(['/home/tabs/profile']);
      }
    });
    this.isLoading = true;
    this.addressList = [];
    this.currentPage = 1;
    this.addressListCount = 0;
    this.prevPage = this.activatedRoute.snapshot.paramMap.get('prevPage');
    this.storeId = this.activatedRoute.snapshot.paramMap.get('storeId');
    setTimeout(() => {
      this.getObject();
    }, 500);
  }

  async getObject(event?) {
    this.cartService.getAllCartItems().subscribe((data) => {
      this.cartList = JSON.parse(data.value);
      const deliveryAddress = JSON.parse(localStorage.getItem('customeraddress'));
      if (this.prevPage === 'cartpage') {
        if (deliveryAddress.length > 0 && this.cartList && this.cartList.items.length > 0) {
          this.city = this.cartList.items[0].store_city.trim();
          this.addressList = deliveryAddress.filter((address) => {
            return address.city.trim().toLowerCase() === this.city.toLowerCase();
          });
          this.addressListCount = this.addressList.length;
          this.totalPages = Math.ceil(this.addressListCount / this.pageSize);
        }
        this.isLoading = false;
      } else {
        if (deliveryAddress.length > 0) {
          this.addressList = deliveryAddress;
        } else {
          this.addressList = [];
        }
        this.isLoading = false;
      }
    });
  }

  addressSelected(address: any) {
    if (this.prevPage === 'cartpage') {
      this.checkServiceLocation(address.city, address.state, address.country, address.pincode).subscribe((data) => {
        this.isLoading = false;
        if (+data.locationresponse.servicable_area_check === 1) {
          if (this.cartList !== null && this.cartList.items != null && this.cartList.items.length > 0) {
            const storeLatLong = [];
            const customerLatLong = [];
            const storeLat = this.cartList.items[0].store_latitude;
            const storeLong = this.cartList.items[0].store_longitude;
            customerLatLong.push(new google.maps.LatLng(address.latitude, address.longitude));
            storeLatLong.push(new google.maps.LatLng(storeLat, storeLong));
            this.checkDistanceBetwenStoreAndCustomer(address.city, address.state, address.country, address.pincode,
              customerLatLong, storeLatLong, address.address2, address.address, address.locality,
              address.latitude, address.longitude, address.delivery_address_id);
          } else {

          }
        } else {
          this.isLoading = false;
          this.router.navigate(['/', 'notservicablepage', { page: this.prevPage }]);
        }
      });
    }
  }


  checkDistanceBetwenStoreAndCustomer(city, state, country, zipcode, customerLatLong, storeLatLong,
                                      locationaddress, completeaddress, locality, lat, lng, deliveryAddressId?) {
    console.log(deliveryAddressId);
    this.isLoading = true;
    new google.maps.DistanceMatrixService().getDistanceMatrix({
      origins: customerLatLong,
      destinations: storeLatLong,
      travelMode: google.maps.TravelMode.DRIVING,
      unitSystem: google.maps.UnitSystem.METRIC,
    }, (results: any) => {
      this.zone.run(() => {
        this.isLoading = false;
        const distanceData = results.rows;
        const distanceFromCustomer = distanceData[0].elements[0].distance.value;
        if (distanceFromCustomer >= 15000) {
          // tslint:disable-next-line:max-line-length
          this.showMessageAlert('Location is too far', 'The location is too far away from the store for grostep to Deliver. Please pick a location near to your store');
        } else {
          if (deliveryAddressId) {
            this.auth.selectDeliveryAddress(deliveryAddressId, city).pipe(
              switchMap((data: any) => {
                const selectedAddressData: any = data.address[0][0];
                console.log(selectedAddressData);
                this.setObject(selectedAddressData.city, selectedAddressData.state, selectedAddressData.country,
                  selectedAddressData.pincode, selectedAddressData.latitude, selectedAddressData.longitude,
                  selectedAddressData.address2, selectedAddressData.address, selectedAddressData.locality,
                  selectedAddressData.stateShortName, selectedAddressData.countryShortName);
                return this.auth.getUserProfile();
              })
            ).subscribe ( (data1: any) => {
              if (data1.status === 200) {
                this.presentToast('Address successfully updated');
              } else {
                this.presentToast('Unable to update address');
              }
              if (this.prevPage === 'cartpage') {
                this.navCtrl.pop();
              } else {
                this.navCtrl.navigateRoot('/home/tabs/profile');
              }
              this.isLoading = false;
              this.presentToast('Delivery address successfully changed');
            });
          }
        }
      });
    });
  }

  checkServiceLocation(city, state, country, zipcode) {
    this.isLoading = true;
    return this.auth.checkServiceLocation(city, state, country, zipcode);
  }

  deleteDeliveryAddress(address) {
    if (address.status === 1) {
      this.presentToast('Selected address cannot be deleted');
    } else {
      this.alertCtrl
        .create({
          header: 'Confirm Delete',
          message: 'Are you sure you want to delete the address',
          buttons: [
            {
              text: 'Cancel',
              cssClass: 'cancelcss',
              handler: () => {
                console.log('Cancel clicked');
              }
            },
            {
              text: 'YES',
              cssClass: 'removecss',
              handler: () => {
                // console.log('yes clicked');
                this.auth.deleteDeliveryAddress(address.delivery_address_id)
                  .subscribe((data: any) => {
                    console.log(data);
                    if (data.status === 200) {
                      const itemIndex = this.addressList.findIndex(item => item.delivery_address_id ===
                        address.delivery_address_id);
                      if (itemIndex > -1) {
                        this.addressList.splice(itemIndex, 1);
                        this.addressListCount = this.addressList.length;
                        localStorage.setItem('customeraddress', JSON.stringify(this.addressList));
                      }
                      // this.navCtrl.navigateRoot('/home/tabs/profile');
                      this.presentToast('Address deleted successfully');
                    } else {
                      this.presentToast('Unable to delete address');
                    }
                  });

              }
            }]
        })
        .then(alertEl => alertEl.present());
    }
  }

  addNewAddress() {
    const prevPage = this.prevPage;
    const storeId = this.storeId;
    const obj = { addressId: '' };
    Object.assign(obj, prevPage === null ? null : { prevPage });
    Object.assign(obj, storeId === null ? null : { storeId });
    this.router.navigate(['/delivery-address/add-delivery-address', obj]);
  }

  editDeliveryAddress(address) {
    const prevPage = this.prevPage;
    const storeId = this.storeId;
    const obj = { addressId: address.delivery_address_id };
    Object.assign(obj, prevPage === null ? null : { prevPage });
    Object.assign(obj, storeId === null ? null : { storeId });
    this.router.navigate(['/delivery-address/add-delivery-address', obj]);
  }

  async presentToast(msg) {
    const toast = await this.toastCtrl.create({ message: msg, duration: 1000, position: 'middle' });

    toast.present();
  }

  backToHome() {
    const arrData: any = this.router.url.split(';');
    if (arrData[0] === '/delivery-address' && arrData.length === 3) {
      this.navCtrl.pop();
    } else {
      this.navCtrl.navigateRoot(['/home/tabs/profile']);
    }
  }
  async setObject(city, state, country, zipcode, lat, long, locationaddress, completeaddress, locality, stateShortName, countryShortName) {
    await Storage.set({
      key: 'usertempaddress1',
      value: JSON.stringify({
        city,
        state,
        country,
        zipcode,
        lat,
        long,
        locationaddress,
        completeaddress,
        locality,
        stateShortName, countryShortName
      })
    });
  }

  private showMessageAlert(header, message) {
    this.alertCtrl.create({
      header,
      message,
      buttons: [
        {
          text: 'Okay',
          handler: () => {
            // this.router.navigate(['/', 'categories', this.categoryId, 'stores']);
            // this.router.navigate(['']);
          }
        }
      ]
    }).then(alertCtrl => alertCtrl.present());
  }


  // loadMore(event) {
  //   console.log(event);
  //   if (this.currentPage === this.totalPages) {
  //     event.target.disabled = true;
  //   } else {
  //     this.currentPage++;
  //     this.getObject(event);
  //   }
  // }

  ionViewWillLeave() {
    // console.log('ionViewWillLeave');
    // this.infiniteScroll.disabled = false;
    // this.infiniteScroll.position = 'bottom';
  }

}
