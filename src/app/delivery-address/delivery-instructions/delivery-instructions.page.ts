import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DeliveryAddressService } from '../delivery-address.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';
import { CartService } from '../../cart/cart.service';

@Component({
  selector: 'app-delivery-instructions',
  templateUrl: './delivery-instructions.page.html',
  styleUrls: ['./delivery-instructions.page.scss'],
})
export class DeliveryInstructionsPage implements OnInit {

  storeId: any;
  categoryId: any;
  submitted = false;
  @ViewChild('comment', { static: false }) comment: any;
  // @ViewChild('input', {}) myInput: ElementRef;

  constructor(
    private deliveryService: DeliveryAddressService,
    private cartService: CartService,
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
      this.cartService.getAllCartItems().subscribe((cartData: any) => {
        const parsedCartData = JSON.parse(cartData.value);
        if (parsedCartData && Object.keys(parsedCartData).length > 0 && parsedCartData.constructor === Object) {
          parsedCartData.deliveryInstructions = value;
          this.cartService.setCartObject(parsedCartData);
          this.navCtrl.pop();
          this.presentToast('Delivery instructions successfully added');
          this.submitted = false;
        } else {
          this.navCtrl.navigateRoot(['/home/tabs/categories']);
        }
      });
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
