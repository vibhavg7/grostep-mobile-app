import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  storeId: number;
  public loginForm: FormGroup;
  constructor(
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private router: Router) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.storeId = +this.activatedRoute.snapshot.paramMap.get('storeId');
  }

  login(phoneNumber: any) {
    this.authService.registerCustomer(phoneNumber)
      .subscribe((data: any) => {
        console.log(data);
        if (data.customer_id !== 0) {
          this.router.navigate(['/', 'auth', 'validate-otp', data.customer_id, { storeId: this.storeId }]);
        }
      });
  }

}
