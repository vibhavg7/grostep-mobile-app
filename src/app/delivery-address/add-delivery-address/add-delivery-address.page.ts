import { Component, OnInit, ApplicationRef } from '@angular/core';
import { Validators, FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { AuthService } from '../../auth/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NavController, AlertController, Platform, ToastController } from '@ionic/angular';
import { Coordinates } from '../../models/location.model';
import {
  Plugins,
  Capacitor
} from '@capacitor/core';
const { Storage } = Plugins;
import { Subscription } from 'rxjs';
import { concatMap } from 'rxjs/operators';
@Component({
  selector: 'app-add-delivery-address',
  templateUrl: './add-delivery-address.page.html',
  styleUrls: ['./add-delivery-address.page.scss'],
})
export class AddDeliveryAddressPage implements OnInit {

  buttonSubmitted = false;
  customerAddressData: any;
  subscription: Subscription;
  lng: any;
  lat: any;
  storeId: string;
  prevPage: string;
  isLoading = false;
  public addAddressForm: FormGroup;
  submitted = false;
  registerCredentials = {
    customer_name: '', address_type: '', landmark: '',
    address2: '', city: '', state: '', country: '', latitude: '', longitude: '', customer_id: '',
    flatNumber: '', address: '', pincode: '', phone: '', status: '', locality: '', stateShortName: '',
    countryShortName: ''
  };
  addressId: any = '';
  constructor(
    private authService: AuthService,
    private alertCtrl: AlertController,
    private navCtrl: NavController,
    private ref: ApplicationRef,
    public fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private platform: Platform,
    private toastCtrl: ToastController,
    private router: Router) {
    this.addAddressForm = fb.group({
      address_type: [null, Validators.required],
      customer_name: [null, Validators.compose([Validators.required, Validators.pattern('[a-zA-Z ]{2,80}$')])],
      pincode: [null, Validators.compose([Validators.required, Validators.pattern('^[0-9]{6}')])],
      flatNumber: [null, Validators.compose([Validators.required])],
      address: [null, Validators.compose([Validators.required])],
      address2: [null, Validators.compose([Validators.required])],
      landmark: [null, Validators.compose([Validators.required])],
      phone: [null, Validators.compose([Validators.required, Validators.pattern('^[0-9]{10}')])],
    });
  }

  get f() { return this.addAddressForm.controls; }

  public ngOnInit() {
  }

  async locateUser() {
    const ret = await Storage.get({ key: 'usertempaddress1' });
    this.lat = JSON.parse(ret.value).lat;
    this.lng = JSON.parse(ret.value).long;

    const completeaddress = JSON.parse(ret.value).completeaddress;
    const locationaddress = JSON.parse(ret.value).locationaddress;
    const city = JSON.parse(ret.value).city;
    const state = JSON.parse(ret.value).state;
    const country = JSON.parse(ret.value).country;
    const locality = JSON.parse(ret.value).locality;
    const stateShortName = JSON.parse(ret.value).stateShortName;
    const countryShortName = JSON.parse(ret.value).countryShortName;
    const zipcode = JSON.parse(ret.value).zipcode;

    this.registerCredentials.latitude = this.lat;
    this.registerCredentials.longitude = this.lng;

    this.registerCredentials.address = completeaddress;
    this.registerCredentials.address2 = locationaddress;
    this.registerCredentials.city = city;
    this.registerCredentials.state = state;
    this.registerCredentials.country = country;
    this.registerCredentials.locality = locality;
    this.registerCredentials.stateShortName = stateShortName;
    this.registerCredentials.countryShortName = countryShortName;
    this.registerCredentials.pincode = zipcode;

    console.log(this.registerCredentials);

    // this.authService.getAddress(this.lat, this.lng).subscribe(((data: any) => {
    //   // console.log(data);
    //   this.filterAddress(data.suggestedLocations.results, this.lat, this.lng);
    // }));
  }
  ionViewWillEnter() {
    this.platform.backButton.subscribeWithPriority(0, () => {
      this.navCtrl.pop();
    });
    this.addressId = this.activatedRoute.snapshot.paramMap.get('addressId');
    this.prevPage = this.activatedRoute.snapshot.paramMap.get('prevPage');
    this.storeId = this.activatedRoute.snapshot.paramMap.get('storeId');
    // console.log(this.storeId);
    // console.log(this.prevPage);
    // console.log(this.addressId);
    if (this.addressId !== '') {
      this.customerAddressData = this.activatedRoute.snapshot.data.resolvedAddress.customerAddress;
      console.log(this.customerAddressData);
      //   this.authService.getDelievryAddressById(this.addressId).subscribe(addressinfo => {
      this.registerCredentials.customer_name = this.customerAddressData.customer_name;
      this.registerCredentials.address_type = this.customerAddressData.address_type;
      this.registerCredentials.landmark = this.customerAddressData.landmark;
      this.registerCredentials.address = this.customerAddressData.address;
      this.registerCredentials.address2 = this.customerAddressData.address2;
      this.registerCredentials.city = this.customerAddressData.city;
      this.registerCredentials.state = this.customerAddressData.state;
      this.registerCredentials.country = this.customerAddressData.country;
      this.registerCredentials.latitude = this.customerAddressData.latitude;
      this.registerCredentials.longitude = this.customerAddressData.longitude;
      this.registerCredentials.pincode = this.customerAddressData.pincode;
      this.registerCredentials.phone = this.customerAddressData.phone;
      this.registerCredentials.flatNumber = this.customerAddressData.flatNumber;
      this.registerCredentials.status = this.customerAddressData.status;
      this.registerCredentials.locality = this.customerAddressData.locality;
      this.registerCredentials.stateShortName = this.customerAddressData.stateShortName;
      this.registerCredentials.countryShortName = this.customerAddressData.countryShortName;
      this.registerCredentials.customer_id = localStorage.getItem('customerid');
      //   });
    } else {
      this.locateUser();
    }
  }

  ionViewWillLeave() {
    // console.log('ionViewWillLeave');
  }

  ionViewDidLeave() {
    // console.log('ionViewDidLeave');
  }

  addDelievryAddress() {
    this.submitted = true;
    this.isLoading = true;
    if (!this.addAddressForm.valid) {
      this.presentToast('Please fill all the entries');
      this.isLoading = false;
      return;
    }
    if (this.addressId !== '') {
      this.isLoading = true;
      this.buttonSubmitted = true;
      this.authService.editDelievryAddress(this.addressId, this.registerCredentials).subscribe(data => {
        if (data.status === 200) {
          if (this.prevPage === 'cartpage') {
            // this.navCtrl.navigateBack(`/cart/${this.storeId}`);
            this.navCtrl.pop();
          } else {
            this.navCtrl.navigateRoot('/home/tabs/profile');
          }
          this.presentToast('Address successfully updated');
        } else {
          if (this.prevPage === 'cartpage') {
            // this.navCtrl.navigateBack(`/cart/${this.storeId}`);
            this.navCtrl.pop();
          } else {
            this.navCtrl.navigateRoot('/home/tabs/profile');
          }
          this.presentToast('Unable to update address');
        }
        this.isLoading = false;
        this.submitted = false;
        this.buttonSubmitted = false;
      });
    } else {
      this.isLoading = true;
      this.buttonSubmitted = true;
      this.registerCredentials.customer_id = localStorage.getItem('customerid');
      this.authService.addDelievryAddress(this.registerCredentials).pipe(
        concatMap(response => this.authService.getUserProfile()))
        .subscribe((data: any) => {
          if (data.status === 200) {
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
          this.submitted = false;
          this.buttonSubmitted = false;
        });
    }
  }

  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;

  }

  filterAddress(results, lat, lng) {
    let zipcode; let city; let state; let country; let locationaddress; let completeaddress = ''; let locality;
    let stateShortName; let countryShortName;
    console.log(results);
    results.forEach(data => {
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
    this.registerCredentials.address = completeaddress;
    this.registerCredentials.address2 = locationaddress;
    this.registerCredentials.city = city;
    this.registerCredentials.state = state;
    this.registerCredentials.country = country;
    this.registerCredentials.locality = locality;
    this.registerCredentials.stateShortName = stateShortName;
    this.registerCredentials.countryShortName = countryShortName;
    console.log(this.registerCredentials);
  }

  private showMessageAlert() {
    this.alertCtrl.create({
      header: 'Could not fetch location',
      message: 'Please use a map to pick a location!'
    }).then(alertCtrl => alertCtrl.present());
  }

  changeAddress() {
    // console.log('ggggg');
    // this.navCtrl.navigateForward(['/changedeliverylocation']);
    this.router.navigate(['/', 'changedeliverylocation', { page: 'adddeliveryaddress' }]);
  }

  backToHome() {
    this.navCtrl.pop();
  }

  async presentToast(msg) {
    const toast = await this.toastCtrl.create({ message: msg, duration: 1000, position: 'middle' });
    toast.present();
  }

}
