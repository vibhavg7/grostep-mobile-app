import { Component, OnInit } from '@angular/core';

import { Platform, NavController, MenuController, AlertController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Coordinates } from './models/location.model';

import {
  Plugins,
  Capacitor,
  PushNotification,
  PushNotificationToken,
  PushNotificationActionPerformed
} from '@capacitor/core';
import { AuthService } from './auth/auth.service';

const { PushNotifications, Modals, Storage } = Plugins;

export interface PageInterface {
  title: string;
  name: string;
  component: any;
  icon: string;
  logsOut?: boolean;
  index?: number;
  tabName?: string;
  tabComponent?: any;
}

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {
  // usertempaddress: any;
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private alertCtrl: AlertController,
    private authService: AuthService,
    private menuCtrl: MenuController,
    private navCtrl: NavController,
    private statusBar: StatusBar
  ) {
    this.initializeApp();
  }

  async setCustomerToken(token) {
    await Storage.set({
      key: 'customertoken',
      value: token
    });
  }

  async ngOnInit(): Promise<void> {
    console.log('invoking app configration api');
    // alert('Initializing HomePage');

    // Register with Apple / Google to receive push via APNS/FCM
    PushNotifications.register();

    // On success, we should be able to receive notifications
    PushNotifications.addListener('registration',
      (token: PushNotificationToken) => {
        // alert('Push registration success, token: ' + token.value);
        this.setCustomerToken(token.value);
      }
    );

    // Some issue with our setup and push will not work
    PushNotifications.addListener('registrationError',
      (error: any) => {
        // alert('Error on registration: ' + JSON.stringify(error));
      }
    );

    // Show us the notification payload if the app is open on our device
    PushNotifications.addListener('pushNotificationReceived',
      (notification: PushNotification) => {
        // alert('Push received: ' + JSON.stringify(notification));
        alert('Notification received: ' + JSON.stringify(notification.title) + JSON.stringify(notification.body));
      }
    );

    // Method called when tapping on a notification
    PushNotifications.addListener('pushNotificationActionPerformed',
      (notification: PushNotificationActionPerformed) => {
        // alert('Push action performed: ' + JSON.stringify(notification));
      }
    );
    const ret = await Storage.get({ key: 'usertempaddress1' });
    if (ret.value === null || ret.value === undefined || !ret.value) {
      this.navCtrl.navigateRoot(['/changedeliverylocation', { page: 'mainpage' }]);
    }
  }

  clickMenu(value) {
    this.navCtrl.navigateRoot(`/${value}`);
    this.menuCtrl.close();
  }

  initializeApp() {
    // await Storage.remove({ key: 'usertempaddress1' });
    this.platform.ready().then(() => {
      this.statusBar.show();
      // let status bar overlay webview
      this.statusBar.overlaysWebView(false);
      // set status bar to white
      this.statusBar.backgroundColorByHexString('#333');

      // this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }
}
