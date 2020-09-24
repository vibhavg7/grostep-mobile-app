import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { OrderService } from '../order.service';

@Component({
  selector: 'app-show-image-modal',
  templateUrl: './show-image-modal.component.html',
  styleUrls: ['./show-image-modal.component.scss'],
})
export class ShowImageModalComponent implements OnInit {

  @Input() billimage: any;
  @Input() orderId: any;
  @Input() orderStatus: any;
  @ViewChild('slider', { read: ElementRef, static: true}) slider: ElementRef;
  sliderOpts = {
    zoom: {
      maxRatio: 3
    }
  };
  constructor(private modalCtrl: ModalController, private orderService: OrderService) { }

  ngOnInit() {
    console.log(this.billimage);
    console.log(this.orderStatus);
    console.log(this.orderId);
    console.log(this.sliderOpts);
  }

  onCancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  acceptorderImage() {
    this.orderService.updateOrderStatus(this.orderId, 7).subscribe((data: any) => {
      if (data.status === 200) {
        this.modalCtrl.dismiss({
          message: 'Bill succesfully accepted',
          orderstatus: 7
        }, 'confirm');
      }
    });
  }

  zoom(zoomin) {
    console.log(zoomin);
    const zoom = this.slider.nativeElement.swiper.zoom;
    console.log(zoom);
    if (zoomin) {
      zoom.in();
    } else {
      zoom.out();
    }
  }

}
