import { Component,Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-thankyou-popup',
  templateUrl: './thankyou-popup.component.html',
  styleUrls: ['./thankyou-popup.component.scss']
})
export class ThankyouPopupComponent {
  @Input() msg: string = '';
  constructor(public modal: NgbActiveModal) {}
  exit = () => {
    window.location.href = 'https://google.com';
  };
}
