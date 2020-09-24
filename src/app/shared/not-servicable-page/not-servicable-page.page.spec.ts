import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { NotServicablePagePage } from './not-servicable-page.page';

describe('NotServicablePagePage', () => {
  let component: NotServicablePagePage;
  let fixture: ComponentFixture<NotServicablePagePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotServicablePagePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(NotServicablePagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
