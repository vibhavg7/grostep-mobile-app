import { Component, OnInit, ViewChild } from '@angular/core';
import { OrderService } from '../order.service';
import { Router } from '@angular/router';
import { NavController, Platform, ModalController, AlertController, IonInfiniteScroll } from '@ionic/angular';
import { LiveOrderDetailComponent } from '../../shared/live-order-detail/live-order-detail.component';

@Component({
  selector: 'app-live-orders',
  templateUrl: './live-orders.page.html',
  styleUrls: ['./live-orders.page.scss'],
})
export class LiveOrdersPage implements OnInit {

  errorMessage: any;
  liveordersList: any = [];
  customerliveorderscount: any;
  skeletonStoreCount: any[];
  isLoading: boolean;
  currentPage = 1;
  pageSize = 10;
  totalPages: number;
  @ViewChild(IonInfiniteScroll, {static: false}) infiniteScroll: IonInfiniteScroll;
  constructor(
    private orderService: OrderService,
    private platform: Platform,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    private router: Router) { }

  ngOnInit() {
    this.skeletonStoreCount = new Array(10);
  }

  ionViewWillEnter() {
    this.platform.backButton.subscribeWithPriority(0, () => {
      this.navCtrl.pop();
    });
    this.isLoading = true;
    this.liveordersList = [];
    this.currentPage = 1;
    this.customerliveorderscount = 0;
    setTimeout(() => {
      this.fetchLiveOrders();
    }, 500);
  }

  fetchLiveOrders(event?) {
    this.orderService.fetchAllCustomerLiveOrders(this.currentPage, this.pageSize).subscribe((data: any) => {
      this.isLoading = false;
      this.liveordersList = this.liveordersList.concat(data.liveOrdersInfo);
      this.customerliveorderscount = data.customer_liveorders_count[0].customer_liveorders_count;
      this.totalPages = Math.ceil(this.customerliveorderscount / this.pageSize);
      if (event) {
        event.target.complete();
      }
      // console.log(data);
      // this.customerliveorderscount = data.livecustomerorders.length;
      // this.liveordersList = data.livecustomerorders;
      // console.log(this.liveordersList);
      // console.log(this.customerliveorderscount);
    },  (error) => {
      this.errorMessage = error;
      this.isLoading = false;
    });
  }

  liveorderdetails(orderid) {
    // this.modalCtrl.create({ component: LiveOrderDetailComponent, componentProps: { orderid, prevPage: 'liveorderspage' } })
    // .then((modalEl) => {
    //   modalEl.present();
    //   return modalEl.onDidDismiss();
    // }).then((resultData: any) => {
    //   console.log(resultData);
    //   // if (resultData.role === 'voucherapplied') {
    //   //   this.voucher = resultData.data.voucherDetail;
    //   //   console.log(this.voucher);
    //   // }
    // });
    this.router.navigate([`/order/liveordertrackingdetail/${orderid}`, {prevPage: 'liveorderspage'}]);
  }

  // cancelOrder(orderid) {
  //   this.alertCtrl
  //   .create({
  //     header: 'Cancel Order',
  //     message: 'Are you sure you want to cancel the order',
  //     buttons: [
  //       {
  //         text: 'No',
  //         cssClass: 'cancelcss',
  //         handler: () => {
  //           console.log('Cancel clicked');
  //         }
  //       },
  //       {
  //         text: 'YES',
  //         cssClass: 'removecss',
  //         handler: () => {
  //           console.log('yes clicked');
  //           // this.auth.deleteDeliveryAddress(address.delivery_address_id)
  //           //   .subscribe((data: any) => {
  //           //     console.log(data);
  //           //     if (data.status === 200) {
  //           //       this.navCtrl.navigateRoot('/home/tabs/profile');
  //           //       this.presentToast('Address deleted successfully');
  //           //     }
  //           //   });

  //         }
  //       }]
  //   })
  //   .then(alertEl => alertEl.present());
  // }

  backToHome() {
    this.navCtrl.pop();
  }

  loadMore(event) {
    console.log(event);
    if (this.currentPage === this.totalPages) {
      event.target.disabled = true;
    } else {
      this.currentPage++;
      this.fetchLiveOrders(event);
    }
  }

  ionViewWillLeave() {
    console.log('ionViewWillLeave');
    this.infiniteScroll.disabled = false;
    this.infiniteScroll.position = 'bottom';
  }

}
