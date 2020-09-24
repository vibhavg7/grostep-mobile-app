import { Component, OnInit } from '@angular/core';
import { Platform, NavController, ModalController } from '@ionic/angular';
import { AuthService } from '../auth/auth.service';
import { FeedbackFormComponent } from '../shared/feedback-form/feedback-form.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-contactus',
  templateUrl: './contactus.page.html',
  styleUrls: ['./contactus.page.scss'],
})
export class ContactusPage implements OnInit {

  prevPage: string;
  contactdetails: any;
  isLoading: boolean;
  constructor(private platform: Platform,
              private modalCtrl: ModalController,
              private authService: AuthService,
              private activatedRoute: ActivatedRoute,
              private navCtrl: NavController) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.prevPage = this.activatedRoute.snapshot.paramMap.get('prevPage');
    console.log(this.prevPage);
    this.platform.backButton.subscribeWithPriority(0, () => {
      if (this.prevPage === 'liverordertracking') {
        this.navCtrl.pop();
      } else {
        this.navCtrl.navigateRoot(['/home/tabs/profile']);
      }
    });
    this.isLoading = true;
    this.authService.getInfo('contactus').subscribe(contactusinfo => {
      console.log(contactusinfo);
      this.isLoading = false;
      this.contactdetails = contactusinfo[0];
      // console.log(this.contactdetails);
      // this.hideLoading();
    });
  }

  backToHome() {
    if (this.prevPage === 'liverordertracking') {
      this.navCtrl.pop();
    } else {
      this.navCtrl.navigateRoot(['/home/tabs/profile']);
    }
  }

  sendFeedback() {
    this.modalCtrl.create({ component: FeedbackFormComponent, componentProps: { prevPage: 'contactus' } })
      .then((modalEl) => {
        modalEl.present();
        return modalEl.onDidDismiss();
      }).then((resultData: any) => {
        console.log(resultData);
        if (resultData.role === 'feedbacksubmitted') {
          this.navCtrl.navigateRoot(['/home/tabs/profile']);
          //   this.voucher = resultData.data.voucherDetail;
          //   console.log(this.voucher);
        }
      });
  }

  callNumber(number1: any) {
  }

}
