import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddUserInfoPageRoutingModule } from './add-user-info-routing.module';

import { AddUserInfoPage } from './add-user-info.page';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    IonicModule,
    AddUserInfoPageRoutingModule
  ],
  declarations: [AddUserInfoPage]
})
export class AddUserInfoPageModule {}
