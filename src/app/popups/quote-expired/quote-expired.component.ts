import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-quote-expired',
  templateUrl: './quote-expired.component.html',
  styleUrls: ['./quote-expired.component.scss']
})
export class QuoteExpiredComponent {

  @Input() message1: string = 'Your quote has expired.'; // Default fallback message
  @Input() message2: string = 'Your quote has expired.'; // Default fallback message

  constructor(public modal: NgbActiveModal) {}

  exit(): void {
    // Close the modal and optionally pass a result
    this.modal.close('Exit clicked');
  }
}
