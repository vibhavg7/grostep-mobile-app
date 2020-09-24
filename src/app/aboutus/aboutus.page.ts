import { Component, OnInit } from '@angular/core';
import { NavController, Platform } from '@ionic/angular';

@Component({
  selector: 'app-aboutus',
  templateUrl: './aboutus.page.html',
  styleUrls: ['./aboutus.page.scss'],
})
export class AboutusPage implements OnInit {

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
