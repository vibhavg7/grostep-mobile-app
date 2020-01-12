import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-add-user-info',
  templateUrl: './add-user-info.page.html',
  styleUrls: ['./add-user-info.page.scss'],
})
export class AddUserInfoPage implements OnInit {
  storeId: number;
  public addUserInfoForm: FormGroup;
  registerCredentials = {
    customer_name: '', email: '', customer_dob: '', customer_id: '', personal_info_added: 0
  };
  constructor(
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private navCtrl: NavController,
    private router: Router,
    public fb: FormBuilder,
  ) {
    this.addUserInfoForm = fb.group({
      customer_name: [null, Validators.compose([Validators.required, Validators.pattern('[a-zA-Z ]{2,30}$')])],
      email: [null, Validators.compose([Validators.required])],
      customer_dob: [null, Validators.compose([Validators.required])]
    });
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.storeId = +this.activatedRoute.snapshot.paramMap.get('storeId');
  }

  addUserInformation() {
    if (!this.addUserInfoForm.valid) {
      return;
    }
    this.registerCredentials.customer_id = localStorage.getItem('customerid');
    this.registerCredentials.personal_info_added = 1;
    this.authService.editUserInfo(this.registerCredentials).subscribe(data => {
      console.log(data);
      if (data.status === 200) {
        if (this.authService.redirectUrl === 'cartpage') {
          this.navCtrl.navigateBack([`/cart/${this.storeId}`]);
        } else {
          this.navCtrl.navigateRoot(['/home/tabs/profile']);
        }
      }
    });
  }

}
