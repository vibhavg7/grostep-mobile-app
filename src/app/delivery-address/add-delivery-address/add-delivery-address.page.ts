import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { AuthService } from '../../auth/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-add-delivery-address',
  templateUrl: './add-delivery-address.page.html',
  styleUrls: ['./add-delivery-address.page.scss'],
})
export class AddDeliveryAddressPage implements OnInit {

  prevPage: string;
  public addAddressForm: FormGroup;
  registerCredentials = {
    customer_name: '', address_type: '', landmark: '',
    address2: '', city: '', state: '', country: '', latitude: '', longitude: '', customer_id: '',
    flatNumber: '', address: '', pincode: '', phone: '', status: ''
  };
  addressId: any = '';
  constructor(
    private authService: AuthService,
    private navCtrl: NavController,
    public fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private router: Router) {
    this.addAddressForm = fb.group({
      address_type: [null, Validators.required],
      customer_name: [null, Validators.compose([Validators.required, Validators.pattern('[a-zA-Z ]{2,30}$')])],
      pincode: [null, Validators.compose([Validators.required, Validators.pattern('^[0-9]{6}')])],
      flatNumber: [null, Validators.compose([Validators.required])],
      address: [null, Validators.compose([Validators.required])],
      address2: [null, Validators.compose([Validators.required])],
      landmark: [null, Validators.compose([Validators.required])],
      phone: [null, Validators.compose([Validators.required, Validators.pattern('^[0-9]{10}')])],
    });
  }

  ngOnInit() {
  }
  ionViewWillEnter() {
    this.addressId = this.activatedRoute.snapshot.paramMap.get('addressId');
    this.prevPage = this.activatedRoute.snapshot.paramMap.get('prevPage');
    console.log(this.addressId);
    console.log(this.prevPage);
    if (this.addressId !== '') {
      this.authService.getDelievryAddressById(this.addressId).subscribe(addressinfo => {
        this.registerCredentials.customer_name = addressinfo.customer_name;
        this.registerCredentials.address_type = addressinfo.address_type;
        this.registerCredentials.landmark = addressinfo.landmark;
        this.registerCredentials.address = addressinfo.address;
        this.registerCredentials.address2 = addressinfo.address2;
        this.registerCredentials.city = addressinfo.city;
        this.registerCredentials.state = addressinfo.state;
        this.registerCredentials.country = addressinfo.country;
        this.registerCredentials.latitude = addressinfo.latitude;
        this.registerCredentials.longitude = addressinfo.longitude;
        this.registerCredentials.pincode = addressinfo.pincode;
        this.registerCredentials.phone = addressinfo.phone;
        this.registerCredentials.flatNumber = addressinfo.flatNumber;
        this.registerCredentials.status = addressinfo.status;
        this.registerCredentials.customer_id = localStorage.getItem('customerid');
      });
    }
  }

  addDelievryAddress() {
    console.log(this.addAddressForm.valid);
    if (!this.addAddressForm.valid) {
      return;
    }
    if (this.addressId !== '') {
      this.authService.editDelievryAddress(this.addressId, this.registerCredentials).subscribe(data => {
        console.log(data);
        if (data.status === 200) {
          if (this.prevPage === 'cartpage') {
            this.navCtrl.navigateBack('/cart');
          } else {
            this.navCtrl.navigateRoot('/home/tabs/profile');
          }
        } else {
          if (this.prevPage === 'cartpage') {
            this.navCtrl.navigateBack('/cart');
          } else {
            this.navCtrl.navigateRoot('/home/tabs/profile');
          }
        }
      });
    } else {
      this.registerCredentials.customer_id = localStorage.getItem('customerid');
      this.authService.addDelievryAddress(this.registerCredentials).subscribe(data => {
        if (data.status === 200) {
          if (this.prevPage === 'cartpage') {
            this.navCtrl.navigateBack('/cart');
          } else {
            this.navCtrl.navigateRoot('/home/tabs/profile');
          }
        } else {
          if (this.prevPage === 'cartpage') {
            this.navCtrl.navigateBack('/cart');
          } else {
            this.navCtrl.navigateRoot('/home/tabs/profile');
          }
        }
      });
    }
  }

}
