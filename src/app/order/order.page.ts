import { Component, OnInit, ViewChild } from '@angular/core';
import { OrderService } from './order.service';
import { Router } from '@angular/router';
import { NavController, Platform, IonInfiniteScroll } from '@ionic/angular';

@Component({
  selector: 'app-order',
  templateUrl: './order.page.html',
  styleUrls: ['./order.page.scss'],
})
export class OrderPage implements OnInit {

  errorMessage: any;
  skeletonStoreCount: any[];
  customerordercount: number;
  ordersList: any = [];
  isLoading: boolean;
  currentPage = 1;
  pageSize = 10;
  totalPages: number;
  @ViewChild(IonInfiniteScroll, {static: false}) infiniteScroll: IonInfiniteScroll;
  constructor(
    private orderService: OrderService,
    private navCtrl: NavController,
    private platform: Platform,
    private router: Router ) { }

  ngOnInit() {
    this.skeletonStoreCount = new Array(10);
  }

  ionViewWillEnter() {
    console.log('ionViewWillEnter');
    this.platform.backButton.subscribeWithPriority(0, () => {
      this.navCtrl.pop();
    });
    this.isLoading = true;
    this.ordersList = [];
    this.currentPage = 1;
    this.customerordercount = 0;
    setTimeout(() => {
      this.fetchCustomerOrders();
    }, 500);
  }

  fetchCustomerOrders(event?) {
    this.orderService.fetchAllCustomerOrders(this.currentPage, this.pageSize).subscribe((data: any) => {
      this.isLoading = false;
      this.ordersList = this.ordersList.concat(data.customer_orders_info);
      this.customerordercount = data.customer_order_count[0].customer_orders_count;
      this.totalPages = Math.ceil(this.customerordercount / this.pageSize);
      console.log(this.ordersList);
      if (event) {
        event.target.complete();
      }
    }, (error) => {
      this.errorMessage = error;
      this.isLoading = false;
    });
  }

  orderdetails(id) {
    // console.log(id);
    this.router.navigate([`/order/order-detail/${id}`]);
  }

  startShopping() {
    this.navCtrl.navigateRoot('home/tabs/categories');
  }

  backToHome() {
    this.navCtrl.pop();
  }

  loadMore(event) {
    console.log(event);
    if (this.currentPage === this.totalPages) {
      event.target.disabled = true;
    } else {
      this.currentPage++;
      this.fetchCustomerOrders(event);
    }
  }

  ionViewWillLeave() {
    console.log('ionViewWillLeave');
    this.infiniteScroll.disabled = false;
    this.infiniteScroll.position = 'bottom';
  }
}
