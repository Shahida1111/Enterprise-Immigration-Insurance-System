import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { SessionStorageService } from 'src/app/services/session-storage.service';
 import { immigrationService } from 'src/app/services/immigration.service';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { format, parseISO } from 'date-fns';
import { UTCDate } from '@date-fns/utc';

import {FormBuilder,FormControl,FormGroup,Validators,} from '@angular/forms';

@Component({
  selector: 'app-pay-link',
  templateUrl: './pay-link.component.html',
  styleUrls: ['./pay-link.component.scss']
})
export class PayLinkComponent {
  @Input() payUrl: string = '';
  quoteData: any;
  emailAddress1: string = '';
  interpolatedTemplate: any;
  originalDate: any;
  customerSelectedDate: any;
  isSubmitted: boolean = false;
  quotationNumber:string = '';
  emailForm: FormGroup;
  constructor(
    public modal: NgbActiveModal,
     private immigrationService: immigrationService,
    private router: Router,
    private storageService: SessionStorageService,
    private spinner: NgxSpinnerService,
   private datePipe: DatePipe,
    private formBuilder: FormBuilder,
  ) {
    this.emailForm = this.formBuilder.group<any>({

      email: new FormControl('', [Validators.required, Validators.email]),

    });

  }
  
  ngOnInit() {
    if (this.storageService.getSession('quoteData') != undefined) {
      this.quoteData = this.storageService.getSession('quoteData');
      this.quotationNumber=this.quoteData.quoteNo;
      

    }
  }

  htmlTepmlate = () => {
   
    const notificationTemplate =
 
      `
      <p>Dear {{name}},</p>
       <p>Thank you for buying JKH insurance policy. Please use below mentioned link to make the payment for your policy.<br>
           Policy Holder - {{name}}<br>
            Quotation No.  - {{quoteNo}}<br>
      Payment Link - <a href="${this.payUrl}">${this.payUrl}</a></p>
      <p>Once the payment is done, we will send you the policy documents via email after successful submission to Ministry of Manpower.</p>
      <p>Yours sincerely,<br>JKH Singapore.<br><br><b>This is an automated email. Please do not reply to this email.</b></p>
    `;
    this.interpolatedTemplate = this.interpolate(notificationTemplate);
  };

  interpolate(template: string): string {
    
    template = template.replace(
      '{{name}}',
      this.quoteData.productJSON.risk.immigration_options.AcraData.CompanyData.name
    );
    template = template.replace(
      '{{name}}',
      this.quoteData.productJSON.risk.immigration_options.AcraData.CompanyData.name
    );
    template = template.replace('{{quoteNo}}', this.quoteData.quoteNo);

    return template;
  }

  sendEmail() {
    this.isSubmitted = true;
    if (this.emailForm.valid) {
      let currentDate = new Date();
      let dateTimeString = this.datePipe.transform(currentDate, 'YYYY-MM-dd') + ' ';

      this.customerSelectedDate = this.datePipe.transform(
        currentDate,
        'MM-dd-yyyy'
      );
      this.originalDate = parseISO(dateTimeString);
      const zonedDate = new UTCDate(this.originalDate).toString();
      const formattedDate = format(zonedDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");

      let meetingDateTime = formattedDate;
      

      this.htmlTepmlate();
      this.spinner.show("loadingSpinner");
      this.immigrationService
        .sendUrl(
          this.quoteData.quoteNo,
          this.quoteData.accessToken,
          'Payment Link ' + this.quoteData.quoteNo,
          this.emailForm.value.email,
          this.interpolatedTemplate,
          meetingDateTime
        )
        .subscribe({
          next: (response: any) => {

            this.spinner.hide("loadingSpinner");
          },
          error: (error: any) => {
            this.spinner.hide("loadingSpinner");
            
          },
        });

      }

  }

  copy() {
    this.spinner.show("loadingSpinner");
    navigator.clipboard.writeText(this.payUrl);
    setTimeout(() => {this.spinner.hide("loadingSpinner");}, 1000);
  }
  exit(){
    this.modal.dismiss('Cross click');
  }
}
