import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { StoreService } from '../../store/store.service';
import { NavController } from '@ionic/angular';
import { CartService } from '../../cart/cart.service';

@Component({
  selector: 'app-delivery-options',
  templateUrl: './delivery-options.page.html',
  styleUrls: ['./delivery-options.page.scss'],
})
export class DeliveryOptionsPage implements OnInit {

  enableDeliveryLaterDiv = false;
  storeId: number;
  deliverySlots: any = [];
  selectedSlot: any;
  isLoading = false;
  slotsCount: number;
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private cartService: CartService,
    private navCtrl: NavController,
    private auth: AuthService,
    private storeService: StoreService
  ) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe((data: any) => {
      if (!data.has('storeId')) {
        this.navCtrl.navigateBack('/home/tabs/categories');
        return;
      }
      this.storeId = +data.get('storeId');
    });
  }

  ionViewWillEnter() {
    this.cartService.setDeliveryCharge(30);
    this.isLoading = true;
    this.storeService.fetchStoreDeliverySlots(this.storeId).subscribe((data: any) => {
      if (data.status === 200) {
        this.isLoading = false;
        this.slotsCount = data.slots.length;
        if (this.slotsCount > 0) {
          data.slots.forEach(slot => {
            slot.openingTimeClock = (slot.start_time / 12 > 1) ? 'PM' : 'AM';
            slot.closingTimeClock = (slot.end_time / 12 > 1) ? 'PM' : 'AM';
          });
          this.deliverySlots = data.slots;
        }
      }
    });
  }
  deliveryInstructions() {
    this.router.navigate(['/delivery-address/delivery-instructions', { storeId: this.storeId }]);
  }

  deliveryLater(charge) {
    this.storeService.delivernow = false;
    this.enableDeliveryLaterDiv = true;
    this.cartService.setDeliveryCharge(charge);
  }

  deliverNow(charge) {
    this.storeService.delivernow = true;
    this.enableDeliveryLaterDiv = false;
    this.cartService.setDeliveryCharge(charge);
  }

  proceedToPay() {
    console.log(this.storeService.delivernow);
    this.storeService.selectedDeliverySlotId = this.selectedSlot;
    this.router.navigate(['/payment/payment-options']);
  }

}
