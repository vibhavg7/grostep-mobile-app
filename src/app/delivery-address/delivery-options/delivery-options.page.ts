import { Component, OnInit, ApplicationRef, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { StoreService } from '../../store/store.service';
import { NavController, Platform, AlertController } from '@ionic/angular';
import { CartService } from '../../cart/cart.service';
import { DeliveryAddressService } from '../delivery-address.service';
import {
  Plugins
} from '@capacitor/core';

const { Storage } = Plugins;
@Component({
  selector: 'app-delivery-options',
  templateUrl: './delivery-options.page.html',
  styleUrls: ['./delivery-options.page.scss'],
})
export class DeliveryOptionsPage implements OnInit {

  deliveryLaterRatesAvailable: boolean;
  deliveryNowRatesAvailable: boolean;
  distanceFromCustomer: any;
  loadedStoreInfo: any;
  state: any;
  city: any;
  deliveryIntructions = '';
  enableDeliveryLaterDiv = false;
  storeId: number;
  categoryId: number;
  deliverySlots: any = [];
  selectedSlot: any;
  isLoading = false;
  deliveryNowRates: any;
  skeletonStoreCount: any;
  deliveryLaterRates: any;
  slotsCount: number;
  delivernow = true;
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private alertCtrl: AlertController,
    private deliveryService: DeliveryAddressService,
    private cartService: CartService,
    private authService: AuthService,
    private navCtrl: NavController,
    private zone: NgZone,
    private ref: ApplicationRef,
    private auth: AuthService,
    private storeService: StoreService,
    private platform: Platform
  ) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe((data: any) => {
      if (!data.has('storeId')) {
        this.navCtrl.navigateBack('/home/tabs/categories');
        return;
      }
      this.storeId = +this.activatedRoute.snapshot.paramMap.get('storeId');
      this.categoryId = +this.activatedRoute.snapshot.paramMap.get('categoryId');
      this.skeletonStoreCount = new Array(10);
      // this.storeId = +data.get('storeId');
    });
  }

  async getObject() {
    this.isLoading = true;
    this.storeService.delivernow = true;
    // const ret = await Storage.get({ key: 'usertempaddress1' });
    // this.city = JSON.parse(ret.value).city;
    // this.state = JSON.parse(ret.value).state;
    // const lat = JSON.parse(ret.value).lat;
    // const long = JSON.parse(ret.value).long;
    setTimeout(() => {
      this.storeService.fetchStoreInfoById(this.storeId)
        .subscribe((data1: any) => {
          this.storeService.StoreInfo = data1.store[0];
          this.loadedStoreInfo = this.storeService.StoreInfo;
          this.getStoreDistanceAndTime(this.loadedStoreInfo);
        });
    }, 500);
  }

  async getStoreDistanceAndTime(storeInfo) {
    console.log(storeInfo);
    const ret = await Storage.get({ key: 'usertempaddress1' });
    this.city = JSON.parse(ret.value).city;
    this.state = JSON.parse(ret.value).state;
    const lat = JSON.parse(ret.value).lat;
    const long = JSON.parse(ret.value).long;
    this.authService.Lat = lat;
    this.authService.Long = long;
    const customerLatLong = [];
    const storeLatLong = [];
    this.deliveryService.getDeliveryRatesAndFees(this.city, this.state, this.storeId)
      .subscribe((deliveryOptionsData: any) => {
        customerLatLong.push(new google.maps.LatLng(this.authService.Lat, this.authService.Long));
        storeLatLong.push(new google.maps.LatLng(storeInfo.latitude, storeInfo.longitude));
        new google.maps.DistanceMatrixService().getDistanceMatrix({
          origins: storeLatLong, destinations: customerLatLong,
          travelMode: google.maps.TravelMode.DRIVING,
          unitSystem: google.maps.UnitSystem.METRIC,
        }, (results: any) => {
          this.zone.run(() => {
            console.log(results);
            const distanceData = results.rows;
            this.loadedStoreInfo.distanceFromCustomer = distanceData[0].elements[0].distance.text;
            this.loadedStoreInfo.timeFromCustomer = distanceData[0].elements[0].duration.text;
            this.distanceFromCustomer = this.loadedStoreInfo.distanceFromCustomer.split(' ')[0];
            // console.log(deliveryOptionsData);
            // console.log(this.loadedStoreInfo);
            deliveryOptionsData[1].deliveryRatesAndFees.forEach(element => {
              if (+element.delivery_type === 0) {
                this.deliveryNowRates = element;
                this.deliveryNowRatesAvailable = true;
                if (this.distanceFromCustomer > element.fix_distance) {
                  this.deliveryNowRates.deliveryfees = Math.floor(((element.fix_fee) +
                    (this.distanceFromCustomer - element.fix_distance) *
                    element.additional_fee_per_km));
                } else {
                  this.deliveryNowRates.deliveryfees = Math.floor(element.fix_fee);
                }
                this.cartService.setDeliveryCharge(this.deliveryNowRates.deliveryfees);
              }
              if (+element.delivery_type === 1) {
                this.deliveryLaterRates = element;
                this.deliveryLaterRatesAvailable = true;
                if (this.distanceFromCustomer > element.fix_distance) {
                  this.deliveryLaterRates.deliveryfees = Math.floor(((element.fix_fee) +
                    (this.distanceFromCustomer - element.fix_distance) *
                    element.additional_fee_per_km));
                } else {
                  this.deliveryLaterRates.deliveryfees = Math.floor(element.fix_fee);
                }
              }
            });
            this.slotsCount = deliveryOptionsData[0].slots.length;
            if (this.slotsCount > 0) {
              deliveryOptionsData[0].slots.forEach(slot => {
                slot.openingTimeClock = (slot.start_time / 12 > 1) ? 'PM' : 'AM';
                slot.closingTimeClock = (slot.end_time / 12 > 1) ? 'PM' : 'AM';
              });
              this.deliverySlots = deliveryOptionsData[0].slots;
              console.log(this.deliverySlots);
              this.storeService.storeDeliveryslots = this.deliverySlots;
            }
            this.isLoading = false;
            // this.ref.tick();
          });
        });
      });
  }

  ionViewWillEnter() {
    this.platform.backButton.subscribeWithPriority(0, () => {
      this.navCtrl.pop();
    });
    this.getObject();
    this.deliveryService.getDeliveryInstructions().subscribe((data) => {
      console.log(data.value);
      this.deliveryIntructions = data.value;
      if (this.deliveryIntructions ===  null) {
        this.deliveryIntructions = '';
      }
      console.log(this.deliveryIntructions);
    });
  }
  adddeliveryInstructions() {
    this.navCtrl.navigateForward(['/delivery-address/delivery-instructions', { storeId: this.storeId }]);
  }

  onBackButton() {
    this.navCtrl.pop();
  }

  removeInstructions() {
    this.deliveryIntructions = '';
    this.deliveryService.removeInstructions();
  }

  deliveryLater(charge) {
    console.log(charge);
    this.storeService.delivernow = false;
    this.enableDeliveryLaterDiv = true;
    this.cartService.setDeliveryCharge(charge);
    this.delivernow = false;
    this.ref.tick();
  }

  deliverNow(charge) {
    console.log(charge);
    this.selectedSlot = undefined;
    this.storeService.delivernow = true;
    this.enableDeliveryLaterDiv = false;
    this.cartService.setDeliveryCharge(charge);
    this.delivernow = true;
    this.ref.tick();
  }

  proceedToPay() {
    this.storeService.storeClosingStatus(this.storeId).subscribe((data) => {
      console.log(data);
      if (data.storeInfo[0].closed === 1) {
        this.alertCtrl
          .create({
            header: 'Store Information',
            message: 'Store is closed. Please try from another store',
            buttons: [
              {
                text: 'Okay',
                handler: () => {
                  this.router.navigate(['/', 'categories', this.categoryId, 'stores']);
                  // this.router.navigate(['']);
                }
              }
            ]
          })
          .then(alertEl => alertEl.present());
      } else {
        if (((!this.delivernow && this.selectedSlot !== undefined) || this.delivernow)) {
          console.log(this.storeService.storeDeliveryslots);
          console.log(this.delivernow);
          console.log(this.selectedSlot);
          this.storeService.selectedDeliverySlotId = this.selectedSlot;
          this.router.navigate(['/payment/payment-options', { storeId: this.storeId, categoryId: this.categoryId }]);
        }
      }
    });
  }
}
