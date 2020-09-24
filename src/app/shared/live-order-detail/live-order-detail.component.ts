import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import { Platform, ModalController, NavController } from '@ionic/angular';
import { OrderService } from '../../order/order.service';
import { ShowImageModalComponent } from '../../order/show-image-modal/show-image-modal.component';
import { Router } from '@angular/router';

// tslint:disable-next-line:class-name
interface marker {
  lat: number;
  lng: number;
}

@Component({
  selector: 'app-live-order-detail',
  templateUrl: './live-order-detail.component.html',
  styleUrls: ['./live-order-detail.component.scss'],
})
export class LiveOrderDetailComponent implements OnInit, AfterViewInit {

  height: number;
  isLoading: boolean;
  livestatus: number;
  deliverypersonphone: any;
  deliverypersonname: any;
  billimage: any;
  zoom = 13;
  markers: marker[] = [];
  @Input() orderid: any;
  @Input() prevPage: any;
  lat: number;
  lng: number;
  constructor(
    private platform: Platform,
    private navCtrl: NavController,
    private router: Router,
    private modalCtrl: ModalController,
    private modalController: ModalController,
    private orderService: OrderService
  ) { }

  ngOnInit() {
    this.isLoading = true;
    this.orderService.fetchAllCustomerLiveOrderDetail(this.orderid).subscribe((data: any) => {
      // console.log(data);
      const storeObj: any = {};
      const customerObj: any = {};
      this.isLoading = false;
      this.livestatus = +data.livecustomerorderdetail.order_current_status;
      this.billimage = data.livecustomerorderdetail.bill_image_url;
      this.deliverypersonname = data.livecustomerorderdetail.delivery_person_name;
      this.deliverypersonphone = data.livecustomerorderdetail.phone;
      this.setHeight(+data.livecustomerorderdetail.order_current_status);
      storeObj.lat = +data.livecustomerorderdetail.store_lat;
      storeObj.lng = +data.livecustomerorderdetail.store_long;
      customerObj.lat = +data.livecustomerorderdetail.customer_lat;
      customerObj.lng = +data.livecustomerorderdetail.customer_long;
      this.markers.push(storeObj);
      this.markers.push(customerObj);
      this.lat = +data.livecustomerorderdetail.customer_lat;
      this.lng = +data.livecustomerorderdetail.customer_long;
    });
  }

  ngAfterViewInit() {
    this.platform.backButton.subscribeWithPriority(0, () => {
      this.modalCtrl.dismiss(null, 'cancel');
    });
  }

  setHeight(livestatus) {
    this.height = 40;
    if (livestatus >= 2) {
      this.height = 80;
    }
    if (livestatus >= 3) {
      this.height = 130;
    }
    if (livestatus >= 4) {
      this.height = 140;
    }
    if (livestatus >= 5) {
      this.height = 150;
    }
    if (livestatus >= 6) {
      this.height = 155;
    }
    if (livestatus >= 7 && livestatus <= 9) {
      this.height = 200;
    }
    if (livestatus >= 10) {
      this.height = 220;
    }
    if (livestatus >= 11) {
      this.height = 300;
    }
  }

  onCancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  showImageModal(billImage) {
    this.modalController.create({
      component: ShowImageModalComponent,
      componentProps: { billimage: billImage, orderId: this.orderid }
    }).then(modalel => {
      modalel.present();
      return modalel.onDidDismiss();
    }).then((resultData: any) => {
      this.livestatus = +resultData.data.orderstatus;
      this.setHeight(resultData.data.orderstatus);
    });
  }

  viewDetail() {
    this.modalCtrl.dismiss(null, 'cancel');
    this.router.navigate([`/order/order-detail/${this.orderid}`]);
  }

  continueShopping() {
    this.navCtrl.navigateRoot(['/home/tabs/categories']);
   }

}
