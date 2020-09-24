import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ChangeDeliveryLocationPage } from './change-delivery-location.page';

describe('ChangeDeliveryLocationPage', () => {
  let component: ChangeDeliveryLocationPage;
  let fixture: ComponentFixture<ChangeDeliveryLocationPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangeDeliveryLocationPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ChangeDeliveryLocationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
