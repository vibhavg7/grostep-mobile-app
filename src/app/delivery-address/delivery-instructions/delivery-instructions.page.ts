import { Component, OnInit, ViewChild, ElementRef  } from '@angular/core';
import { DeliveryAddressService } from '../delivery-address.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-delivery-instructions',
  templateUrl: './delivery-instructions.page.html',
  styleUrls: ['./delivery-instructions.page.scss'],
})
export class DeliveryInstructionsPage implements OnInit {

  storeId: any;
  categoryId: any;
  submitted = false;
  @ViewChild('comment', {static: false}) comment: any;
  // @ViewChild('input', {}) myInput: ElementRef;

  constructor(
      private deliveryService: DeliveryAddressService,
      private activatedRoute: ActivatedRoute,
      private navCtrl: NavController,
      private toastCtrl: ToastController,
      private router: Router) { }

  ngOnInit() {
    this.storeId = +this.activatedRoute.snapshot.paramMap.get('storeId');
    this.categoryId = +this.activatedRoute.snapshot.paramMap.get('categoryId');
  }

  addDeliveryInstructions(value) {
    this.submitted = true;
    if (value !== '') {
      this.deliveryService.addDeliveryInstructions(value);
      this.navCtrl.pop();
      this.presentToast('Delivery instructions successfully added');
      this.submitted = false;
    } else {
      setTimeout(() => {
        this.comment.setFocus();
      }, 0);
    }
  }

  async presentToast(msg) {
    const toast = await this.toastCtrl.create({ message: msg, duration: 1000, position: 'middle' });

    toast.present();
  }

}
