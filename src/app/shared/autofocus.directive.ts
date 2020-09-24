import { Directive, ElementRef, Input, OnInit, AfterViewInit, ApplicationRef } from '@angular/core';
@Directive({
  selector: '[appAutofocus]'
})
export class AutofocusDirective implements OnInit, AfterViewInit {

  private focus = true;

  constructor(private el: ElementRef, private ref: ApplicationRef) {
  }

  ngOnInit() {
    // if (this.focus) {
    //   this.el.nativeElement.focus();
    //   // window.setTimeout(() => {
    //   //   this.el.nativeElement.focus();
    //   // });
    // }
  }
  ngAfterViewInit() {
    setTimeout(
      () => {
        this.el.nativeElement.focus();
        this.ref.tick();
      },
    500);
  }

  @Input() set autofocus(condition: boolean) {
    alert(condition);
    this.focus = condition !== false;
  }

}
