import { Component, OnInit, OnDestroy } from '@angular/core';
import { CategoriesService } from './categories.service';
import { OnEnter } from '../on-enter';
import { Subscription } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],
})
export class CategoriesPage implements OnInit, OnEnter, OnDestroy {

  errorMessage: any = '';
  bannerImages: any = [];
  categoryImages: any = [];
  isLoading = false;
  private subscription: Subscription;
  constructor(
    private router: Router,
    private categoryService: CategoriesService) { }

  public async ngOnInit(): Promise<void> {
    await this.onEnter();

    this.subscription = this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd && event.url === '/home/tabs/categories') {
        this.onEnter();
      }
    });
  }

  public async onEnter(): Promise<void> {
    this.isLoading = true;
    this.categoryService.storeDataCatData('')
    .subscribe((data) => {
      this.isLoading = false;
      this.categoryImages = data[0].store_categories;
      this.bannerImages = data[1].banner;
    }, (error) => {
      this.errorMessage = error;
    });
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ionViewWillEnter() {
  }

  slidesDidLoad(slides) {
    slides.startAutoplay();
  }

}
