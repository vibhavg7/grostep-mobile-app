import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { VerifypasswordPage } from './verifypassword.page';

describe('VerifypasswordPage', () => {
  let component: VerifypasswordPage;
  let fixture: ComponentFixture<VerifypasswordPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerifypasswordPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(VerifypasswordPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
