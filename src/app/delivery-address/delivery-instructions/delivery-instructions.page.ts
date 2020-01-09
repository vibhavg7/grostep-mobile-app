import { Component, OnInit, ViewChild, ElementRef  } from '@angular/core';
import { DeliveryAddressService } from '../delivery-address.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-delivery-instructions',
  templateUrl: './delivery-instructions.page.html',
  styleUrls: ['./delivery-instructions.page.scss'],
})
export class DeliveryInstructionsPage implements OnInit {

  storeId: any;
  // @ViewChild('input', {}) myInput: ElementRef;

  constructor(
      private deliveryService: DeliveryAddressService,
      private activatedRoute: ActivatedRoute,
      private navCtrl: NavController,
      private router: Router) { }

  ngOnInit() {
    this.storeId = this.activatedRoute.snapshot.paramMap.get('storeId');
  }

  addDeliveryInstructions(value) {
    this.deliveryService.addDeliveryInstructions(value);
    this.navCtrl.navigateBack(`/delivery-address/delivery-options/${this.storeId}`);
  }

}
