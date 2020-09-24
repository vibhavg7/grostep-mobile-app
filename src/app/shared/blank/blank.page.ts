import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Plugins, NetworkStatus } from '@capacitor/core';
import { NavController, ToastController, Platform } from '@ionic/angular';
import { Router } from '@angular/router';
const { Network } = Plugins;

@Component({
  selector: 'app-blank',
  templateUrl: './blank.page.html',
  styleUrls: ['./blank.page.scss'],
})
export class BlankPage implements OnInit, AfterViewInit {

  listener: any;
  status: NetworkStatus;
  constructor(private navCtrl: NavController, private router: Router, private platform: Platform , private toastCtrl: ToastController) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.platform.backButton.subscribeWithPriority(0, () => {
      if (this.router.url === '/blank') {
        // tslint:disable-next-line:no-string-literal
        navigator['app'].exitApp();
      } else {
        this.navCtrl.pop();
      }
    });
  }

  async getStatus() {
    try {
      this.status = await Network.getStatus();
      if (this.status.connected) {
        this.presentToast('Network connected!');
        this.navCtrl.navigateRoot(['/home/tabs/categories']);
      } else {
        this.presentToast('Your internet connection still appears to be offline.');
        this.navCtrl.navigateRoot(['/blank']);
      }
    } catch (e) { console.log('Error', e); }
  }

  reloadapp() {
    this.getStatus();
  }


  async presentToast(msg) {
    const toast = await this.toastCtrl.create({ message: msg, duration: 1000, position: 'bottom' });

    toast.present();
  }

}
