// tslint:disable-next-line:no-reference-import
/// <reference types="@types/googlemaps" />
import { Component, OnInit, ViewChild, AfterViewInit, Input, NgZone } from '@angular/core';
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
    private zone: NgZone,
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
      this.zone.run(() => {
        const place = autocomplete.getPlace();
        console.log(place);
        this.auth.getAddress(place.geometry.location.lat(), place.geometry.location.lng()).subscribe(((data: any) => {
          this.filterAddress(data.suggestedLocations.results, place.geometry.location.lat(), place.geometry.location.lng());
        }));
      });
    });
  }

  filterAddress(result, lat, lng) {
    // let routeaddress;
    let zipcode; let city; let state; let country; let locationaddress; let completeaddress = ''; let locality;
    let stateShortName; let countryShortName;
    result.forEach(data => {
      if (data.types.indexOf('postal_code') !== -1) {
        zipcode = data.address_components[0].long_name;
      }
      if (data.types.indexOf('sublocality_level_2') !== -1) {
      }
      if (data.types.indexOf('sublocality_level_1') !== -1) {
        locationaddress = data.address_components[0].long_name;
      }
      if (data.types.indexOf('route') !== -1) {
        locationaddress = data.address_components[0].long_name + data.address_components[2].long_name;
        // routeaddress = data.address_components[1].long_name;
      }
      if (data.types.indexOf('street_address') !== -1) {
        completeaddress = data.formatted_address;
      }
      if (data.types.indexOf('locality') !== -1 && data.types.indexOf('political') !== -1) {
        city = data.address_components[0].long_name;
        locality = data.address_components[1].long_name;
        state = data.address_components[2].long_name;
        stateShortName = data.address_components[2].short_name;
        country = data.address_components[3].long_name;
        countryShortName = data.address_components[3].short_name;
      }
    });
    this.checkServiceLocation(city, stateShortName, countryShortName, zipcode).subscribe((data) => {
      if (+data.locationresponse.servicable_area_check === 1) {
        const serviceable_area_id = data.locationresponse.serviceable_area_id;
        if (this.cartList !== null && this.cartList.items != null && this.cartList.items.length > 0) {
          const storeLatLong = [];
          const customerLatLong = [];
          const storeLat = this.cartList.items[0].store_latitude;
          const storeLong = this.cartList.items[0].store_longitude;
          customerLatLong.push(new google.maps.LatLng(lat, lng));
          storeLatLong.push(new google.maps.LatLng(storeLat, storeLong));
          this.checkDistanceBetwenStoreAndCustomer(city, state, country, zipcode, customerLatLong, storeLatLong,
            locationaddress, completeaddress, locality, lat, lng, stateShortName, countryShortName, '', serviceable_area_id);
        } else {
          this.setObject(city, state, country, zipcode, lat, lng,
            locationaddress, completeaddress, locality, stateShortName, countryShortName, serviceable_area_id);
          if (this.page === 'adddeliveryaddress') {
            this.navCtrl.pop();
          } else {
            this.navCtrl.navigateRoot(['/home/tabs/categories']);
          }
          this.presentToast('Delivery address successfully updated');
        }
      } else {
        this.isLoading1 = false;
        this.router.navigate(['/', 'notservicablepage', { page: this.page }]);
      }
    });
  }


  addressSelected(address: any) {
    this.checkServiceLocation(address.city, address.state, address.country, address.pincode).subscribe((data) => {
      this.isLoading1 = false;
      if (+data.locationresponse.servicable_area_check === 1) {
        const serviceable_area_id = data.locationresponse.serviceable_area_id;
        if (this.cartList !== null && this.cartList.items != null && this.cartList.items.length > 0) {
          const storeLatLong = [];
          const customerLatLong = [];
          const storeLat = this.cartList.items[0].store_latitude;
          const storeLong = this.cartList.items[0].store_longitude;
          customerLatLong.push(new google.maps.LatLng(address.lat, address.lng));
          storeLatLong.push(new google.maps.LatLng(storeLat, storeLong));
          this.checkDistanceBetwenStoreAndCustomer(address.city, address.state, address.country, address.pincode,
            customerLatLong, storeLatLong, address.address2, address.address, address.locality,
            address.lat, address.lng, address.stateShortName, address.stateShortName, address.delivery_address_id, serviceable_area_id);
        } else {
          if (address.delivery_address_id) {
            this.auth.selectDeliveryAddress(address.delivery_address_id, address.city)
              .subscribe((data1: any) => {
                if (data1.status === 200) {
                  const selectedAddressData: any = data1.address[0][0];
                  this.setObject(selectedAddressData.city, selectedAddressData.state, selectedAddressData.country,
                    selectedAddressData.pincode, selectedAddressData.latitude, selectedAddressData.longitude,
                    selectedAddressData.address2, selectedAddressData.address, selectedAddressData.locality,
                    selectedAddressData.stateShortName, selectedAddressData.countryShortName, serviceable_area_id);
                  if (this.page === 'adddeliveryaddress') {
                    this.navCtrl.pop();
                  } else {
                    this.navCtrl.navigateRoot(['/home/tabs/categories']);
                  }
                  this.presentToast('Delivery address successfully updated');
                }
              });
          }
        }
      } else {
        this.isLoading1 = false;
        this.router.navigate(['/', 'notservicablepage', { page: this.page }]);
      }
    });
  }

  checkDistanceBetwenStoreAndCustomer(city, state, country, zipcode, customerLatLong, storeLatLong,
    locationaddress, completeaddress, locality, lat, lng, stateShortName,
    countryShortName, deliveryAddressId, serviceableAreaId?) {
    console.log(deliveryAddressId);
    new google.maps.DistanceMatrixService().getDistanceMatrix({
      origins: customerLatLong,
      destinations: storeLatLong,
      travelMode: google.maps.TravelMode.DRIVING,
      unitSystem: google.maps.UnitSystem.METRIC,
    }, (results: any) => {
      this.zone.run(() => {
        this.isLoading1 = false;
        const distanceData = results.rows;
        const distanceFromCustomer = distanceData[0].elements[0].distance.value;
        if (distanceFromCustomer >= 15000) {
          // tslint:disable-next-line:max-line-length
          this.showMessageAlert('Location is too far', 'The location is too far away from the store for grostep to Deliver. Please pick a location near to your store');
        } else {
          if (deliveryAddressId) {
            this.auth.selectDeliveryAddress(deliveryAddressId, city)
              .subscribe((data1: any) => {
                if (data1.status === 200) {
                  // console.log(data1);
                  const selectedAddressData: any = data1.address[0][0];
                  this.setObject(selectedAddressData.city, selectedAddressData.state, selectedAddressData.country,
                    selectedAddressData.pincode, selectedAddressData.latitude, selectedAddressData.longitude,
                    selectedAddressData.address2, selectedAddressData.address,
                    selectedAddressData.locality, stateShortName, countryShortName, serviceableAreaId);
                  if (this.page === 'adddeliveryaddress') {
                    this.navCtrl.pop();
                  } else {
                    this.navCtrl.navigateRoot(['/home/tabs/categories']);
                  }
                  this.presentToast('Delivery address successfully updated');
                }
              });
          } else {
            this.setObject(city, state, country, zipcode, lat, lng,
              locationaddress, completeaddress, locality, stateShortName, countryShortName, serviceableAreaId);
            if (this.page === 'adddeliveryaddress') {
              this.navCtrl.pop();
            } else {
              this.navCtrl.navigateRoot(['/home/tabs/categories']);
            }
            this.presentToast('Delivery address successfully updated');
          }
        }
      });
    });
  }

  checkServiceLocation(city, state, country, zipcode) {
    this.isLoading1 = true;
    return this.auth.checkServiceLocation(city, state, country, zipcode);
  }

  backToHome() {
    this.navCtrl.pop();
  }

  async setObject(city, state, country, zipcode, lat, long,
                  locationaddress, completeaddress, locality, stateShortName, countryShortName, serviceableAreaId) {
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
        // routeaddress,
        locality,
        stateShortName,
        countryShortName,
        serviceableAreaId
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
    }).catch((error) => {
      // alert('Error getting location' + error);
      this.geolocation.getCurrentPosition().then((resp) => {
        // console.log(resp);
        this.getLocationCoordinatesImpl(resp);
      });
    });
  }

  getLocationCoordinatesImpl(resp: any) {
    this.locationCoords.latitude = resp.coords.latitude;
    this.locationCoords.longitude = resp.coords.longitude;
    this.locationCoords.accuracy = resp.coords.accuracy;
    this.locationCoords.timestamp = resp.timestamp;
    // alert(this.locationCoords.latitude + '-' + this.locationCoords.longitude
    //       + '-' + this.locationCoords.accuracy + '-' + this.locationCoords.timestamp);
    this.auth.getAddress(this.locationCoords.latitude, this.locationCoords.longitude).subscribe(((data: any) => {
      this.filterAddress(data.suggestedLocations.results, this.locationCoords.latitude, this.locationCoords.longitude);
    }));
  }

  loadMore(event) {
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
