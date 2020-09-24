import { Component, OnInit } from '@angular/core';
import { OrderService } from '../order.service';
import { NavController, Platform, ModalController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { ShowImageModalComponent } from '../show-image-modal/show-image-modal.component';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.page.html',
  styleUrls: ['./order-detail.page.scss'],
})
export class OrderDetailPage implements OnInit {

  orderId: number;
  orderInfo: any;
  isLoading = false;
  constructor(
    private orderService: OrderService,
    private platform: Platform,
    private activatedRoute: ActivatedRoute,
    private modalController: ModalController,
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

  viewBill(billImage) {
    this.modalController.create({
      component: ShowImageModalComponent,
      componentProps: { billimage: billImage, orderId: this.orderId }
    }).then(modalel => {
      modalel.present();
      return modalel.onDidDismiss();
    }).then((resultData: any) => {
      // this.livestatus = +resultData.data.orderstatus;
      // this.setHeight(resultData.data.orderstatus);
    });
  }

  ionViewWillEnter() {
    this.platform.backButton.subscribeWithPriority(0, () => {
      this.navCtrl.pop();
    });
    this.isLoading = true;
    this.orderService.fetchOrderInformationById(this.orderId).subscribe((data: any) => {
      this.orderInfo = data.customer_orders_info[0];
      this.isLoading = false;
      console.log(this.orderInfo);
    });
    //   .filter(info => info.order_id === +this.orderId)[0];
    // console.log(this.orderInfo);
  }

  cancelOrder() {
  }

  backToHome() {
    this.navCtrl.pop();
  }

}
