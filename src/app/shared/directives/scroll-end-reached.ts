import { Directive, HostListener, input, output } from '@angular/core';

@Directive({
  selector: '[appScrollEndReached]',
})
export class ScrollEndReached {
  scrollGap = input.required<number>();
  readonly scrollEndReached = output<void>();

  @HostListener('scroll', ['$event'])
  onScroll(event: Event): void {
    const target = event.target as HTMLElement;

    if (
      target.scrollHeight - target.scrollTop <=
      target.clientHeight + this.scrollGap()
    ) {
      this.scrollEndReached.emit();
    }
  }
}
