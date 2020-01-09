import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VerifypasswordPageRoutingModule } from './verifypassword-routing.module';

import { VerifypasswordPage } from './verifypassword.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VerifypasswordPageRoutingModule
  ],
  declarations: [VerifypasswordPage]
})
export class VerifypasswordPageModule {}
