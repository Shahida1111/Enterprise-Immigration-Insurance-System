import { Component } from '@angular/core';
import { SessionStorageService } from 'src/app/services/session-storage.service';
import { PaymentService } from 'src/app/services/payment.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ActivatedRoute, Router } from '@angular/router';

interface PaymentGatewayResponse {
  status: string;
  signature: string;
  merchantAccountNo: string;
}
@Component({
  selector: 'app-payment-error',
  templateUrl: './payment-error.component.html',
  styleUrls: ['./payment-error.component.scss']
})
export class PaymentErrorComponent {
  paymentUrl: any;
  quoteData: any;
  txnId: any;
  paymentGatewaySettings: any;
  signature: any = '';
  amount: any = '';
  isCustomer: boolean = false;
  isPermPolicyNull: boolean = false;


  constructor(
    private storageService: SessionStorageService,
    private paymentService: PaymentService,
    private spinner: NgxSpinnerService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const permPolicyNo = params['isPermPolicyNull'];
  
      if (permPolicyNo == 'null') {
          this.isPermPolicyNull = true;
      }
    });
    this.paymentUrl = this.storageService.getSession('paymentUrl');
    this.quoteData = this.storageService.getSession('quoteData');

    let url = new URL(this.paymentUrl);
    let txn: any = '';
    txn = url.searchParams.get('MERCHANT_TRANID');
    this.signature = url.searchParams.get('TXN_SIGNATURE');
    this.amount = this.formatPremium(this.quoteData.productJSON.risk.premium.payable_premium);
    let tranIDSpit = txn.split('-');
    let tempTransID = tranIDSpit[0];
    let transCount = Number(tranIDSpit[1]);
    let payErrorCount = transCount + 1;
    this.txnId = tempTransID + '-' + payErrorCount;
    this.isCustomer = this.storageService.getSession('isCustomer');

  }
  onClose() {
    window.location.href = 'https://www.google.com';
    this.storageService.clear();

  }
  backToPayment() {
    let mode = '';
    if (this.quoteData.intermediary === 'DIRECT') {
      mode = 'UAT';
    } else {
      mode = 'UAT_B2B';
    }

    this.spinner.show("loadingSpinner");
    this.paymentService
      .gatewaySettingsV2(mode, this.txnId, this.amount)
      .subscribe({
        next: (response: any) => {
          const paymentResponse = response as PaymentGatewayResponse;
          let newSignature = paymentResponse.signature;
          setTimeout(() => {
            let txnId = this.txnId;

            let url = this.paymentService.paymentgatewayUrl(
              this.quoteData,
              paymentResponse,
              txnId,
              newSignature
            );

            let form = document.createElement('form');
            form.method = 'POST';
            form.action = url;
            document.body.appendChild(form);
            form.submit();

            this.storageService.setSession('paymentUrl', url);
          }, 200);
        },
        error: (err) => {
          this.spinner.hide("loadingSpinner");
        },
      });
  }
  formatPremium = (premium: any) => {
    let prem;
    if (premium !== 'undefuned') {
      prem = parseFloat(premium).toFixed(2);
    } else {
      prem = 0;
    }
    return prem;
  };
}
