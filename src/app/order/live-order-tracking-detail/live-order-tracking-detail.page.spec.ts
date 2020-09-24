import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { LiveOrderTrackingDetailPage } from './live-order-tracking-detail.page';

describe('LiveOrderTrackingDetailPage', () => {
  let component: LiveOrderTrackingDetailPage;
  let fixture: ComponentFixture<LiveOrderTrackingDetailPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LiveOrderTrackingDetailPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(LiveOrderTrackingDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
