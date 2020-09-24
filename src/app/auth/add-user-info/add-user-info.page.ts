import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { NavController, Platform, ToastController } from '@ionic/angular';
@Component({
  selector: 'app-add-user-info',
  templateUrl: './add-user-info.page.html',
  styleUrls: ['./add-user-info.page.scss'],
})
export class AddUserInfoPage implements OnInit {
  buttonSubmitted = false;
  isLoading = false;
  submitted = false;
  customerId: any;
  storeId: number;
  public addUserInfoForm: FormGroup;
  buttonText: any = 'ADD Information';
  registerCredentials = {
    customer_name: '', email: '', customer_dob: '', customer_id: '', personal_info_added: 0
  };
  constructor(
    private activatedRoute: ActivatedRoute,
    private platform: Platform,
    private authService: AuthService,
    private toastCtrl: ToastController,
    private navCtrl: NavController,
    private router: Router,
    public fb: FormBuilder
  ) {
    this.addUserInfoForm = fb.group({
      customer_name: [null, Validators.compose([Validators.required, Validators.pattern('[a-zA-Z ]{2,30}$')])],
      email: [null, Validators.compose([Validators.required, Validators.email])],
      customer_dob: [null, Validators.compose([])]
    });
  }

  get f() { return this.addUserInfoForm.controls; }

  ngOnInit() {
  }

  onBack() {
    if (this.authService.redirectUrl === 'cartpage') {
      this.navCtrl.navigateBack([`/cart/${this.storeId}`]);
    } else if (this.authService.redirectUrl === 'profile') {
      this.navCtrl.navigateRoot(['/home/tabs/profile']);
    } else {
      this.navCtrl.navigateRoot(['/home/tabs/profile']);
    }
  }

  ionViewWillEnter() {
    this.platform.backButton.subscribeWithPriority(0, () => {
      if (this.authService.redirectUrl === 'cartpage') {
        this.navCtrl.navigateBack([`/cart/${this.storeId}`]);
      } else if (this.authService.redirectUrl === 'profile') {
        this.navCtrl.navigateRoot(['/home/tabs/profile']);
      } else {
        this.navCtrl.navigateRoot(['/home/tabs/profile']);
      }
    });
    this.storeId = +this.activatedRoute.snapshot.paramMap.get('storeId');
    this.customerId = +this.activatedRoute.snapshot.paramMap.get('customerId');
    console.log(this.storeId);
    console.log(this.customerId);
    if (this.customerId !== '') {
      this.authService.getUserProfile().subscribe((data) => {
        // console.log(data.customer_info[0]);
        const customerProfile = data.customer_info[0];
        this.registerCredentials.customer_name = customerProfile.customer_name;
        this.registerCredentials.email = customerProfile.email;
        this.registerCredentials.customer_dob = customerProfile.customer_dob;
        this.buttonText = 'SAVE Information';
      });
    }

  }

  addUserInformation() {
    this.isLoading = true;
    this.submitted = true;
    // submitBtn.disabled = true;
    if (!this.addUserInfoForm.valid) {
      // submitBtn.disabled = false;
      this.isLoading = false;
      // this.buttonSubmitted = false;
      return;
    } else {
      this.buttonSubmitted = true;
      this.registerCredentials.customer_id = localStorage.getItem('customerid');
      this.registerCredentials.personal_info_added = 1;
      this.registerCredentials.customer_name = this.addUserInfoForm.value.customer_name;
      this.registerCredentials.email = this.addUserInfoForm.value.email;
      this.registerCredentials.customer_dob = this.addUserInfoForm.value.customer_dob;
      // this.datePipe.transform(this.addUserInfoForm.value.customer_dob, 'dd/MM/yyyy');
      // console.log(this.registerCredentials);
      this.authService.editUserInfo(this.registerCredentials).subscribe(data => {
        // console.log(data);
        if (data.status === 200) {
          if (this.authService.redirectUrl === 'cartpage') {
            this.navCtrl.navigateBack([`/cart/${this.storeId}`]);
          } else if (this.authService.redirectUrl === 'profile') {
            this.navCtrl.navigateRoot(['/home/tabs/profile']);
          } else {
            this.navCtrl.navigateRoot(['/home/tabs/profile']);
          }
          // submitBtn.disabled = false;
          this.submitted = false;
          this.buttonSubmitted = false;
          this.presentToast('Profile Information successfully updated');
        }
        this.isLoading = false;
      });
    }

  }

  async presentToast(msg) {
    const toast = await this.toastCtrl.create({ message: msg, duration: 1000, position: 'middle' });

    toast.present();
  }

}
