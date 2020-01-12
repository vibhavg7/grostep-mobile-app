import { Component, OnInit } from '@angular/core';
import { OrderService } from './order.service';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-order',
  templateUrl: './order.page.html',
  styleUrls: ['./order.page.scss'],
})
export class OrderPage implements OnInit {

  customerordercount: number;
  ordersList: any;
  isLoading: boolean;
  constructor(
    private orderService: OrderService,
    private navCtrl: NavController,
    private router: Router ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.orderService.fetchAllCustomerOrders().subscribe((data: any) => {
      this.isLoading = false;
      this.customerordercount = data.customer_order_count[0].customer_orders_count;
      this.ordersList = data.customer_orders_info;
      console.log(this.ordersList);
    });
  }

  orderdetails(id) {
    console.log(id);
    this.router.navigate([`/order/order-detail/${id}`]);
  }

  startShopping() {
    this.navCtrl.navigateRoot('home/tabs/categories');
  }

}
