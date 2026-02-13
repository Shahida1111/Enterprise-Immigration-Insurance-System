import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { immigrationService } from '../../services/immigration.service';
import { SessionStorageService } from '../../services/session-storage.service'
import { StmgService } from '../../services/stmg.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SsicCodeExcludedComponent } from 'src/app/popups/ssic-code-excluded/ssic-code-excluded.component';
import { encode } from 'entities';
import { QuotationSubmitComponent } from 'src/app/popups/quotation-submit/quotation-submit.component';
@Component({
  selector: 'app-add-employer',
  templateUrl: './add-employer.component.html',
  styleUrls: ['./add-employer.component.scss']
})
export class AddEmployerComponent {
  BondPeriodList: string[] = ["14 Months", "26 Months"];
  bondPeriodSelected: number = 26;
  defaultBondPeriod: string = "26 Months";
  bondPeriodMapping: { [key: string]: number } = {
    "14 Months": 14,
    "26 Months": 26
  };

  insuredEmployerList: any;
  uenNumber: string = '';
  goForward = false
  totalPremium: number = 0;
  premiumPerWorker: number = 180;
  showOptions: boolean = false;
  quoteData: any;
  listcounter: number = 0
  promo_code: string='';
  promo_id: string='';
  filteredOptions: string[] = [];
  insuredEmployer: string = '';
  pax: number | null = null;
  balanceedWorkersLeft: string = ''
  premiumFor14Months: string = '';
  premiumFor26Months: string = '';
  termsList: any;
  uwRemarks: string = '';
  uenSuccess: boolean = false;
  isSubmit: boolean = false;
  uenSubmit: boolean = false;
  errMsg: string = '';
  companyData: any;
  deregistereddAddress: any;
  emptyAdd: boolean = false;
  isPopupVisible: boolean = false;




  // For error masseges
  isError: boolean = false
  exceedTotalAccumulation: boolean = false
  excludedSSIC: boolean = false
  underwriterReferralSSIC: boolean = false
  apiFailed: boolean = false

  constructor(
    private immigrationService: immigrationService,
    private storageService: SessionStorageService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private stmgService: StmgService,
    private modal: NgbModal,
  ) { }

  ngOnInit() {


    setTimeout(() => {

    }, 100000);
    if (this.storageService.getSession('quoteData') != undefined) {
      this.quoteData = this.storageService.getSession('quoteData');
      this.loadInitialViewData()
    }
    else {
      console.error('no session');
    }
  }

  //* load initiate quote data
  loadInitialViewData = () => {

    const bondPeriodValue = this.quoteData.productJSON.risk.immigration_data?.selected_bond_period
      ;


    const bondPeriodText = this.getBondPeriodText(bondPeriodValue);
    this.defaultBondPeriod = bondPeriodText ? bondPeriodText : "26 Months";
    this.bondPeriodSelected = this.bondPeriodMapping[this.defaultBondPeriod];
    this.uenNumber = this.quoteData.productJSON.risk.uen;
    this.populateCompanyData();
    this.premiumFor14Months = this.quoteData?.productJSON?.risk?.immigration_options?.premiumData?.fourteenMonthPremium;
    this.premiumFor26Months = this.quoteData?.productJSON?.risk?.immigration_options?.premiumData?.twentySixMonthPremium;


    this.balanceedWorkersLeft = this.quoteData?.productJSON?.risk?.immigration_options?.balanceWorkers;
    this.uwRemarks = this.quoteData?.productJSON?.risk?.immigration_options?.list.uw_remarks;

    this.termsList = this.quoteData?.productJSON?.risk?.immigration_options?.list.terms;
    this.checkForErrors();

  };
  getBondPeriodText(value: number): string | undefined {
    return Object.keys(this.bondPeriodMapping).find(key => this.bondPeriodMapping[key] === value);
  }
  populateCompanyData() {
    if (this.quoteData.productJSON.risk.immigration_options.AcraData.CompanyData) {
      this.balanceedWorkersLeft = this.quoteData?.productJSON?.risk?.immigration_options?.balanceWorkers;
      this.uenNumber = this.quoteData?.productJSON?.risk?.immigration_options?.AcraData?.CompanyData?.uen;
      this.uenSuccess = true;
      this.insuredEmployer = this.quoteData?.productJSON?.risk?.immigration_options?.AcraData?.CompanyData.name;

      if (this.quoteData.productJSON.risk.immigration_data?.no_of_workers != undefined) {
        this.pax = this.quoteData?.productJSON?.risk?.immigration_options?.no_of_workers;
      }

    }
  }
  // Change Bond Period
  changBondPeriod = (data: any) => {
    const selectedValue = data.target.value;
    this.bondPeriodSelected = this.bondPeriodMapping[selectedValue];
  };

  selectEmployer = (data: any) => {
    this.uenNumber = data.toUpperCase();
    this.uenSuccess = false;
    this.underwriterReferralSSIC = false;
    this.excludedSSIC = false;
    this.isError = false;
  }

  onContinue = () => {
    this.goForward = true;


  };

  onCancel = () => {
    this.goForward = false;

  }


  get formattedPremiumFor14Months(): string {
    return `S$ ${this.premiumFor14Months}.00`;
  }

  get formattedPremiumFor26Months(): string {
    return `S$ ${this.premiumFor26Months}.00`;
  }

  showAddressNotFoundModal(): void {
    this.isPopupVisible = true;
  const modalRef = this.modal.open(QuotationSubmitComponent, {
    size: 'md',
    backdrop: 'static',
    windowClass: 'no-fade'
  });

  modalRef.componentInstance.title = "Address Not Found";
  modalRef.componentInstance.message = "This UEN does not include a registered address. Unable to proceed further.";
  modalRef.componentInstance.showGoBack = false;
  modalRef.componentInstance.showExit = true;
}

  onProceed() {
    this.uenSubmit = true;
    if (this.uenNumber && this.uenNumber.length >= 9) {
      this.quoteData.productJSON.risk.immigration_options.balanceWorkers = '';
      this.quoteData.productJSON.risk.immigration_options.AcraData = {};
      this.quoteData.productJSON.risk.step = 1;
      this.quoteData.productJSON.risk.uen = this.uenNumber;
      this.spinner.show("loadingSpinner");;
      // this.quoteData = this.sanitizeAmpersands( this.quoteData);
      this.quoteData = this.quoteData;
      this.immigrationService.requestQuote(this.quoteData).subscribe({
        next: (response: any) => {
          this.quoteData = response;
          this.storageService.setSession('quoteData', this.quoteData);

          this.deregistereddAddress = this.quoteData?.productJSON?.risk?.immigration_options?.AcraData?.CompanyData?.registeredAddress;
          if (!this.deregistereddAddress && this.quoteData.productJSON.risk["@error_message"] !== 'API Retrieval is unsuccessful. Please try again.') {
            this.emptyAdd = true;
            this.showAddressNotFoundModal();
          }

          if (this.quoteData.productJSON.risk.immigration_options.AcraData.CompanyData) {
            this.uenSuccess = true;
            this.isError = false;
            this.stmgService.updateisUenSuccess(this.uenSuccess);
            this.isUenSuccessStmg();
            this.pax = null;
            this.checkForErrors();
            this.spinner.hide("loadingSpinner");;
          }
          else {
            this.checkForErrors();
            this.spinner.hide("loadingSpinner");;

          }

        },
        error: (error: any) => {
          this.spinner.hide("loadingSpinner");;

        },
      });

    }


  }
  ssicExcludeCheck() {
    if (this.quoteData.productJSON.risk.immigration_options.AcraData.CompanyData.ssic.message === "exclude") {

      const modalRef = this.modal.open(SsicCodeExcludedComponent, {
        size: 'lg',
      });
      modalRef.componentInstance.modalSize = 'lg';
    }
  }
  uenFalse() {
    this.isError = true;
  }
  onExit() {
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
  onNext() {
    this.isSubmit = true;
    if (!this.quoteData.productJSON.risk.immigration_data) {
      this.quoteData.productJSON.risk.immigration_data = {};
    }

    this.quoteData.productJSON.risk.immigration_data.selected_bond_period = this.bondPeriodSelected;
    this.quoteData.productJSON.risk.immigration_data.no_of_workers = this.pax;
    this.quoteData =  this.quoteData ;
    if (this.pax && this.pax > 0) {
      this.spinner.show("loadingSpinner");
      this.immigrationService.requestQuote(this.quoteData).subscribe({
        next: (response: any) => {
          this.quoteData = response;

          this.storageService.setSession('quoteData', this.quoteData);

          this.spinner.hide("loadingSpinner");

          if (this.quoteData.productJSON.risk["@error_message"]) {

            this.checkForErrors();

          }
          else {
            this.router.navigate(['insured-information']);
          }
        },
        error: (error: any) => {
          this.spinner.hide("loadingSpinner");

        },
      });
    }


  }
  isUenSuccessStmg = () => {
    this.stmgService.isUenSuccessObs.subscribe((status: any) => {

      if (status) {

        this.quoteData = this.storageService.getSession('quoteData');
        this.pax = this.quoteData.productJSON.risk.immigration_data?.no_of_workers;

        if (this.quoteData.productJSON.risk["@error_message"]) {

          this.checkForErrors();

        } else {
          this.populateCompanyData();
        }

      }
    });
  };

  isCheckUndefinedField(){
    let errorMessage = this.quoteData.productJSON.risk["@error_message"];
    const companyData = this.quoteData?.productJSON?.risk?.immigration_options?.AcraData?.CompanyData;
    const companyData2 = this.quoteData?.productJSON?.risk?.immigration_options?.AcraData?.CompanyData2;

    const isCheckUndefinedField = (companyData.ssic === undefined || companyData.registeredAddress === undefined) && errorMessage ||
    (companyData2 && (companyData2.secondarySSIC === undefined || companyData2.primarySSIC === undefined));

    return isCheckUndefinedField;
  }

  isBusinessActivitiesExcluded(){
    const companyData = this.quoteData?.productJSON?.risk?.immigration_options?.AcraData?.CompanyData;
    const companyData2 = this.quoteData?.productJSON?.risk?.immigration_options?.AcraData?.CompanyData2;

    const isBusinessActivitiesExcluded = companyData.ssic?.message === 'exclude' ||
    (companyData2 && (companyData2.secondarySSIC?.message === 'exclude' || companyData2.primarySSIC?.message === 'exclude'))

    return isBusinessActivitiesExcluded;
  }

  isCheckReferredBusinessActivities(){
    const companyData = this.quoteData?.productJSON?.risk?.immigration_options?.AcraData?.CompanyData;
    const companyData2 = this.quoteData?.productJSON?.risk?.immigration_options?.AcraData?.CompanyData2;

    const isCheckReferredBusinessActivities = companyData.ssic?.message === 'uw' ||
    (companyData2 && (companyData2.secondarySSIC?.message === 'uw' || companyData2.primarySSIC?.message === 'uw'))

    return isCheckReferredBusinessActivities;
  }

  checkForErrors() {

    let errorMessage = this.quoteData.productJSON.risk["@error_message"];
    const isCheckUndefinedField = this.isCheckUndefinedField();
    const isBusinessActivitiesExcluded = this.isBusinessActivitiesExcluded();
    const isCheckReferredBusinessActivities = this.isCheckReferredBusinessActivities();

    // Check for undefined fields and set the error message accordingly
    if (isCheckUndefinedField) {
      errorMessage = 'API Retrieval is unsuccessful. Please try again.';
    }
    // Check the ssic.message field in CompanyData and CompanyData2
    else if (isBusinessActivitiesExcluded) {
      errorMessage = 'Business activities are excluded activities.';
    }
    else if (isCheckReferredBusinessActivities) {
      errorMessage = 'Referred business activities, please contact your respective account servicer';
    }

    // Handle the error message
    if (errorMessage && errorMessage.trim() !== '') {
      switch (errorMessage) {
        case 'API Retrieval is unsuccessful. Please try again.':
          this.isError = true;
          this.uenSuccess = false;
          this.errMsg = errorMessage;
          break;
        case 'Business activities are excluded activities.':
          this.isError = true;
          this.excludedSSIC = true;
          this.errMsg = errorMessage;
          //console.log("Error", this.excludedSSIC )
          break;
        case 'Referred business activities, please contact your respective account servicer':
          this.isError = true;
          this.underwriterReferralSSIC = true;
          this.errMsg = errorMessage;
          break;
        case 'Exceed total accumulation for this insured employer, please contact your servicer.':
          this.isError = true;
          this.exceedTotalAccumulation = true;
          this.errMsg = errorMessage;
          break;
        // Add more cases as needed
        default:

          break;
      }
    }

  }
  onPrevious() {
    this.isError = false;
    this.exceedTotalAccumulation = false;
    this.pax = null;
    this.quoteData.productJSON.risk.immigration_data.no_of_workers = 0;
  }
}
