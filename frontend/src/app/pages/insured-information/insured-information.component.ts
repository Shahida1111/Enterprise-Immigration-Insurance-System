import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SessionStorageService } from '../../services/session-storage.service';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { immigrationService } from '../../services/immigration.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { encode } from 'entities';
@Component({
  selector: 'app-insured-information',
  templateUrl: './insured-information.component.html',
  styleUrls: ['./insured-information.component.scss'],
})
export class InsuredInformationComponent {
  natureOfBusiness: string = '';

  totalPremium: number = 0;
  premiumPerWorker: number = 0;
  quoteData: any;
  companyData: any;
  address: any;
  insuredForm: FormGroup;
  ssicList: any[] = [];
  isSubmitted: boolean = false;
  descriptionsString: string = '';
  constructor(
    private router: Router,
    private storageService: SessionStorageService,
    private formBuilder: FormBuilder,
    private immigrationService: immigrationService,

    private spinner: NgxSpinnerService
  ) {
    this.insuredForm = this.formBuilder.group<any>({
      email: new FormControl('', [Validators.required, Validators.email]),
      mobile: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
      ]),
    });
  }
  ngOnInit() {
    if (this.storageService.getSession('quoteData') != undefined) {
      this.quoteData = this.storageService.getSession('quoteData');
      this.loadInitialViewData();
    } else {
      console.error('no session');
    }
  }
  loadInitialViewData() {
    this.companyData =
      this.quoteData.productJSON.risk.immigration_options.AcraData.CompanyData;
    this.totalPremium = this.quoteData.productJSON.risk.premium.payable_premium;
    if (this.quoteData.productJSON.risk.immigration_data.selected_bond_period == 14) {
      this.premiumPerWorker =
        this.quoteData.productJSON.risk.immigration_options.premiumData.fourteenMonthPremium;
    } else {
      this.premiumPerWorker =
        this.quoteData.productJSON.risk.immigration_options.premiumData.twentySixMonthPremium;
    }

    this.address = this.companyData.registeredAddress;
    this.ssicList = Array.isArray(this.companyData.ssic)
      ? this.companyData.ssic
      : [this.companyData.ssic];

    this.descriptionsString = this.ssicList[0]?.description;

    const formData = {
      email: this.quoteData.productJSON.risk.immigration_data.email,

      mobile: this.quoteData.productJSON.risk.immigration_data.mobile,
    };
    //console.log('formData',formData);
    //* Update Existing data in UI
    this.insuredForm.patchValue(formData);
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
    this.isSubmitted = true;
    this.quoteData.productJSON.risk.immigration_data.email =
      this.insuredForm.value.email;
    this.quoteData.productJSON.risk.immigration_data.mobile =
      this.insuredForm.value.mobile;
    this.quoteData.productJSON.risk.immigration_data.nobArr = this.descriptionsString;

    if (this.insuredForm.valid) {
      this.spinner.show('loadingSpinner');
      // this.quoteData = this.sanitizeAmpersands( this.quoteData);
      this.quoteData = this.quoteData;
      this.immigrationService.requestQuote(this.quoteData).subscribe({
        next: (response: any) => {
          this.quoteData = response;

          this.storageService.setSession('quoteData', this.quoteData);

          this.spinner.hide('loadingSpinner');
          this.router.navigate(['policy']);
        },
        error: (error: any) => {
          this.spinner.hide('loadingSpinner');
        },
      });
    }
  }

  onBack() {
    this.router.navigate(['add-employer']);
  }
}
