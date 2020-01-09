import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PasswordManagementPage } from './password-management.page';

describe('PasswordManagementPage', () => {
  let component: PasswordManagementPage;
  let fixture: ComponentFixture<PasswordManagementPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PasswordManagementPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PasswordManagementPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
