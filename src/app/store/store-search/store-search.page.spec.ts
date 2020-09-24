import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { StoreSearchPage } from './store-search.page';

describe('StoreSearchPage', () => {
  let component: StoreSearchPage;
  let fixture: ComponentFixture<StoreSearchPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StoreSearchPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(StoreSearchPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
