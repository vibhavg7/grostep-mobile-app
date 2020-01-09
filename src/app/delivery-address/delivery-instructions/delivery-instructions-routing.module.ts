import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DeliveryInstructionsPage } from './delivery-instructions.page';

const routes: Routes = [
  {
    path: '',
    component: DeliveryInstructionsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DeliveryInstructionsPageRoutingModule {}
