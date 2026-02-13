import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { SessionStorageService } from 'src/app/services/session-storage.service';
import {  Router } from '@angular/router';
import { ThankyouPopupComponent } from 'src/app/popups/thankyou-popup/thankyou-popup.component';
@Component({
  selector: 'app-payment-link',
  templateUrl: './payment-link.component.html',
  styleUrls: ['./payment-link.component.scss']
})
export class PaymentLinkComponent {
  linkGenerated: boolean = false;
  quoteData: any;
  quoteNo:string = '';
  payableNetPremium:string = '';
  base64QR: string | null = null;
 
  constructor(
  
    private storageService: SessionStorageService,
    private modalService: NgbModal,
    private router: Router,
    private spinner: NgxSpinnerService,
  ) {

  }
  ngOnInit() {
    if (this.storageService.getSession('quoteData') != undefined) {
      this.base64QR = this.storageService.getSession('base64Img');
    
      this.quoteData = this.storageService.getSession('quoteData');
      this.quoteNo=this.quoteData.quoteNo;
      this.payableNetPremium=this.quoteData.productJSON.risk.premium.payable_premium;
    } else {
      console.error('quoteData  not in the session');
    }
  }
  downloadQRCode(){
    this.spinner.show("loadingSpinner");
    const link = document.createElement('a');
    link.href = 'data:image/png;base64,' + this.base64QR;
    link.download = `${this.quoteData.quoteNo}.png`;
    link.click();
    this.spinner.hide("loadingSpinner");
  }

  close(){
    this.modalService.open(ThankyouPopupComponent, { size: 'lg' }); 
  }

}
