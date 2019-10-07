import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appPlaceholder]'
})
export class PlaceholderDirective {

  // Inject ViewContainer Ref - which will give us access to the reference (pointer) at a place where this directive is used
  constructor(public viewContainerRef: ViewContainerRef) {}
}
