import { Component, OnInit } from '@angular/core';
import { OrderService } from '../order.service';
import { NavController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.page.html',
  styleUrls: ['./order-detail.page.scss'],
})
export class OrderDetailPage implements OnInit {

  orderId: number;
  orderInfo: any;
  constructor(
    private orderService: OrderService,
    private activatedRoute: ActivatedRoute,
    private navCtrl: NavController,
    private router: Router) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe((data: any) => {
      if (!data.has('orderId')) {
        this.navCtrl.navigateBack('/home/tabs/profile');
        return;
      }
      this.orderId = +data.get('orderId');
    });
  }

  ionViewWillEnter() {
    this.orderInfo = this.orderService.ordersInfo
      .filter(info => info.order_id === +this.orderId)[0];
    console.log(this.orderInfo);
  }

  cancelOrder() {
  }

}
