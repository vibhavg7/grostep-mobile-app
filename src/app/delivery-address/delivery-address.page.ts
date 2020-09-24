import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { AlertController, NavController, ToastController, Platform, IonInfiniteScroll } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import {
  Plugins,
  Capacitor
} from '@capacitor/core';
const { Storage } = Plugins;
@Component({
  selector: 'app-delivery-address',
  templateUrl: './delivery-address.page.html',
  styleUrls: ['./delivery-address.page.scss'],
})
export class DeliveryAddressPage implements OnInit {

  addressListCount: any;
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
    console.log(this.prevPage);
    setTimeout(() => {
      this.getObject();
    }, 500);
  }

  async getObject(event?) {
      const ret = await Storage.get({ key: 'usertempaddress1' });
      if (this.prevPage === 'cartpage') {
        this.city = JSON.parse(ret.value).city;
      } else {
        this.city = '';
      }
      this.auth.getCustomerAddressesById(this.city, this.currentPage, this.pageSize).subscribe((data) => {
        console.log(data);
        this.addressList = this.addressList.concat(data.addressInfo);
        this.addressListCount = data.customer_address_count[0].customer_address_count;
        this.totalPages = Math.ceil(this.addressListCount / this.pageSize);
        this.isLoading = false;
        if (event) {
          event.target.complete();
        }
      }, (error) => {
        this.errorMessage = error;
        this.isLoading = false;
      });
  }

  addressSelected(address: any) {
    if (!this.addressIsSelected && this.prevPage === 'cartpage') {
      this.addressIsSelected = true;
      this.isLoading = true;
      this.auth.selectDeliveryAddress(address.delivery_address_id, this.city)
      .subscribe((data1: any) => {
        if (data1.status === 200) {
          const data: any = data1.address[0][0];
          this.checkServiceLocation(data.city, data.state, data.country, data.pincode, data.latitude, data.longitude,
            data.address2, data.address, '', data.locality);
        }
      });
    }
  }

  checkServiceLocation(city, state, country, zipcode, lat, long, locationaddress, completeaddress, routeaddress, locality) {
    // console.log(city, state, country, zipcode, lat, long, locationaddress, completeaddress, routeaddress);
    this.auth.checkServiceLocation(city, state, country, zipcode).subscribe((data) => {
      if (data.locationresponse.servicable_area_check === 0) {
        this.navCtrl.navigateRoot(['/notservicablepage']);
      } else {
        this.setObject(city, state, country, zipcode, lat, long, locationaddress, completeaddress, routeaddress, locality);
        if (this.prevPage === 'cartpage') {
          // this.navCtrl.navigateBack(`/cart/${this.storeId}`);
          // this.navCtrl.navigateBack(['/cart', { storeId: this.storeId }]);
          this.navCtrl.pop();
        } else {
          this.navCtrl.navigateRoot('/home/tabs/profile');
        }
        this.isLoading = false;
        this.presentToast('Delivery address successfully changed');
        this.addressIsSelected = false;
        // this.navCtrl.navigateRoot(['/home/tabs/categories']);
        // this.presentToast('Delivery address successfully updated');
      }
    });
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
                      this.navCtrl.navigateRoot('/home/tabs/profile');
                      this.presentToast('Address deleted successfully');
                    }
                  });

              }
            }]
        })
        .then(alertEl => alertEl.present());
    }
  }

  addNewAddress() {
    this.router.navigate(['/delivery-address/add-delivery-address', { addressId: '', prevPage: this.prevPage, storeId: this.storeId }]);
  }

  editDeliveryAddress(address) {
    this.router.navigate(['/delivery-address/add-delivery-address', { addressId: address.delivery_address_id,
                          prevPage: this.prevPage, storeId: this.storeId }]);
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
  async setObject(city, state, country, zipcode, lat, long, locationaddress, completeaddress, routeaddress, locality) {
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
        routeaddress,
        locality
      })
    });
  }

  loadMore(event) {
    console.log(event);
    if (this.currentPage === this.totalPages) {
      event.target.disabled = true;
    } else {
      this.currentPage++;
      this.getObject(event);
    }
  }

  ionViewWillLeave() {
    console.log('ionViewWillLeave');
    this.infiniteScroll.disabled = false;
    this.infiniteScroll.position = 'bottom';
  }

}
