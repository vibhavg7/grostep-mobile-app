import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PasswordManagementPageRoutingModule } from './password-management-routing.module';

import { PasswordManagementPage } from './password-management.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PasswordManagementPageRoutingModule
  ],
  declarations: [PasswordManagementPage]
})
export class PasswordManagementPageModule {}
