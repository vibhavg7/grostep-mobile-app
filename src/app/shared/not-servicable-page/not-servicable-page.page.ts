import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Platform, NavController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-not-servicable-page',
  templateUrl: './not-servicable-page.page.html',
  styleUrls: ['./not-servicable-page.page.scss'],
})
export class NotServicablePagePage implements OnInit, AfterViewInit {

  constructor(private platform: Platform, private router: Router, private navCtrl: NavController) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
  }

  ionViewWillEnter() {
    // alert(this.router.url);
    this.platform.backButton.subscribeWithPriority(0, () => {
      if (this.router.url === '/notservicablepage') {
        // tslint:disable-next-line:no-string-literal
        navigator['app'].exitApp();
      } else {
        this.navCtrl.pop();
      }
    });
  }

  editLocation() {
    // this.navCtrl.navigateForward(['/changedeliverylocation']);
    this.navCtrl.pop();
  }

}
