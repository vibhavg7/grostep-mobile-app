import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FavouriteStorePage } from './favourite-store.page';

describe('FavouriteStorePage', () => {
  let component: FavouriteStorePage;
  let fixture: ComponentFixture<FavouriteStorePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FavouriteStorePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FavouriteStorePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
