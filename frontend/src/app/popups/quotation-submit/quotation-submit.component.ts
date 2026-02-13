import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-quotation-submit',
  templateUrl: './quotation-submit.component.html',
  styleUrls: ['./quotation-submit.component.scss'],
})
export class QuotationSubmitComponent {
  @Input() title: string = 'Quotation Saved'; // Default title
  @Input() message: string =
    'Your quotation request has been saved successfully!';
  @Input() showGoBack: boolean = false; // Show "Go Back" button for Save
  @Input() showExit: boolean = false; // Show "Exit" button for Save

  constructor(public activeModal: NgbActiveModal) {}

  closePopup() {
    window.close();
  }
  goBack() {
    this.activeModal.close('goBack');
  }
}
