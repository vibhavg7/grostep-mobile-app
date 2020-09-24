import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, Platform, ModalController } from '@ionic/angular';
import { LiveOrderDetailComponent } from '../../shared/live-order-detail/live-order-detail.component';

@Component({
  selector: 'app-payment-status',
  templateUrl: './payment-status.page.html',
  styleUrls: ['./payment-status.page.scss'],
})
export class PaymentStatusPage implements OnInit, AfterViewInit {

  orderstatus: number;
  orderId: number;
  constructor(
    private activatedRoute: ActivatedRoute,
    private platform: Platform,
    private modalCtrl: ModalController,
    private router: Router,
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

  ngAfterViewInit() {
    this.platform.backButton.subscribeWithPriority(0, () => {
      this.navCtrl.navigateRoot(['/home/tabs/categories']);
    });
  }

  continueShopping() {
   this.navCtrl.navigateRoot(['/home/tabs/categories']);
  }

  liveTrackOrder() {
    // this.modalCtrl.create({ component: LiveOrderDetailComponent, componentProps: { orderid: this.orderId, prevPage: 'sucesspage' } })
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
    this.navCtrl.navigateForward([`/order/liveordertrackingdetail/${this.orderId}`, {prevPage: 'sucesspage'}]);
  }

}
