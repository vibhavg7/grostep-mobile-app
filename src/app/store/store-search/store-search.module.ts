import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StoreSearchPageRoutingModule } from './store-search-routing.module';

import { StoreSearchPage } from './store-search.page';
import { AutofocusDirective } from '../../shared/autofocus.directive';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    IonicModule,
    StoreSearchPageRoutingModule
  ],
  declarations: [StoreSearchPage, AutofocusDirective]
})
export class StoreSearchPageModule {}
