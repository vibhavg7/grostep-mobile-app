import { Component } from '@angular/core';
import { CartService } from '../cart/cart.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  cartCount: number;
  constructor(
    private cartService: CartService
  ) {}

  // ngOnInit() {
  // }

  ionViewWillEnter() {
    this.cartCount =  this.cartService.getCartCount();
    console.log(this.cartCount);
   }

}
