import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DatePipe } from '@angular/common';
import { PayLinkComponent } from 'src/app/popups/pay-link/pay-link.component';
import { immigrationService } from '../../services/immigration.service';
import { SessionStorageService } from '../../services/session-storage.service';
import { StmgService } from '../../services/stmg.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormBuilder } from '@angular/forms';
import { PaymentService } from 'src/app/services/payment.service';
import { PaymentBackErrorComponent } from 'src/app/popups/payment-back-error/payment-back-error.component';
import { ThankyouPopupComponent } from 'src/app/popups/thankyou-popup/thankyou-popup.component';
import { QuoteExpiredComponent } from 'src/app/popups/quote-expired/quote-expired.component'; // adjust path if needed
import { encode } from 'entities';
interface PaymentGatewayResponse {
  status: string;
  signature: string;
  merchantAccountNo: string;
}

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss'],
})
export class PaymentComponent {
  quoteData: any;
  premiumPerWorker: number = 0;
  token: any = '';
  id: any = '';
  paymentOption: any;
  selectedOption: any;
  totalPremium: number = 0;
  amountToPaid: number = 0;
  isCustomer: boolean = false;
  paymentGatewaySettings: any;
  flag: any;
  base64Image: string | null = null;
  permPolicyNo: any;
  policyFrom: any;
  policyTo: any;
  address: any;
  isLoaded: boolean = false;
  isButtonClicked: boolean = false;
  isQuoteExpired: boolean = false;
  intervalId: any;
  deadline = new Date();
  isPayed: boolean = false;
  fromURL: boolean = false;
  overdueText = '';
  isLinkGenerated : boolean = false;

  constructor(
    private modalService: NgbModal,
    private immigrationService: immigrationService,
    private storageService: SessionStorageService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private stmgService: StmgService,
    private activeRoute: ActivatedRoute,
    private datePipe: DatePipe,
    private formBuilder: FormBuilder,
    private payment: PaymentService
  ) {}

  ngOnInit() {
    this.activeRoute.queryParams.subscribe((params) => {
      if (params['id'] && params['accessToken']) {
        this.id = params['id'];
        this.token = params['accessToken'];
      }
    });
    if (this.storageService.getSession('quoteData') != undefined) {
      this.quoteData = this.storageService.getSession('quoteData');
      if (this.storageService.getSession('isCustomer')) {
        this.isCustomer = true;
      }
      this.spinner.show('loadingSpinner');
      this.immigrationService.loadQuote(
        this.quoteData.id,
        this.quoteData.accessToken
      ).subscribe({
        next: (response: any) => {
          this.storageService.setSession('quoteData', response);

          const policyFromDate = new Date(response.policyFrom);
          const currentDate = new Date();
          //const currentDate = new Date('2025-05-22T12:00:00');
          this.isExpired(
            policyFromDate,
            currentDate,
            response.status,
            response.policyStatus
          );

          if (response.status == 'BQ' && response?.policyStatus !== 'A') {
            this.quoteData.policyFrom = this.datePipe.transform(
              this.quoteData.policyFrom,
              'MMM d, y hh:mm:ss a'
            );
            this.quoteData.policyTo = this.datePipe.transform(
              this.quoteData.policyTo,
              'MMM d, y hh:mm:ss a'
            );
            this.spinner.show('loadingSpinner');
             this.quoteData = this.quoteData;
            this.immigrationService.requestQuote(this.quoteData).subscribe({
              next: (res: any) => {
                this.storageService.setSession('quoteData', res);
                this.spinner.hide('loadingSpinner');
              },
              error: (err: any) => {
                console.error('Error during requestQuote:', err);
                this.spinner.hide('loadingSpinner');
              },
            });
          }

          this.spinner.hide('loadingSpinner');
        },
        error: (error: any) => {
          this.spinner.hide('loadingSpinner');
        },
      });

      if (
        this.quoteData.status == 'BQ' &&
        this.storageService.getSession('base64Img') != undefined
      ) {
        this.router.navigate(['paymentLink']);
      }

      this.permPolicyNo = this.storageService.getSession('policyNo');

      this.totalPremium = this.quoteData.payableNetPremium;
      this.quoteData.policyFrom = this.datePipe.transform(
        this.quoteData.policyFrom,
        'MMM d, y hh:mm:ss a'
      );
      this.quoteData.policyTo = this.datePipe.transform(
        this.quoteData.policyTo,
        'MMM d, y hh:mm:ss a'
      );

      this.loadInitialViewData();
    } else {
      this.firstTimeCustomer();
    }
    this.isLinkGenerated = this.quoteData.productJSON.risk.isLinkGenerated;
    if (this.isLinkGenerated) {
      history.pushState(null, '', location.href);
      window.onpopstate = function() {
          history.pushState(null, '', location.href); 
      };
    } else {
        console.log("Link not generated, normal behavior.");
    }
  }
  isExpired(
    policyFromDate: Date,
    currentDate: Date,
    status: String,
    policyStatus: String
  ) {
    // Set the deadline time to 11:59:59 PM
    policyFromDate.setHours(23, 59, 59, 999);
    this.deadline = policyFromDate;

    // Start the dynamic timer
    this.startTimer(policyFromDate);
    // Check if the quotation is already overdue
    if (currentDate > policyFromDate) {
      const formattedThreeDaysBeforeDateTime = this.datePipe.transform(
        policyFromDate,
        'dd-MM-yyyy hh:mm a'
      );
      this.isQuoteExpired = true;

      const overdueTime = this.calculateOverdueTime(
        policyFromDate,
        currentDate,
        'Popup'
      );
      const modalRef = this.modalService.open(QuoteExpiredComponent, {
        centered: true,
      });
      if (status === 'BQ' && policyStatus === 'A') {
        modalRef.componentInstance.message1 = 'Policy Already Issued';
        modalRef.componentInstance.message2 =
          `This quotation has already been successfully converted into a policy. ` +
          `No further action is required.<br><br>` +
          `Policy activation was completed before <b>${formattedThreeDaysBeforeDateTime}</b>.`;
      } else {
        modalRef.componentInstance.message1 = 'Quotation Expiration Notice';
        modalRef.componentInstance.message2 = `This quotation is no longer valid. The deadline for proceeding was <b>${formattedThreeDaysBeforeDateTime}</b>.<br><br>${overdueTime}`;
      }
    }
  }


  startTimer(policyFromDate: Date) {
    this.intervalId = setInterval(() => {
      const currentDate = new Date(); // Get the current time dynamically
      this.overdueText = this.calculateOverdueTime(
        policyFromDate,
        currentDate,
        'Timer'
      ); // Update overdue text
    }, 1000); // Update every second
  }
  calculateOverdueTime(
    deadline: Date,
    currentDate: Date,
    option: string
  ): string {
    let diffInMillis = currentDate.getTime() - deadline.getTime(); // Do not use Math.abs, as it will ignore the sign

    // If the deadline has passed, the difference should be negative
    const isOverdue = diffInMillis > 0;

    const days = Math.floor(Math.abs(diffInMillis) / (1000 * 60 * 60 * 24));
    diffInMillis %= 1000 * 60 * 60 * 24;

    const hours = Math.floor(Math.abs(diffInMillis) / (1000 * 60 * 60));
    diffInMillis %= 1000 * 60 * 60;

    const minutes = Math.floor(Math.abs(diffInMillis) / (1000 * 60));
    diffInMillis %= 1000 * 60;

    const seconds = Math.floor(Math.abs(diffInMillis) / 1000);

    if (option === 'Timer') {
      const label = isOverdue
        ? 'This quotation is overdue by : '
        : 'This quotation will expire in : ';

      return `${label} <b> ${days} Day(s) ${hours} Hour(s) ${minutes} Minute(s) ${seconds} Second(s) </b>`;
    } else {
      const label = isOverdue ? 'Overdue by' : 'Time remaining';
      return `${label} : <br> <b> ${days} Day(s) ${hours} Hour(s) ${minutes} Minute(s) ${seconds} Second(s) </b>`;
    }
  }
  firstTimeCustomer() {
    if (this.id != undefined && this.token != undefined) {
      this.isCustomer = true;
      this.storageService.setSession('isCustomer', this.isCustomer);
      this.stmgService.updateisLQSuccess(this.isCustomer);
      this.isLQStmg();
    } else {
      this.isCustomer = false;
      this.storageService.setSession('isCustomer', this.isCustomer);
    }
  }
  loadInitialViewData() {
    if (this.isCustomer) {
      this.paymentOption =
        this.quoteData.productJSON.risk.immigration_options.list.paymentOptionList.paymentOption.filter(
          (option: { content: string }) => option.content !== 'Payment Link'
        );
    } else {
      this.paymentOption =
        this.quoteData.productJSON.risk.immigration_options.list.paymentOptionList.paymentOption.filter(
          (option: { content: string }) => option.content === 'Payment Link'
        );
    }

    this.selectedOption = this.paymentOption[0].value;

    if (this.quoteData.productJSON.risk.immigration_data.selected_bond_period == 14) {
      this.premiumPerWorker =
        this.quoteData.productJSON.risk.immigration_options.premiumData.fourteenMonthPremium;
    } else {
      this.premiumPerWorker =
        this.quoteData.productJSON.risk.immigration_options.premiumData.twentySixMonthPremium;
    }
  }
  isLQStmg = () => {
    this.stmgService.isLQSuccessObs.subscribe((status: any) => {
      if (status) {
        this.loadQuoteService();
        this.quoteData = this.storageService.getSession('quoteData');
      }
    });
  };
  loadQuoteService() {
    this.spinner.show('loadingSpinner');
    this.immigrationService.loadQuote(this.id, this.token).subscribe({
      next: (response) => {
        this.quoteData = response;
        this.storageService.setSession('quoteData', response);

        const policyFromDate = new Date(response.policyFrom);
        const currentDate = new Date();
        //const currentDate = new Date('2025-05-21T12:00:00');
        this.isExpired(
          policyFromDate,
          currentDate,
          response.status,
          response.policyStatus
        );

        if (response?.policyStatus !== 'A') {
          if (response.status === 'BQ') {
            this.quoteData.policyFrom = this.datePipe.transform(
              this.quoteData.policyFrom,
              'MMM d, y hh:mm:ss a'
            );
            this.quoteData.policyTo = this.datePipe.transform(
              this.quoteData.policyTo,
              'MMM d, y hh:mm:ss a'
            );
            this.spinner.show('loadingSpinner');
             this.quoteData = this.quoteData;
            this.immigrationService.requestQuote(this.quoteData).subscribe({
              next: (res: any) => {
                this.storageService.setSession('quoteData', res);
                this.loadQuoteService();
                this.spinner.hide('loadingSpinner');
              },
              error: (err: any) => {
                console.error('Error during requestQuote:', err);
                this.spinner.hide('loadingSpinner');
              },
            });
          } else {
            console.log('456');
            setTimeout(() => {
              this.quoteData = response;
              this.storageService.setSession('quoteData', this.quoteData);

              this.quoteData.policyFrom = this.datePipe.transform(
                this.quoteData.policyFrom,
                'MMM d, y hh:mm:ss a'
              );
              this.quoteData.policyTo = this.datePipe.transform(
                this.quoteData.policyTo,
                'MMM d, y hh:mm:ss a'
              );
              this.address =
                this.quoteData.productJSON.risk.immigration_options.AcraData.CompanyData.registeredAddress;

              this.totalPremium = this.quoteData.payableNetPremium;
              this.isLoaded = !this.isLoaded;
              this.stmgService.updateIsloaded(this.isLoaded);
            }, 100);
          }
        } else {
          if (!this.isQuoteExpired) {
            this.isPayed = true;
            this.modalService.open(PaymentBackErrorComponent, {
              size: 'lg',
              backdrop: 'static',
            });
          }
        }

        this.spinner.hide('loadingSpinner');
      },
      error: () => {
        this.spinner.hide('loadingSpinner');
      },
    });
  }
    sanitizeAmpersands(obj: any): any {
    if (typeof obj === 'string') {
        // Skip if the string appears to already contain encoded entities
        if (/&(?:[a-z]+|#\d+);/i.test(obj)) {
            return obj;
        }
        return encode(obj);
    } else if (Array.isArray(obj)) {
        return obj.map((item) => this.sanitizeAmpersands(item));
    } else if (obj && typeof obj === 'object') {
        const newObj: any = {};
        for (const key of Object.keys(obj)) {
            newObj[key] = this.sanitizeAmpersands(obj[key]);
        }
        return newObj;
    }
    return obj;
}
  payOptionChange = (event: any) => {
    this.selectedOption = event.target.value;
    this.selectedOption = event.target.value;

    sessionStorage.setItem('payOption', this.selectedOption);
  };

  generateLink() {
    this.isLinkGenerated = true;
    this.spinner.show('loadingSpinner');
    console.log("this.isLinkGenerated", this.isLinkGenerated)
    this.quoteData.productJSON.risk.isLinkGenerated = this.isLinkGenerated;
    if (this.isLinkGenerated) {
      history.pushState(null, '', location.href);
      window.onpopstate = function() {
          history.pushState(null, '', location.href); 
      };
    } else {
        console.log("Link not generated, normal behavior.");
    }
    this.quoteData = this.quoteData;
    this.immigrationService.requestQuote(this.quoteData).subscribe({
      next: (res: any) => {
        this.storageService.setSession('quoteData', res);
        this.immigrationService.loadQuote(
          this.quoteData.id,
          this.quoteData.accessToken
        ).subscribe({
          next: (response: any) => {
            this.storageService.setSession('quoteData', response);

            if (response.status === 'BQ' || response.policyStatus !== 'A') {
              this.quoteData.policyFrom = this.datePipe.transform(
                this.quoteData.policyFrom,
                'MMM d, y hh:mm:ss a'
              );
              this.quoteData.policyTo = this.datePipe.transform(
                this.quoteData.policyTo,
                'MMM d, y hh:mm:ss a'
              );
              this.spinner.show('loadingSpinner');
               this.quoteData = this.quoteData;
              this.immigrationService.requestQuote(this.quoteData).subscribe({
                next: (res: any) => {
                  this.storageService.setSession('quoteData', res);
                  this.spinner.hide('loadingSpinner');
                },
                error: (err: any) => {
                  console.error('Error during requestQuote:', err);
                  this.spinner.hide('loadingSpinner');
                },
              });
            } else {
              this.spinner.hide('loadingSpinner'); // Status is not BQ
            }

            this.spinner.hide('loadingSpinner');
            let payUrl = this.payment.generatePayLinkUrl(
              this.quoteData.id,
              this.quoteData.accessToken
            );
            const modalRef = this.modalService.open(PayLinkComponent, {
              size: 'lg',
            });
            modalRef.componentInstance.payUrl = payUrl;
          },
          error: (error: any) => {
            this.spinner.hide('loadingSpinner');
          },
        });
        this.spinner.hide('loadingSpinner');
      },
      error: (err: any) => {
        console.error('Error during requestQuote:', err);
        this.spinner.hide('loadingSpinner');
      },
    });
  }

  clickPaynow() {
    this.spinner.show('loadingSpinner');
    this.selectedOption = 'PN';
    this.callBQ();
    this.spinner.hide('loadingSpinner');
  }

  clickCreditCard() {
    this.spinner.show('loadingSpinner');
    this.isButtonClicked = true;

    this.selectedOption = 'CC';
    this.callBQ();
    this.spinner.hide('loadingSpinner');
  }
  customerScreenCheck(quoteData: any) {
    this.spinner.show('loadingSpinner');
    if (
      quoteData.productJSON.risk.custScreenFlag != undefined &&
      quoteData.productJSON.risk.custScreenFlag != ''
    ) {
      if (Array.isArray(quoteData.productJSON.risk.custScreenFlag)) {
        this.flag = quoteData.productJSON.risk.custScreenFlag[0];
      } else {
        this.flag = quoteData.productJSON.risk.custScreenFlag;
      }
      switch (this.flag) {
        case 'GO':
          if (this.selectedOption == 'PN') {
            this.generatePayNow();
          } else {
            this.paymentGateway();
          }

          break;
        case 'HOLD':
          const modalRef = this.modalService.open(ThankyouPopupComponent, {
            size: 'lg',
            backdrop: 'static',
          });
          modalRef.componentInstance.msg = 'sanction';
          this.spinner.hide('loadingSpinner');
          break;
        case 'STOP':
          const modalRef2 = this.modalService.open(ThankyouPopupComponent, {
            size: 'lg',
            backdrop: 'static',
          });
          modalRef2.componentInstance.msg = 'sanction';
          this.spinner.hide('loadingSpinner');
          break;
      }
    } else {
      //empty
    }
  }

  generatePayNow() {
    let amount = this.formatPremium(this.totalPremium);
    this.immigrationService.genaratePaymentLink(
      this.quoteData.id,
      this.quoteData.policyNo,
      this.quoteData.policyAccessToken,
      amount
    ).subscribe({
      next: (response) => {
        if (response.status === 'OK') {
          this.base64Image = response.base64Image;
          this.storageService.setSession('base64Img', this.base64Image);

          this.router.navigate(['paymentLink']);
        } else {
          console.error('Failed to generate QR code');
        }

        this.spinner.hide('loadingSpinner');
      },
      error: () => {
        this.spinner.hide('loadingSpinner');
      },
    });
  }

  callBQ() {
    this.quoteData.productJSON.risk.immigration_data.payment_method =
      this.selectedOption;
    this.isCustomer = true;
    this.spinner.show('loadingSpinner');

    this.quoteData.insured = this.createPersonData(this.address);
    this.quoteData.customer = this.createPersonData(this.address);

    this.storageService.setSession('isCustomer', this.isCustomer);
    this.storageService.setSession('quoteData', this.quoteData);
    if (this.quoteData.status != 'BQ') {
      this.spinner.show('loadingSpinner');
       this.quoteData = this.quoteData;
      this.immigrationService.bindQuote(this.quoteData).subscribe({
        next: (response) => {
          this.quoteData = response;
          this.storageService.setSession('quoteData', this.quoteData);

          //this.customerScreenCheck(this.quoteData);

          this.spinner.hide('loadingSpinner');
          if (this.selectedOption == 'PN') {
            this.generatePayNow();
          } else {
            this.paymentGateway();
          }
        },
        error: (error) => {
          this.spinner.hide('loadingSpinner');
        },
      });
    } else if (
      this.quoteData.status != 'BQ' &&
      this.storageService.getSession('base64Img') != undefined
    ) {
      this.router.navigate(['paymentLink']);
      this.spinner.hide('loadingSpinner');
    }
  }
  //keep this commented code for future use. Please Do not remove!
  // callBQ() {
  //   this.quoteData.productJSON.risk.immigration_data.payment_method = this.selectedOption;
  //   this.isCustomer = true;
  //   this.spinner.show();

  //   this.quoteData.insured = {
  //     "firstName": this.quoteData.productJSON.risk.immigration_options.AcraData.CompanyData.name,
  //     "lastName": '',

  //     "mobile": this.quoteData.productJSON.risk.immigration_data.mobile,

  //     "email": this.quoteData.productJSON.risk.immigration_data.email,

  //     "addressCollection": [
  //       {
  //         "address": {
  //           "postalCode": this.address?.postalCode || '',
  //           "addressLine1": this.address?.bldgName || 'NA',
  //           "addressLine2": this.address?.streetName || 'NA',
  //           "city": this.address?.postalCode ? `S(${this.address.postalCode})` : '',
  //           "unitNo": this.address?.unitNo || '',
  //           "country": "Singapore"
  //         },
  //         "addressType": "COMMERCIAL"
  //       }
  //     ]

  //   };
  //   this.quoteData.customer = {
  //     "firstName": this.quoteData.productJSON.risk.immigration_options.AcraData.CompanyData.name,
  //     "lastName": '',
  //     "mobile": this.quoteData.productJSON.risk.immigration_data.mobile,

  //     "email": this.quoteData.productJSON.risk.immigration_data.email,

  //     "addressCollection": [
  //       {
  //         "address": {
  //           "postalCode": this.address?.postalCode || '',
  //           "addressLine1": this.address?.bldgName || 'NA',
  //           "addressLine2": this.address?.streetName || 'NA',
  //           "city": this.address?.postalCode ? `S(${this.address.postalCode})` : '',
  //           "unitNo": this.address?.unitNo || '',
  //           "country": "Singapore"
  //         },
  //         "addressType": "COMMERCIAL"
  //       }
  //     ]

  //   };

  //   this.storageService.setSession('isCustomer', this.isCustomer);
  //   this.storageService.setSession('quoteData', this.quoteData);
  //   if (this.quoteData.status != 'BQ') {
  //     this.immigrationService.bindQuote(this.quoteData).subscribe({
  //       next: (response) => {
  //         this.quoteData = response;
  //         this.storageService.setSession('quoteData', this.quoteData);
  //         this.spinner.hide();

  //         this.customerScreenCheck(this.quoteData);
  //       },
  //       error: (error) => {
  //         this.spinner.hide();
  //         //console.log('error', error);
  //       },
  //     });
  //   }
  //   else if (this.quoteData.status != 'BQ' && this.storageService.getSession('base64Img') != undefined) {

  //     this.router.navigate(['paymentLink']);
  //     this.spinner.hide();
  //   }

  // }
  createAddressCollection(address: any) {
    return [
      {
        address: {
          postalCode: address?.postalCode || '',
          addressLine1: this.getAddressLine1(address),
          unitNo: address?.bldgName || '',
          city: address?.postalCode ? `S(${address.postalCode})` : '',
          addressLine2: this.getAddressLine2(address),
          country: 'Singapore',
        },
        addressType: 'COMMERCIAL',
      },
    ];
  }
  getAddressLine1(address: any): string {
    if (address?.blkhseNo && address?.streetName) {
      return `${address.blkhseNo}, ${address.streetName}`;
    }
    return address?.blkhseNo || address?.streetName || '';
  }

  getAddressLine2(address: any): string {
    if (address?.levelNo && address?.unitNo) {
      return `${address.levelNo}-${address.unitNo}`;
    }
    return address?.levelNo || address?.unitNo || '';
  }

  createPersonData(address: any) {
    return {
      firstName:
        this.quoteData.productJSON?.risk?.immigration_options?.AcraData?.CompanyData
          ?.name || '',
      lastName: '',
      mobile: this.quoteData.productJSON?.risk?.immigration_data?.mobile || '',
      email: this.quoteData.productJSON?.risk?.immigration_data?.email || '',
      addressCollection: this.createAddressCollection(address),
    };
  }
  paymentGateway = () => {
    let mode = '';
    if (this.quoteData.intermediary === 'DIRECT') {
      mode = 'UAT';
    } else {
      mode = 'UAT_B2B';
    }

    this.spinner.show('loadingSpinner');
    let txnId = this.quoteData.quoteNo + '-1';
    let amount = this.formatPremium(this.totalPremium);
    this.payment.gatewaySettingsV2(mode, txnId, amount).subscribe({
      next: (response: any) => {
        const paymentResponse = response as PaymentGatewayResponse;

        let newSignature = paymentResponse.signature;
        setTimeout(() => {
          let txnId = this.quoteData.quoteNo + '-1';
          let url = this.payment.paymentgatewayUrl(
            this.quoteData,
            paymentResponse,
            txnId,
            newSignature
          );

          this.storageService.setSession('paymentUrl', url);
          let form = document.createElement('form');
          form.method = 'POST';
          form.action = url;

          document.body.appendChild(form);
          form.submit();
        }, 200);

        this.spinner.hide('loadingSpinner');
      },
      error: (err) => {
        this.spinner.hide('loadingSpinner');
      },
    });
  };
  formatPremium = (premium: any) => {
    let prem;
    if (premium !== 'undefuned') {
      prem = parseFloat(premium).toFixed(2);
    } else {
      prem = 0;
    }
    return prem;
  };
  formatPremiumBQ = (premium: any) => {
    let prem;
    if (premium !== 'undefuned') {
      prem = parseFloat(premium).toFixed(1);
    } else {
      prem = 0;
    }
    return prem;
  };
  onBack() {
    this.router.navigate(['quotation']);
  }
}
