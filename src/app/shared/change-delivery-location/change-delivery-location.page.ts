// tslint:disable-next-line:no-reference-import
/// <reference types="@types/googlemaps" />
import { Component, OnInit, ViewChild, AfterViewInit, Input } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Coordinates } from '../../models/location.model';
import { get, set } from '../storage';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';

import {
  Plugins,
  Capacitor
} from '@capacitor/core';
import { AuthService } from '../../auth/auth.service';
import { AlertController, NavController, Platform, ToastController, IonInfiniteScroll } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { CartService } from '../../cart/cart.service';
import { DeliveryAddressService } from '../../delivery-address/delivery-address.service';
const { Storage } = Plugins;
@Component({
  selector: 'app-change-delivery-location',
  templateUrl: './change-delivery-location.page.html',
  styleUrls: ['./change-delivery-location.page.scss'],
})
export class ChangeDeliveryLocationPage implements OnInit, AfterViewInit {
  cartList: any;
  skeletonStoreCount: any[];
  addressListCount: any;
  isLoading1: boolean;
  errorMessage: any;
  isLoading: boolean;
  addressList: any = [];
  currentuser: boolean;
  page: string;
  locationCoords: any;
  @ViewChild('addresstext', { static: false }) addresstext: any;
  @Input() adressType = 'address';
  autocompleteInput: any;
  map: google.maps.Map;
  google: any;
  currentPage = 1;
  pageSize = 10;
  totalPages: number;
  @ViewChild(IonInfiniteScroll, { static: false }) infiniteScroll: IonInfiniteScroll;
  constructor(
    private androidPermissions: AndroidPermissions,
    private auth: AuthService,
    private geolocation: Geolocation,
    private locationAccuracy: LocationAccuracy,
    private activatedRoute: ActivatedRoute,
    private cartService: CartService,
    private deliveryAddressService: DeliveryAddressService,
    private toastCtrl: ToastController,
    private platform: Platform,
    private router: Router,
    private alertCtrl: AlertController,
    private navCtrl: NavController) {
    this.locationCoords = {
      latitude: '',
      longitude: '',
      accuracy: '',
      timestamp: ''
    };
  }

  ngOnInit() {
    this.page = this.activatedRoute.snapshot.paramMap.get('page');
    this.skeletonStoreCount = new Array(10);
  }

  ionViewWillEnter() {
    this.platform.backButton.subscribeWithPriority(0, () => {
      if (this.router.url.split(';')[0] === '/changedeliverylocation' && this.page === 'mainpage') {
        // tslint:disable-next-line:no-string-literal
        navigator['app'].exitApp();
      } else {
        this.navCtrl.pop();
      }
    });
    this.cartService.getAllCartItems().subscribe((data) => {
      this.cartList = JSON.parse(data.value);
    });
    this.currentuser = this.auth.isauthenticated;
    if (this.currentuser) {
      this.isLoading = true;
      setTimeout(() => {
        this.getCustomerAddreses();
      }, 500);
    }
  }

  getCustomerAddreses(event?) {
    this.auth.getCustomerAddressesById('', this.currentPage, this.pageSize).subscribe((data) => {
      this.addressList = this.addressList.concat(data.addressInfo);
      this.addressListCount = data.customer_address_count[0].customer_address_count;
      this.totalPages = Math.ceil(this.addressListCount / this.pageSize);
      this.isLoading = false;
      if (event) {
        event.target.complete();
      }
    }, (error) => {
      this.isLoading = false;
      this.errorMessage = error;
    });

  }

  ngAfterViewInit() {
    this.platform.backButton.subscribeWithPriority(0, () => {
      if (this.router.url.split(';')[0] === '/changedeliverylocation' && this.page === 'mainpage') {
        // tslint:disable-next-line:no-string-literal
        navigator['app'].exitApp();
      }
    });
    this.getPlaceAutocomplete();
  }

  private getPlaceAutocomplete() {
    const autocomplete = new google.maps.places.Autocomplete(this.addresstext.nativeElement,
      {
        componentRestrictions: { country: 'IN' },
        types: ['establishment', 'geocode']  // 'establishment' / 'address' / 'geocode'
      });
    google.maps.event.addListener(autocomplete, 'place_changed', () => {
      const place = autocomplete.getPlace();
      console.log(place);
      this.auth.getAddress(place.geometry.location.lat(), place.geometry.location.lng()).subscribe(((data: any) => {
        this.filterAddress(data.results, place.geometry.location.lat(), place.geometry.location.lng());
      }));
    });
  }
  filterAddress(result, lat, lng) {
    console.log(result);
    let zipcode; let city; let state; let country; let locationaddress; let completeaddress = ''; let routeaddress; let locality;
    result.forEach(data => {
      if (data.types.indexOf('postal_code') !== -1) {
        zipcode = data.address_components[0].long_name;
      }
      if (data.types.indexOf('sublocality_level_2') !== -1) {
      }
      if (data.types.indexOf('sublocality_level_1') !== -1) {
        locationaddress = data.address_components[0].long_name;
      }
      if (data.types.indexOf('locality') !== -1) {
        locality = data.address_components[0].long_name;
      }
      // if (data.types === 'locality') {
      //   locality = data.address_components[0].long_name;
      // }
      if (data.types.indexOf('route') !== -1) {
        locationaddress = data.address_components[0].long_name + data.address_components[2].long_name;
        completeaddress = data.address_components[0].long_name + ',' +
          data.address_components[1].long_name + ',' +
          data.address_components[2].long_name + ',' + data.address_components[3].long_name + ',' +
          data.address_components[4].long_name + ',';
        routeaddress = data.address_components[1].long_name;
      }
      if (data.types.indexOf('administrative_area_level_2') !== -1) {
        city = data.address_components[0].long_name;
        state = data.address_components[1].long_name;
        country = data.address_components[2].long_name;
        completeaddress += city + ',' + state + ',' + country;
      }
    });
    this.checkServiceLocation(city, state, country, zipcode, lat, lng, locationaddress, completeaddress, routeaddress, locality);
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

  private showMessageAlert() {
    this.alertCtrl.create({
      header: 'Could not fetch location',
      message: 'Please use a map to pick a location!'
    }).then(alertCtrl => alertCtrl.present());
  }

  checkGPSPermission() {
    this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION).then(
      result => {
        if (result.hasPermission) {
          this.askToTurnOnGPS();
        } else {
          this.requestGPSPermission();
        }
      },
      err => {
        alert(err);
      }
    );
  }

  requestGPSPermission() {
    this.locationAccuracy.canRequest().then((canRequest: boolean) => {
      if (canRequest) {
        alert('4');
      } else {
        this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION)
          .then(
            () => {
              // call method to turn on GPS
              this.askToTurnOnGPS();
            },
            error => {
              alert('requestPermission Error requesting location permissions ' + error);
            }
          );
      }
    });
  }

  askToTurnOnGPS() {
    this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(
      () => {
        // When GPS Turned ON call method to get Accurate location coordinates
        this.getLocationCoordinates();
      },
      error => {
        alert('Error requesting location permissions ' + JSON.stringify(error));
      }
    );
  }

  getLocationCoordinates() {
    this.geolocation.getCurrentPosition().then((resp) => {
      this.getLocationCoordinatesImpl(resp);
      // this.locationCoords.latitude = resp.coords.latitude;
      // this.locationCoords.longitude = resp.coords.longitude;
      // this.locationCoords.accuracy = resp.coords.accuracy;
      // this.locationCoords.timestamp = resp.timestamp;
      // this.authService.getAddress(this.locationCoords.latitude, this.locationCoords.longitude).subscribe(((data: any) => {
      //   this.filterAddress(data.results, this.locationCoords.latitude, this.locationCoords.longitude);
      // }));
    }).catch((error) => {
      // alert('Error getting location' + error);
      this.geolocation.getCurrentPosition().then((resp) => {
        console.log(resp);
        this.getLocationCoordinatesImpl(resp);
        // this.locationCoords.latitude = resp.coords.latitude;
        // this.locationCoords.longitude = resp.coords.longitude;
        // this.locationCoords.accuracy = resp.coords.accuracy;
        // this.locationCoords.timestamp = resp.timestamp;
        // this.authService.getAddress(this.locationCoords.latitude, this.locationCoords.longitude).subscribe(((data: any) => {
        //   this.filterAddress(data.results, this.locationCoords.latitude, this.locationCoords.longitude);
        // }));
      });
    });
  }

  getLocationCoordinatesImpl(resp: any) {
    this.locationCoords.latitude = resp.coords.latitude;
    this.locationCoords.longitude = resp.coords.longitude;
    this.locationCoords.accuracy = resp.coords.accuracy;
    this.locationCoords.timestamp = resp.timestamp;
    this.auth.getAddress(this.locationCoords.latitude, this.locationCoords.longitude).subscribe(((data: any) => {
      this.filterAddress(data.results, this.locationCoords.latitude, this.locationCoords.longitude);
    }));
  }

  addressSelected(address: any) {
    this.isLoading1 = true;
    this.auth.selectDeliveryAddress(address.delivery_address_id, address.city)
      .subscribe((data1: any) => {
        if (data1.status === 200) {
          const data: any = data1.address[0][0];
          this.checkServiceLocation(data.city, data.state, data.country, data.pincode, data.latitude, data.longitude,
            data.address2, data.address, '', data.locality);
          // this.setObject(data.city, data.state, data.country, data.pincode, data.latitude, data.longitude,
          // data.address2, data.address, '');
          // this.navCtrl.navigateRoot(['/home/tabs/categories']);
        }
      });
  }

  async emptyCartProducts(city, state, country, zipcode, lat, long, locationaddress, completeaddress, routeaddress, locality) {
    if (this.cartList != null && this.cartList.length > 0) {
      const ret = await Storage.get({ key: 'cartList' });
      const storeCity = JSON.parse(ret.value)[0].store_city;
      if (storeCity.toLowerCase() !== city.toLowerCase()) {
        this.isLoading1 = false;
        this.alertCtrl
          .create({
            header: 'Remove cart item?',
            message: 'Are you sure you want to remove items from previous city',
            buttons: [
              {
                text: 'Cancel',
                cssClass: 'cancelcss',
                handler: () => {
                }
              },
              {
                text: 'Remove',
                cssClass: 'removecss',
                handler: () => {
                  this.cartList = this.cartService.removeAllCartItems();
                  this.cartService.removeVoucher();
                  this.deliveryAddressService.removeDeliveryInstructions();
                  this.setObject(city, state, country, zipcode, lat, long, locationaddress, completeaddress, routeaddress, locality);
                  // this.isLoading1 = false;
                  this.navCtrl.navigateRoot(['/home/tabs/categories']);
                  this.presentToast('Delivery address successfully updated');
                }
              }
            ]
          })
          .then(alertEl => alertEl.present());
      } else {
        this.setObject(city, state, country, zipcode, lat, long, locationaddress, completeaddress, routeaddress, locality);
        this.isLoading1 = false;
        this.navCtrl.navigateRoot(['/home/tabs/categories']);
        this.presentToast('Delivery address successfully updated');
      }
    } else {
      this.setObject(city, state, country, zipcode, lat, long, locationaddress, completeaddress, routeaddress, locality);
      this.isLoading1 = false;
      this.navCtrl.navigateRoot(['/home/tabs/categories']);
      this.presentToast('Delivery address successfully updated');
    }
  }

  checkServiceLocation(city, state, country, zipcode, lat, long, locationaddress, completeaddress, routeaddress, locality) {
    this.auth.checkServiceLocation(city, state, country, zipcode).subscribe((data) => {
      if (data.locationresponse.servicable_area_check === 0) {
        this.isLoading1 = false;
        this.navCtrl.navigateRoot(['/notservicablepage']);
      } else {
        this.emptyCartProducts(city, state, country, zipcode, lat, long, locationaddress, completeaddress, routeaddress, locality);
        // this.setObject(city, state, country, zipcode, lat, long, locationaddress, completeaddress, routeaddress, locality);
        // this.isLoading1 = false;
        // this.navCtrl.navigateRoot(['/home/tabs/categories']);
        // this.presentToast('Delivery address successfully updated');
      }
    });
  }

  loadMore(event) {
    console.log(event);
    if (this.currentPage === this.totalPages) {
      event.target.disabled = true;
    } else {
      this.currentPage++;
      this.getCustomerAddreses(event);
    }
  }

  ionViewWillLeave() {
    console.log('ionViewWillLeave');
    this.infiniteScroll.disabled = false;
    this.infiniteScroll.position = 'bottom';
  }

  async presentToast(msg) {
    const toast = await this.toastCtrl.create({ message: msg, duration: 1000, position: 'middle' });
    toast.present();
  }

}
