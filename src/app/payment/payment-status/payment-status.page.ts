import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-payment-status',
  templateUrl: './payment-status.page.html',
  styleUrls: ['./payment-status.page.scss'],
})
export class PaymentStatusPage implements OnInit {

  orderstatus: number;
  orderId: number;
  constructor(
    private activatedRoute: ActivatedRoute,
    private navCtrl: NavController) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe((data: any) => {
      // if (!data.has('order_id')) {
      //   this.navCtrl.navigateBack('/auth/login');
      //   return;
      // }
      this.orderId = +data.get('order_id');
      this.orderstatus = +data.get('order_status');
    });
  }

  continueShopping() {
   this.navCtrl.navigateRoot(['/home/tabs/categories']);
  }

}
