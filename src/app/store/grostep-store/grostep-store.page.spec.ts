import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { GrostepStorePage } from './grostep-store.page';

describe('GrostepStorePage', () => {
  let component: GrostepStorePage;
  let fixture: ComponentFixture<GrostepStorePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GrostepStorePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(GrostepStorePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
