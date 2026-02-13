import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SessionStorageService } from 'src/app/services/session-storage.service';
@Component({
  selector: 'app-payment-back-error',
  templateUrl: './payment-back-error.component.html',
  styleUrls: ['./payment-back-error.component.scss']
})
export class PaymentBackErrorComponent {
  isCustomer: boolean = false;

  constructor(public modal: NgbActiveModal, public storageService: SessionStorageService) {}

  ngOnInit(): void {
    this.isCustomer = this.storageService.getSession('isCustomer');
  }

  exit = () => {
    window.location.href = 'https://google.com';
    this.modal.dismiss('Cross click');
  };
}
