import { DatePipe } from '@angular/common';
import { Component, Injectable } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SessionStorageService } from 'src/app/services/session-storage.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { immigrationService } from '../../services/immigration.service';
import { saveAs } from 'file-saver';
import { StmgService } from 'src/app/services/stmg.service';
import { QuoteExpiredComponent } from 'src/app/popups/quote-expired/quote-expired.component'; // adjust path if needed
import { encode } from 'entities';
export interface Worker {
  fin: string;
  name: string;
  nationality: string;
}
import {
  NgbDateParserFormatter,
  NgbDateStruct,
  NgbModal,
} from '@ng-bootstrap/ng-bootstrap';
import { ThankyouPopupComponent } from 'src/app/popups/thankyou-popup/thankyou-popup.component';
@Injectable()
export class CustomDateParserFormatter extends NgbDateParserFormatter {
  readonly DELIMITER = '/';

  parse(value: string): NgbDateStruct | null {
    if (value) {
      const date = value.split(this.DELIMITER);
      return {
        day: parseInt(date[0], 10),
        month: parseInt(date[1], 10),
        year: parseInt(date[2], 10),
      };
    }
    return null;
  }

  format(date: NgbDateStruct | null): string {
    return date
      ? date.day.toString().padStart(2, '0') +
          this.DELIMITER +
          date.month.toString().padStart(2, '0') +
          this.DELIMITER +
          date.year
      : '';
  }
}

@Component({
  selector: 'app-quotation',
  templateUrl: './quotation.component.html',
  styleUrls: ['./quotation.component.scss'],
  providers: [
    { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter },
  ],
})
export class QuotationComponent {
  insuredEmployerName: string = '';
  email: string = '';
  mobileNumber: string = '';
  uenNumber: string = '';
  cpfNumber: string = '';
  quotationNumber: string = '';
  natureOfBusiness: string = '';
  address: any = '';
  fromDate: any = '';
  toDate: any = '';
  totalWorkers: number = 0;
  workers: Worker[] = [];
  totalPremium: number = 0;
  premiumPerWorker: number = 0;
  quoteData: any;
  numberOfWorkers: number = 0;
  ssicList: any[] = [];
  companyData: any;
  base64String: any;
  pdfName: any;
  quotationString: any;
  quotationFileName: any;
  id: any;
  token: any;
  btoken: any;
  isLoaded: boolean = false;
  flag: any;
  isQuoteExpired: boolean = false;
  isWorkersExceeded: boolean = false;

  constructor(
    private router: Router,
    private storageService: SessionStorageService,
    private datePipe: DatePipe,
    private spinner: NgxSpinnerService,
    private immigrationService: immigrationService,
    private routeActive: ActivatedRoute,
    private stmgService: StmgService,
    private modalService: NgbModal
  ) {}

  ngOnInit() {
    this.loadInitialViewData();
    console.log('quotation page', this.quoteData?.productJSON?.risk?.isLinkGenerated);
  }

  ifWorkersExceeded(no_of_workers: any, balanceWorkers: any): boolean {
    return no_of_workers > balanceWorkers;
  }

  checkWithRQ() {
    this.spinner.show('loadingSpinner');
    this.quoteData = this.quoteData;
    this.immigrationService.requestQuote(this.quoteData).subscribe({
      next: (response: any) => {
        this.quoteData = response;
        // Stop if quote is expired
        if (this.handleQuoteExpirationCheck()) {
          return;
        }
        if (this.handleWorkerBalanceCheck()) {
          return;
        }

        this.spinner.hide('loadingSpinner');
      },

      error: (error: any) => {
        this.spinner.hide('loadingSpinner');
      },
    });
  }

  loadInitialViewData() {
    if (this.storageService.getSession('quoteData') != undefined) {
      this.quoteData = this.storageService.getSession('quoteData');
      this.spinner.show('loadingSpinner');
      this.immigrationService.loadQuote(
        this.quoteData.id,
        this.quoteData.accessToken
      ).subscribe({
        next: (response: any) => {
          this.quoteData.policyFrom = this.datePipe.transform(
            this.quoteData.policyFrom,
            'MMM d, y hh:mm:ss a'
          );
          this.quoteData.policyTo = this.datePipe.transform(
            this.quoteData.policyTo,
            'MMM d, y hh:mm:ss a'
          );

          this.checkWithRQ();
          this.spinner.hide('loadingSpinner');
        },
        error: (error: any) => {
          this.spinner.hide('loadingSpinner');
        },
      });
      this.loadExistingData();
    } else {
      this.routeActive.queryParams.subscribe((params) => {
        this.id = params['id'];
        this.token = params['token'];
        this.btoken = params['btoken'];
      });

      if (this.id != undefined && this.token != undefined) {
        this.isLoaded = !this.isLoaded;
        this.storageService.setSession('isLoaded', this.isLoaded);
        this.stmgService.updateIsloaded(this.isLoaded);
        this.isEditedStmg();
        this.loadQuoteService();
      }
    }

    //console.log("workers",this.workers)
  }

  decodeHTMLEntities(value: string): string {
    const txt = document.createElement('textarea');
    txt.innerHTML = value;
    return txt.value;
  }
  isEditedStmg = () => {
    this.stmgService.isLoadedObs.subscribe((status: any) => {
      if (status) {
        this.quoteData = this.storageService.getSession('quoteData');
      }
    });
  };

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

  private handleWorkerBalanceCheck(): boolean {
    const balanceWorkers =
      this.quoteData?.productJSON?.risk?.immigration_options?.balanceWorkers;
    const no_of_workers =
      this.quoteData?.productJSON?.risk?.immigration_data?.no_of_workers;

    if (balanceWorkers === 0) {
      this.isQuoteExpired = true;
      this.spinner.hide('loadingSpinner');

      this.openQuoteModal(
        'No Workers Allowed',
        `This quotation is no longer valid as it allows <b>zero workers</b>. `
      );
      return true;
    }

    if (this.ifWorkersExceeded(no_of_workers, balanceWorkers)) {
      this.isWorkersExceeded = true;
      this.spinner.hide('loadingSpinner');

      this.openQuoteModal(
        'Balanced workers exceeded',
        `The current number of workers exceeds the balanced workers limit. ` +
          `Please proceed with a reduced count of <b>${balanceWorkers}</b> or fewer.`
      );
      return true;
    }

    return false;
  }

  private handleQuoteExpirationCheck(): boolean {
    const policyFromDate = new Date(this.quoteData.policyFrom);
    const currentDate = new Date();
    policyFromDate.setHours(23, 59, 59, 999);

    if (currentDate > policyFromDate) {
      const formattedDate = this.datePipe.transform(
        policyFromDate,
        'dd-MM-yyyy hh:mm a'
      );
      const overdueTime = this.calculateOverdueTime(
        policyFromDate,
        currentDate,
        'Popup'
      );

      this.isQuoteExpired = true;
      this.spinner.hide('loadingSpinner');

      this.openQuoteModal(
        'Quotation Expiration Notice',
        `This quotation is no longer valid. The deadline for proceeding was <b>${formattedDate}</b>.<br><br>${overdueTime}`
      );
      return true; // block the rest of the flow
    }

    return false;
  }
  private openQuoteModal(title: string, message: string): void {
    const modalRef = this.modalService.open(QuoteExpiredComponent, {
      centered: true,
    });
    modalRef.componentInstance.message1 = title;
    modalRef.componentInstance.message2 = message;
  }

  private transformPolicyDates() {
    this.quoteData.policyFrom = this.datePipe.transform(
      this.quoteData.policyFrom,
      'MMM d, y hh:mm:ss a'
    );
    this.quoteData.policyTo = this.datePipe.transform(
      this.quoteData.policyTo,
      'MMM d, y hh:mm:ss a'
    );
  }
  private setStorage() {
    this.storageService.setSession('token', this.token);
    sessionStorage.setItem('btoken', this.btoken);
    this.storageService.setSession('quoteData', this.quoteData);
  }
  loadQuoteService = () => {
    this.spinner.show('loadingSpinner');
    this.immigrationService.loadQuote(this.id, this.token).subscribe({
      next: (response: any) => {
        this.quoteData = response;
        this.transformPolicyDates();
        this.setStorage();
        if (this.quoteData.productJSON.risk.immigration_data.workers) {
          this.workers = this.quoteData.productJSON.risk.immigration_data.workers;
        } else {
          this.spinner.hide('loadingSpinner');
          return;
        }
        this.loadExistingData();
        if (this.quoteData?.productJSON?.risk?.isLinkGenerated) {
          const fullUrl = window.location.href;

          if (fullUrl.includes('#')) {
            const fullHash = window.location.hash;
            const [path, query] = fullHash.replace('#', '').split('?');

            if (path.includes('quotation') && query) {
              const newPath = path.replace('quotation', 'payment');
              window.location.hash = `/${newPath}?${query}`;
            }
          } else {
            const url = new URL(fullUrl);
            const pathname = url.pathname;
            const searchParams = url.search;

            if (pathname.includes('quotation')) {
              const newPath = pathname.replace('quotation', 'payment');
              const newUrl = `${url.origin}${newPath}${searchParams}`;
              window.location.href = newUrl;
            }
          }
        }

        this.spinner.hide('loadingSpinner');
      },
      error: (error: any) => {
        this.spinner.hide('loadingSpinner');
      },
    });
  };
  loadExistingData() {
    this.numberOfWorkers =
      this.quoteData.productJSON.risk.immigration_data.no_of_workers;
    this.totalPremium = this.quoteData.productJSON.risk.premium.payable_premium;
    if (this.quoteData.productJSON.risk.immigration_data.selected_bond_period == 14) {
      this.premiumPerWorker =
        this.quoteData.productJSON.risk.immigration_options.premiumData.fourteenMonthPremium;
    } else {
      this.premiumPerWorker =
        this.quoteData.productJSON.risk.immigration_options.premiumData.twentySixMonthPremium;
    }

    this.companyData =
      this.quoteData.productJSON.risk.immigration_options.AcraData.CompanyData;
    this.address = this.companyData.registeredAddress;
    //console.log("this.address",this.address)
    this.ssicList = Array.isArray(this.companyData.ssic)
      ? this.companyData.ssic
      : [this.companyData.ssic];
    const rawName =
      this.quoteData.productJSON.risk.immigration_options.AcraData.CompanyData.name;
    this.insuredEmployerName = this.decodeHTMLEntities(rawName);
    this.email = this.quoteData.productJSON.risk.immigration_data.email;
    this.mobileNumber = this.quoteData.productJSON.risk.immigration_data.mobile;
    this.uenNumber = this.quoteData.productJSON.risk.uen;
    this.cpfNumber = this.quoteData.productJSON.risk.immigration_data.cpf_no;
    this.quotationNumber = this.quoteData.quoteNo;
    this.totalWorkers =
      this.quoteData.productJSON.risk.immigration_data.no_of_workers;
    // this.address = this.quoteData.
    this.fromDate = this.datePipe.transform(
      this.quoteData.policyFrom,
      'dd/MM/YYYY'
    );
    this.toDate = this.datePipe.transform(
      this.quoteData.policyTo,
      'dd/MM/YYYY'
    );
    if (this.quoteData.productJSON.risk.immigration_data.workers) {
      this.workers = this.quoteData.productJSON.risk.immigration_data.workers;
    } else {
      this.spinner.show('loadingSpinner');
    }

    if (!Array.isArray(this.workers)) {
      this.workers = [this.workers];
    }
  }
  onBack() {
    this.router.navigate(['policy']);
  }

  onExit() {
    this.storageService.clear();
    window.close();
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
  onProceed() {
    this.spinner.show('loadingSpinner');
    this.quoteData = this.quoteData;
    this.immigrationService.requestQuote(this.quoteData).subscribe({
      next: (response: any) => {
        this.quoteData = response;

        if (this.handleWorkerBalanceCheck()) {
          return;
        }

        // Stop if quote is expired
        if (this.handleQuoteExpirationCheck()) {
          return;
        }

        this.customerScreenCheck(this.quoteData);
        this.storageService.setSession('quoteData', this.quoteData);
        this.router.navigate(['payment']);
        this.spinner.hide('loadingSpinner');
      },

      error: (error: any) => {
        this.spinner.hide('loadingSpinner');
      },
    });
  }

  onPrint() {
    this.spinner.show('loadingSpinner');
    this.immigrationService.printQuoteDocument(
      this.quoteData.id,
      this.quoteData.accessToken
    ).subscribe({
      next: (response: any) => {
        this.base64String = response.quote;
        this.pdfName = 'Quotation_' + this.quoteData.quoteNo + '.pdf';

        let binary = atob(this.base64String);
        let len = binary.length;
        let buffer = new ArrayBuffer(len);
        let view = new Uint8Array(buffer);
        for (let i = 0; i < len; i++) {
          view[i] = binary.charCodeAt(i);
        }

        let blob = new Blob([view], { type: 'application/pdf' });

        saveAs(blob, this.pdfName);

        this.quotationString = response.quote;
        this.quotationFileName = 'Quotation_' + this.quoteData.quoteNo + '.pdf';

        this.spinner.hide('loadingSpinner');
      },

      error: (error: any) => {
        this.spinner.hide('loadingSpinner');
      },
    });
  }

  customerScreenCheck(quoteData: any) {
    this.spinner.show('loadingSpinner');

    const risk = quoteData?.productJSON?.risk;
    const custScreenFlag = risk?.custScreenFlag;
    const customerScreenObj = risk?.customerScreenV2?.customerScreenObj;

    this.flag = Array.isArray(custScreenFlag)
      ? custScreenFlag[0]
      : custScreenFlag;

    if (this.flag === 'STOP' || this.flag === 'HOLD') {
      this.showSanctionModal();
      this.spinner.hide('loadingSpinner');
      return;
    }

    if (customerScreenObj) {
      if (Array.isArray(customerScreenObj)) {
        for (const screen of customerScreenObj) {
          if (this.needsSanction(screen)) {
            this.showSanctionModal();
            this.spinner.hide();
            return;
          }
        }
      } else {
        if (this.needsSanction(customerScreenObj)) {
          this.showSanctionModal();
          this.spinner.hide();
          return;
        }
      }
    }

    this.spinner.hide();
  }

  private showSanctionModal() {
    const modalRef = this.modalService.open(ThankyouPopupComponent, {
      size: 'lg',
      backdrop: 'static',
    });
    modalRef.componentInstance.msg = 'sanction';
  }

  private needsSanction(screen: any): boolean {
    return (
      screen?.['@flag'] !== 'GO' &&
      (screen?.['@sanctionBy'] === '' || screen?.['@sanctionDateTime'] === '')
    );
  }
}
