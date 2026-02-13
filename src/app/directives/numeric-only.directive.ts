import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appNumericOnly]'
})
export class NumericOnlyDirective {

  constructor(private el: ElementRef) {}

  @HostListener('keypress', ['$event'])
  onKeyPress(event: KeyboardEvent) {
    const regex = /^\d+$/;

    const inputChar = event.key;

    if (!regex.test(inputChar)) {
      event.preventDefault();
    }
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    const blockedKeys = ['[', ']', '{', '}', '(', ')', '\\', '|'];

    if (blockedKeys.includes(event.key)) {
      event.preventDefault();
    }
  }

}
