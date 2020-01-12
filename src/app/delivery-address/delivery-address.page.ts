import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { AlertController, NavController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-delivery-address',
  templateUrl: './delivery-address.page.html',
  styleUrls: ['./delivery-address.page.scss'],
})
export class DeliveryAddressPage implements OnInit {

  errorMessage: any;
  storeId: string;
  prevPage: any = '';
  addressList: any = [];
  constructor(
    private alertCtrl: AlertController,
    private navCtrl: NavController,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private auth: AuthService) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.addressList = this.auth.CustomerdeliveryInfo;
    if (this.addressList.length < 1) {
      this.auth.getUserProfile().subscribe((data) => {
        this.addressList = data.customer_delivery_addresses;
      }, (error) => {
        this.errorMessage = error;
      });
    }
    this.prevPage = this.activatedRoute.snapshot.paramMap.get('prevPage');
    this.storeId = this.activatedRoute.snapshot.paramMap.get('storeId');
  }

  addressSelected(address: any) {
    this.auth.selectDeliveryAddress(address.delivery_address_id)
      .subscribe((data: any) => {
        if (data.status === 200) {
          if (this.prevPage === 'cartpage') {
            this.navCtrl.navigateBack(`/cart/${this.storeId}`);
          } else {
            this.navCtrl.navigateRoot('/home/tabs/profile');
          }
        }
      });
  }

  deleteDeliveryAddress(address) {
    if (address.status === 1) {
      console.log('Selected address cannot be deleted');
      // this.presentToast('Selected address cannot be deleted');
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
                  .subscribe((data) => {
                    // console.log(data);
                  });

              }
            }]
        })
        .then(alertEl => alertEl.present());
    }
  }

  addNewAddress() {
    this.router.navigate(['/delivery-address/add-delivery-address', { addressId: ''}]);
  }

  editDeliveryAddress(address) {
    this.router.navigate(['/delivery-address/add-delivery-address', { addressId: address.delivery_address_id }]);
  }

}
