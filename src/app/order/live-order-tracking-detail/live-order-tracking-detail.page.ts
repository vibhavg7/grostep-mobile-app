import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, ModalController, Platform, AlertController, ToastController } from '@ionic/angular';
import { OrderService } from '../order.service';
import { ShowImageModalComponent } from '../show-image-modal/show-image-modal.component';
import {
  Plugins,
  Capacitor,
  PushNotification,
  PushNotificationToken,
  PushNotificationActionPerformed
} from '@capacitor/core';
const { PushNotifications, Modals, Storage } = Plugins;
// tslint:disable-next-line:class-name
interface marker {
  lat: number;
  lng: number;
  // label?: string;
  // draggable: boolean;
}

@Component({
  selector: 'app-live-order-tracking-detail',
  templateUrl: './live-order-tracking-detail.page.html',
  styleUrls: ['./live-order-tracking-detail.page.scss'],
})
export class LiveOrderTrackingDetailPage implements OnInit {

  delivery_person_phone: any;
  delivery_person_name: any;
  isLoading = false;
  prevPage = '';
  billimage: any;
  zoom = 12;
  // initial center position for the map
  lat: number;
  lng: number;
  livestatus: number;
  orderId: number;
  rule: any = {};
  height: any;
  markers: marker[] = [
    // {
    //   lat: 51.673858,
    //   lng: 7.815982
    // },
    // {
    //   lat: 51.373858,
    //   lng: 7.215982
    //   // label: 'B',
    //   // draggable: false
    // }
  ];
  constructor(private activatedRoute: ActivatedRoute,
              private platform: Platform,
              private alertCtrl: AlertController,
              private toastCtrl: ToastController,
              private modalController: ModalController,
              private navCtrl: NavController, private orderService: OrderService) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe((data: any) => {
      if (!data.has('orderId')) {
        this.navCtrl.navigateBack('/home/tabs/profile');
        return;
      }
      this.prevPage = data.get('prevPage');
      this.orderId = +data.get('orderId');
    });
  }

  backToHome() {
    if (this.prevPage === 'sucesspage') {
      this.navCtrl.navigateRoot(['/home/tabs/categories']);
    }
  }

  ionViewWillEnter() {
    this.platform.backButton.subscribeWithPriority(0, () => {
      if (this.prevPage === 'sucesspage') {
        this.navCtrl.navigateRoot(['/home/tabs/categories']);
      } else {
        this.navCtrl.pop();
      }
    });
    this.isLoading = true;
    this.orderService.fetchAllCustomerLiveOrderDetail(this.orderId).subscribe((data: any) => {
      console.log(data);
      const storeObj: any = {};
      const customerObj: any = {};
      this.isLoading = false;
      this.livestatus = +data.livecustomerorderdetail.order_current_status;
      this.billimage = data.livecustomerorderdetail.bill_image_url;
      this.delivery_person_name = data.livecustomerorderdetail.delivery_person_name;
      this.delivery_person_phone = data.livecustomerorderdetail.phone;
      this.setHeight(+data.livecustomerorderdetail.order_current_status);
      storeObj.lat = +data.livecustomerorderdetail.store_lat;
      storeObj.lng = +data.livecustomerorderdetail.store_long;
      customerObj.lat = +data.livecustomerorderdetail.customer_lat;
      customerObj.lng = +data.livecustomerorderdetail.customer_long;
      this.markers.push(storeObj);
      this.markers.push(customerObj);
      this.lat = +data.livecustomerorderdetail.customer_lat;
      this.lng = +data.livecustomerorderdetail.customer_long;
      console.log(this.livestatus);
    });
  }

  continueShopping() {
    this.navCtrl.navigateRoot(['/home/tabs/categories']);
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

  showImageModal(billImage) {
    this.modalController.create({
      component: ShowImageModalComponent,
      componentProps: { billimage: billImage, orderStatus: this.livestatus, orderId: this.orderId }
    }).then(modalel => {
      modalel.present();
      return modalel.onDidDismiss();
    }).then((resultData: any) => {
      console.log(resultData);
      if (resultData.role === 'confirm') {
        this.livestatus = +resultData.data.orderstatus;
        this.setHeight(resultData.data.orderstatus);
      }
    });
  }

  onBack() {
    this.navCtrl.pop();
  }

  viewDetail() {
    this.navCtrl.navigateForward([`/order/order-detail/${this.orderId}`]);
  }

  contactSupport() {
    this.navCtrl.navigateForward([`/contactus`, { prevPage: 'liverordertracking' }]);
  }

  cancelOrder() {
    this.alertCtrl
      .create({
        header: 'Cancel Order?',
        message: 'Are you sure you want to cancel the order?',
        buttons: [
          {
            text: 'No',
            cssClass: 'cancelcss',
            handler: () => {
              console.log('Cancel clicked');
            }
          },
          {
            text: 'YES',
            cssClass: 'removecss',
            handler: () => {
              this.isLoading = true;
              this.orderService.cancelOrder(this.orderId, this.livestatus).subscribe((data: any) => {
                this.isLoading = false;
                if (data.status === 401) {
                  this.presentToast('Order is in delivery process. It can\'t be cancelled.' +
                                      'Please contact support in case of any furthur clarification');
                } else
                if (data.status === 200) {
                  this.presentToast('Order successfully cancelled');
                } else {
                  this.presentToast('Order not cancelled. Please contact support in case of any furthur clarification');
                }
                this.navCtrl.navigateBack(['/order/liveorders']);
              });
            }
          }]
      })
      .then(alertEl => alertEl.present());
  }

  callSupport() {
  }

  async presentToast(msg) {
    const toast = await this.toastCtrl.create({ message: msg, duration: 800, position: 'bottom' });

    toast.present();
  }

}

