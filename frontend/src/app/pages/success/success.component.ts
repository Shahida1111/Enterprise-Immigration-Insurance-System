import { Component, Injectable } from '@angular/core';
import { SessionStorageService } from 'src/app/services/session-storage.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { immigrationService } from '../../services/immigration.service';
import { DatePipe } from '@angular/common';
import { NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { saveAs } from 'file-saver';
import { ActivatedRoute, Router } from '@angular/router';

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
      ? date.day.toString().padStart(2, '0') + this.DELIMITER + date.month.toString().padStart(2, '0') + this.DELIMITER + date.year
      : '';
  }
}
@Component({
  selector: 'app-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.scss'],
  providers: [{ provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter }],
})
export class SuccessComponent {
  policyHolder: string = ""
  policyNumber: string = ""
  fromDate: any = ''
  toDate: any = ''
  amount: number = 0;
  quoteData: any;

  base64Doc: any = ' ';
  docName: any = ' ';
  policyDoc: any = ' ';
  PolicydocName: any = ' ';
  email: string = ""
  constructor(

    private storageService: SessionStorageService,
    private datePipe: DatePipe,
    private spinner: NgxSpinnerService,
    private immigrationService: immigrationService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    if (this.storageService.getSession('quoteData') != undefined) {
      this.quoteData = this.storageService.getSession('quoteData');
      const rawName = this.quoteData.productJSON.risk.immigration_options.AcraData.CompanyData.name;
      this.policyHolder = this.decodeHTMLEntities(rawName);
        if (this.quoteData.policyNo === "null") {
          this.router.navigate(['/paymentError'], {
            queryParams: { isPermPolicyNull: 'null' }
          });
          return;
        }

      this.amount = this.quoteData.productJSON.risk.premium.payable_premium;
      this.policyNumber = this.quoteData.policyNo;
      this.fromDate = this.datePipe.transform(
        this.quoteData.policyFrom,
        'dd/MM/YYYY'
      )
      this.toDate = this.datePipe.transform(
        this.quoteData.policyTo,
        'dd/MM/YYYY'
      )
      console.log("Policy Number" + this.policyNumber)
    }
  }
  onClose() {
    window.location.href = 'https://www.google.com';
    this.storageService.clear();

  }
    decodeHTMLEntities(value: string): string {
    const txt = document.createElement('textarea');
    txt.innerHTML = value;
    return txt.value;
  }
  onDownload() {
    this.spinner.show("loadingSpinner");

    if (this.quoteData.notifyJSON.notify.email.attach != undefined && Array.isArray(this.quoteData.notifyJSON.notify.email.attach)) {
      this.spinner.show("loadingSpinner");

      this.quoteData.notifyJSON.notify.email.attach.forEach((attachment: any) => {
        let template = attachment['@template'];

        this.immigrationService.printDocument(this.quoteData.policyNo, this.quoteData.policyAccessToken, template).subscribe({
          next: (response: any) => {
            this.base64Doc = response.document;
            this.docName = response.documentFileName;

            let binary = atob(this.base64Doc);
            let len = binary.length;
            let buffer = new ArrayBuffer(len);
            let view = new Uint8Array(buffer);
            for (let i = 0; i < len; i++) {
              view[i] = binary.charCodeAt(i);
            }
            let blob = new Blob([view], { type: 'application/pdf' });

            saveAs(blob, this.docName);
            this.policyDoc = response.document;
            this.PolicydocName = response.documentFileName;

            this.spinner.hide("loadingSpinner");
          },
          error: (error: any) => {
            this.spinner.hide("loadingSpinner");

          },
        });


      })

    }



  }
  onEmail() {

    const accessToken = this.quoteData.policyAccessToken;
    const policyNo = this.quoteData.policyNo;

    if (this.email != "") {
      this.spinner.show();
      this.immigrationService
        .forwardEmails(this.email, policyNo, accessToken)
        .subscribe({
          next: () => {
            this.spinner.hide();
          },
          error: () => {
            this.spinner.hide();
          },
        });


    }


  }
}
