import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AddUserInfoPage } from './add-user-info.page';

describe('AddUserInfoPage', () => {
  let component: AddUserInfoPage;
  let fixture: ComponentFixture<AddUserInfoPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddUserInfoPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AddUserInfoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
