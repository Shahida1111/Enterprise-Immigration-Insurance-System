import { Directive,ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appAlphabetOnly]'
})
export class AlphabetOnlyDirective {

  constructor(private el: ElementRef) {



  }
  @HostListener('keydown', ['$event'])
 onKeyDown(event: KeyboardEvent) {
   const inputChar = event.key;

   if (inputChar !== ' ' && !/^[a-zA-Z]+$/.test(inputChar)) {
     event.preventDefault();
   }
 }

}
