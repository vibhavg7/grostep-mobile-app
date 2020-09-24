import { Component, OnInit } from '@angular/core';
import { ModalController, NavController, ToastController } from '@ionic/angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-feedback-form',
  templateUrl: './feedback-form.component.html',
  styleUrls: ['./feedback-form.component.scss'],
})
export class FeedbackFormComponent implements OnInit {

  public customerFeedbackForm: FormGroup;
  registerCredentials = {
    customer_id: '',
    name: '', email: '', phone: '', message: ''
  };
  submitted = false;
  constructor(
    private modalCtrl: ModalController,
    private authService: AuthService,
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    public fb: FormBuilder
  ) {
    this.customerFeedbackForm = fb.group({
      name: [null, Validators.compose([Validators.required, Validators.pattern('[a-zA-Z ]{2,30}$')])],
      email: [null, Validators.compose([Validators.required, Validators.email])],
      phone: [null, Validators.compose([Validators.required, Validators.pattern('^[0-9]{10}')])],
      message: [null, Validators.compose([Validators.required, Validators.maxLength(250)])]
    });
  }

  get f() { return this.customerFeedbackForm.controls; }


  ngOnInit() {}


  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;

  }

  onCancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  addCustomerFeedback() {
    this.submitted = true;
    if (!this.customerFeedbackForm.valid) {
      return;
    }
    this.registerCredentials.customer_id = localStorage.getItem('customerid');
    this.registerCredentials.name = this.customerFeedbackForm.value.name;
    this.registerCredentials.email = this.customerFeedbackForm.value.email;
    this.registerCredentials.phone = this.customerFeedbackForm.value.phone;
    this.registerCredentials.message = this.customerFeedbackForm.value.message;
    console.log(this.registerCredentials);
    this.authService.submitFeedback(this.registerCredentials).subscribe(data => {
      console.log(data);
      if (data.status === 200) {
        this.presentToast('Thank you so much for your feedback. Grostep Team will reach you soon.');
        this.modalCtrl.dismiss({message: 'Feedback submitted sucessfully', feedbackDetail: data}, 'feedbacksubmitted');
        // if (this.authService.redirectUrl === 'cartpage') {
        //   this.navCtrl.navigateBack([`/cart/${this.storeId}`]);
        // } else if (this.authService.redirectUrl === 'profile') {
        //   this.navCtrl.navigateRoot(['/home/tabs/profile']);
        // } else {
        //   this.navCtrl.navigateRoot(['/home/tabs/profile']);
        // }
      }
    });
  }

  async presentToast(msg) {
    const toast = await this.toastCtrl.create({ message: msg, duration: 2000, position: 'middle' });

    toast.present();
  }
}
