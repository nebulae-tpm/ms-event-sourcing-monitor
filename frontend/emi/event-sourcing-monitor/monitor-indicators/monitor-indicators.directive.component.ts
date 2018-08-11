
import { Directive, HostListener,
    HostBinding, ElementRef, Renderer2 } from '@angular/core';
  
  @Directive({
    // tslint:disable-next-line:directive-selector
    selector: '[appHighlight]'
  })
  export class SelectedItemDirective {
    // @HostBinding('class.open') selected = false;
    @HostBinding('style.background') background = 'transparent';
    @HostBinding('style.cursor') cursor = 'default';
  
    constructor(item: ElementRef, renderer: Renderer2) {
     // item.nativeElement.style.backgroundColor = 'yellow';
    //  renderer.setStyle(item.nativeElement, 'background', 'green');
   }
  
    @HostListener('mouseenter') turnOnBackground() {
      this.background = '#D8EAF1'; // E1EAEE
      this.cursor = 'pointer';
    }
    @HostListener('mouseleave') turnOffBackground() {
      this.background = 'none';
      this.cursor = 'default';
    }
  
  }