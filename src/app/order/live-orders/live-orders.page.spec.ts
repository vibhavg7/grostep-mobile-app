import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { LiveOrdersPage } from './live-orders.page';

describe('LiveOrdersPage', () => {
  let component: LiveOrdersPage;
  let fixture: ComponentFixture<LiveOrdersPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LiveOrdersPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(LiveOrdersPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
