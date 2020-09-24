import { Component, OnInit } from '@angular/core';
import { NavController, Platform } from '@ionic/angular';

@Component({
  selector: 'app-termsandconditions',
  templateUrl: './termsandconditions.page.html',
  styleUrls: ['./termsandconditions.page.scss'],
})
export class TermsandconditionsPage implements OnInit {

  constructor(
    private navCtrl: NavController,
    private platform: Platform
) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.platform.backButton.subscribeWithPriority(0, () => {
      this.navCtrl.navigateRoot(['/home/tabs/profile']);
    });
  }

  backToHome() {
    this.navCtrl.navigateRoot(['/home/tabs/profile']);
  }


}
