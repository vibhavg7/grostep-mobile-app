import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { OfferListComponent } from './offer-list.component';

describe('OfferListComponent', () => {
  let component: OfferListComponent;
  let fixture: ComponentFixture<OfferListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OfferListComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(OfferListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
