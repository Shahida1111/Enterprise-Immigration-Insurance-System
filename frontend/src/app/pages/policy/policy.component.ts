import { DatePipe } from '@angular/common';
import { Component, Injectable, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { immigrationService } from 'src/app/services/immigration.service';
import { SessionStorageService } from 'src/app/services/session-storage.service';
import { NgbDateParserFormatter, NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { StmgService } from '../../services/stmg.service';
import { SessionPopupComponent } from 'src/app/popups/session-popup/session-popup.component';
import { catchError, throwError, firstValueFrom } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AgreeRequiredComponent } from 'src/app/popups/agree-required/agree-required.component';
import { QuotationSubmitComponent } from 'src/app/popups/quotation-submit/quotation-submit.component';
import { encode } from 'entities';
export interface Worker {
  fin: string;
  name: string;
  nationality: string;
}

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
  selector: 'app-policy',
  templateUrl: './policy.component.html',
  styleUrls: ['./policy.component.scss'],
  providers: [
    { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter },
  ],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class PolicyComponent {
  indemnityType: string = 'Included';
  btoken: any = '';
  fromDateModel: any = '';
  toDateModel: any = '';
  supportingDocumentList: any = [];
  cpf_no: any = '';
  totalWorkers: number = 3;
  workers: Worker[] = [];
  nationalityList: any[] = [];
  remarks: string = '';
  totalPremium: number = 0;
  premiumPerWorker: number = 0;
  quoteData: any;
  numberOfWorkers: number = 0;
  docsLimit: boolean = false;
  fromDate: any = '';
  files: {
    fileName: string;
    base64String: string;
    id: string;
    name: string;
  }[] = [];
  autofilledFiles: { name: string }[] = [];
  isNRICValid: boolean = false;

  maxDate: NgbDateStruct;
  minDate: NgbDateStruct;
  toDateMax: NgbDateStruct;
  toDateMin: NgbDateStruct;
  claimDateMax: NgbDateStruct;
  claimDateMin: NgbDateStruct;
  policyForm: FormGroup;
  isSubmitted: boolean = false;
  dateDifference: number = 0;

  fileCountMatch: boolean = false;
  isDeleted: boolean = false;
  showWorkerNationalityDropdown: boolean[] = [];
  dropDown_worker: number[] = [];
  worker_invalidNationality: boolean[] = [];

  nationalityListSearchResults: any[] = [];

  workerNRICValidationStatus: boolean[] = [];

  workersList: any[] = [];
  uploadedFileName: string = '';
  constructor(
    private router: Router,
    private storageService: SessionStorageService,
    private datePipe: DatePipe,
    private immigrationService: immigrationService,
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private modal: NgbModal,
    private changeDetectorRef: ChangeDetectorRef,
    private stmgService: StmgService
  ) {
    const currentDate = new Date();
    const maxDate = new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000);

    this.maxDate = {
      year: maxDate.getFullYear(),
      month: maxDate.getMonth() + 1,
      day: maxDate.getDate(),
    };

    this.minDate = {
      year: currentDate.getFullYear(),
      month: currentDate.getMonth() + 1,
      day: currentDate.getDate(),
    };

    this.toDateMax = {
      year: currentDate.getFullYear(),
      month: currentDate.getMonth() + 1,
      day: currentDate.getDate(),
    };

    this.toDateMin = {
      year: currentDate.getFullYear(),
      month: currentDate.getMonth() + 1,
      day: currentDate.getDate(),
    };

    this.claimDateMax = {
      year: currentDate.getFullYear(),
      month: currentDate.getMonth() + 1,
      day: currentDate.getDate(),
    };

    this.claimDateMin = {
      year: currentDate.getFullYear() - 3,
      month: currentDate.getMonth() + 1,
      day: currentDate.getDate(),
    };

    this.policyForm = this.formBuilder.group<any>({
      fromDate: new FormControl('', [Validators.required]),
      toDate: new FormControl('', [Validators.required]),
      cpf_no: new FormControl('', [Validators.required]),
      workerArr: this.formBuilder.array([]),
    });
    const adultFormArray = this.policyForm.get('workerArr') as FormArray;
    for (let i = 0; i < adultFormArray.length; i++) {
      this.showWorkerNationalityDropdown[i] = false;
      this.dropDown_worker[i] = -1;
    }
  }

  ngOnInit() {
    if (this.storageService.getSession('quoteData') != undefined) {
      this.quoteData = this.storageService.getSession('quoteData');
      this.numberOfWorkers =
        this.quoteData.productJSON.risk.immigration_data.no_of_workers;
      this.loadExistingData();

      this.totalPremium =
        this.quoteData.productJSON.risk.premium.payable_premium;
      if (
        this.quoteData.productJSON.risk.immigration_data.selected_bond_period == 14
      ) {
        this.premiumPerWorker =
          this.quoteData.productJSON.risk.immigration_options.premiumData.fourteenMonthPremium;
      } else {
        this.premiumPerWorker =
          this.quoteData.productJSON.risk.immigration_options.premiumData.twentySixMonthPremium;
      }

      //console.log("this.numberOfWorkers", this.numberOfWorkers)
    } else {
      console.error('no session');
    }
    if (sessionStorage.getItem('btoken') != undefined) {
      this.btoken = sessionStorage.getItem('btoken');
      //console.log("this.btoken", sessionStorage.getItem("btoken"))
    } else {
      console.log('no bttoken');
    }
    if (sessionStorage.getItem('isLoaded')) {
      this.workersList = Array.isArray(
        this.quoteData.productJSON.risk.immigration_data.files
      )
        ? this.quoteData.productJSON.risk.immigration_data.files
        : [this.quoteData.productJSON.risk.immigration_data.files];
      // this.downloadFile();
    }

    this.nationalityList =
      this.quoteData.productJSON.risk.immigration_options.list.nationalityList.nationality;

    this.loadBToken();
    this.loadFilesIfNeeded();
  }

  loadExistingData() {
    const savedFiles = this.storageService.getSession('files');
    if (this.storageService.getSession('autofilledFiles')) {
      this.autofilledFiles = JSON.parse(
        this.storageService.getSession('autofilledFiles')
      );
    }
    if (savedFiles) {
      this.workersList = savedFiles;
      this.adjustFilesArray();
    }
    if (this.quoteData.productJSON.risk.immigration_data.workers) {
      this.fromDateChange(new Date(this.quoteData.policyFrom));
      //* bind data to the form
      const formData = {
        fromDate: new Date(this.quoteData.policyFrom),
        // toDate: new Date(),
        cpf_no: this.quoteData.productJSON.risk.immigration_data.cpf_no,
      };

      this.policyForm.patchValue(formData);

      let existingData: any = [];

      const workerArray = this.policyForm.get('workerArr') as FormArray;
      if (Array.isArray(this.quoteData.productJSON.risk.immigration_data.workers)) {
        existingData = this.quoteData.productJSON.risk.immigration_data.workers;
      } else {
        existingData = [];
        existingData.push(this.quoteData.productJSON.risk.immigration_data.workers);
      }
      let workerCount =
        this.quoteData.productJSON.risk.immigration_data.no_of_workers;

      existingData
        .slice(0, Math.min(workerCount, workerCount))
        .forEach((data: any) => {
          const workerFormGroup = this.formBuilder.group({
            workerName: [data.name, [Validators.required]],
            workerFin: [data.fin, [Validators.required]],
            workerNationality: [data.nationality, [Validators.required]],
          });

          workerArray.push(workerFormGroup);
          const isWorkerNRICValid = this.immigrationService.validateNRIC(data.fin);
          this.workerNRICValidationStatus.push(isWorkerNRICValid);
        });
      if (existingData.length < workerCount) {
        const calculateAdditionalWorkerCount =
          workerCount - existingData.length;
        for (let i = 0; i < calculateAdditionalWorkerCount; i++) {
          const workerFormGroup = this.formBuilder.group({
            workerName: ['', [Validators.required]],
            workerFin: ['', [Validators.required]],
            workerNationality: ['', Validators.required],
          });

          this.workerArr.push(workerFormGroup);
        }
      }
    } else {
      this.noExsistingData();
    }
  }
  noExsistingData() {
    for (let i = 0; i < this.numberOfWorkers; i++) {
      const workerFormGroup = this.formBuilder.group({
        workerFin: ['', Validators.required],
        workerName: ['', Validators.required],

        workerNationality: ['', Validators.required],
      });

      this.workerArr.push(workerFormGroup);
    }
  }
  adjustFilesArray() {
    // Adjust the files array based on the number of workers
    if (this.workersList.length > this.numberOfWorkers) {
      this.workersList = this.workersList.slice(0, this.numberOfWorkers);
    }
  }
  get workerArr() {
    return this.policyForm.get('workerArr') as FormArray;
  }
  triggerFileInput() {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput.click();
  }

    // Load files if the 'isLoaded' flag is set in sessionStorage
  private loadFilesIfNeeded() {
    if (!this.quoteData.productJSON.risk.immigration_data.files) return;
    let filesData;
    filesData = this.quoteData.productJSON.risk.immigration_data.files;
    console.log('from files', filesData);

    this.workersList = Array.isArray(filesData) ? filesData : [filesData];
    //this.downloadFile();
  }

  onFileSelected(event: Event) {
    this.docsLimit = false;
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];

    if (file && file.type !== 'application/pdf') {
      this.showQutationModal(
        'File Format Error',
        `Please select a PDF file.`,
        true,
        false
      );
      input.value = ''; // Clear the invalid file
      return;
    }

    // Check for file size limit (10 MB = 10 * 1024 * 1024 bytes)
    const MAX_SIZE_MB = 10;
    const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
    if (file && file.size > MAX_SIZE_BYTES) {
      this.showQutationModal(
        'Error',
        `The uploaded file exceeds the maximum allowed size of ${MAX_SIZE_MB}MB.<br>Please try again with a smaller file.`,
        true,
        false
      );
      input.value = ''; // Clear the oversized file
      return;
    }

    if (input.files && input.files.length > 0) {
      if (this.workersList.length >= this.numberOfWorkers) {
        this.docsLimit = true;
        setTimeout(() => {
          this.docsLimit = false;
        }, 4000);
        return;
      }

      const file = input.files[0];
      const isDuplicate = this.workersList.some(
        (existingFile) => existingFile.fileName === file.name
      );

      if (isDuplicate) {
        const modalRef = this.modal.open(AgreeRequiredComponent, {
          size: 'md',
        });
        modalRef.componentInstance.msg = 'duplicate';
        input.value = '';
        return;
      }

      this.convertFileToBase64(file); // Process file
      input.value = ''; // Clear file input
    }
  }

  showQutationModal(
    title: string,
    message: string,
    showGoBack: boolean,
    showExit: boolean
  ) {
    const modalRef = this.modal.open(QuotationSubmitComponent, {
      size: 'md',
      backdrop: 'static',
      windowClass: 'no-fade',
    });

    modalRef.componentInstance.title = title;
    modalRef.componentInstance.message = message;
    modalRef.componentInstance.showGoBack = showGoBack;
    modalRef.componentInstance.showExit = showExit;
  }

  convertFileToBase64(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      let base64String = reader.result as string;

      const prefix = 'data:application/pdf;base64,';
      if (base64String.startsWith(prefix)) {
        base64String = base64String.substring(prefix.length);
      }

      const fileDetails = {
        fileName: file.name,
        base64String: base64String,
        id: '',
        name: '',
        fin: '',
        nationality: '',
      };
      this.files.push(fileDetails); // Add file to list

      // Upload and process the file for OCR
      this.uploadFile(fileDetails).then(() => {
        this.autoFillWorkers(); // Autofill fields after upload
      });

      if (this.workersList.length === this.numberOfWorkers) {
        this.fileCountMatch = true;
      }
    };

    reader.onerror = (error) => {
      console.error('Error reading file:', error);
    };

    reader.readAsDataURL(file);
  }

  async autoFillWorkers() {
    this.workers = [];
    let workerIndex = 0;
    this.workerNRICValidationStatus = [];
    let cpfSet = false;
    this.spinner.show('loadingWokerSpinner');

    for (const file of this.workersList) {
      try {

        const workersData = file;

        if (!cpfSet && workersData.cpf) {
          this.policyForm.get('cpf_no')?.setValue(workersData.cpf);
          cpfSet = true;
        }

        if (workerIndex < this.workerArr.length) {
          this.populatefields(workerIndex, workersData);
          this.autofilledFiles[workerIndex].name = workersData.name;
          workerIndex++;
        } else {
          console.error(
            'Number of workers exceeds initialized form array length'
          );
        }
        this.storageService.setSession(
          'autofilledFiles',
          JSON.stringify(this.autofilledFiles)
        );
        // this.storageService.setSession('files', JSON.stringify(this.files));
      } catch (error: any) {
        console.error('Error for file:', file.fileName, error);
        this.modal.open(SessionPopupComponent, {
          size: 'lg',
          backdrop: 'static',
        });
      }
    }
    this.spinner.hide('loadingWokerSpinner');
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
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

  async uploadFile(file: any) {
    this.spinner.show('loadingWokerSpinner');
    try {
      const sanitizedFileName = file.fileName
        .replace(/\s+/g, '-')
        .replace(/[^a-zA-Z0-9-]/g, '_');
      const response = await firstValueFrom(
        this.immigrationService.uploadWorkerDocuments(
          file.base64String,
          this.btoken,
          sanitizedFileName
        )
      );
    //   const fileIndex = this.files.findIndex(
    //     (f) => f.base64String === file.base64String
    //   );
    //   if (fileIndex > -1) {
    //     this.files[fileIndex].id = response.value; // Update file ID
    //   } else {
    //     console.warn('File not found in this.files array.');
    //   }
    //   this.storageService.setSession('files', JSON.stringify(this.files));
    // } catch (error: any) {
    //   console.error('Error for file:', file.fileName, error);
    //   this.modal.open(SessionPopupComponent, {
    //     size: 'md',
    //     backdrop: 'static',
    //   });
    // } finally {
    //   //empty
    // }
      const docID = response.value;
      await this.getOCRInformations(docID).then((response) => {
        let firstWorker = response;
        firstWorker.id = docID;
        firstWorker.fileName = file.fileName;
        this.workersList.push(firstWorker);
      });
      this.storageService.setSession('files', this.workersList);
    } catch (error: any) {
      console.error('Error uploading file:', file.fileName, error);
      // Check if error has a status code
      const status = error?.status;
      this.handleUploadError(status);
    } finally {
      this.spinner.hide('loadingWokerSpinner');
    }
  }

    private async getOCRInformations(docID: any) {
    this.spinner.show('loadingWokerSpinner');
    const response = await firstValueFrom(
      this.immigrationService.getOCR(this.btoken, docID).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            console.error('Authentication issue: Unauthorized access');
          } else {
            console.error('An error occurred:', error.message);
          }
          return throwError(() => error);
        })
      )
    );
    this.spinner.hide('loadingWokerSpinner');
    return response;
  }

  private handleUploadError(status: number): void {
    let title = 'Unexpected Error';
    let message =
      'An unknown error occurred during file upload. Please try again.';
    let back = true;
    let close = false;
    switch (status) {
      case 400:
        title = 'Upload Failed';
        message =
          'The document handling service (ELO server) is temporarily unavailable. Please try again in a few moments.';
        break;
      case 401:
        title = 'Session Expired';
        message =
          'Your session has expired. Please log in again to continue uploading files.';
        back = false;
        close = true;
        break;
      case 500:
        title = 'Server Error';
        message =
          'Something went wrong on our end. Please try again later or contact support if the issue persists.';
        break;
      case 503:
        title = 'Service Unavailable';
        message =
          'The upload service is currently unavailable. Please try again after some time.';
        break;
    }
    this.showQutationModal(title, message, back, close);
  }

  // Load btoken from sessionStorage
  private loadBToken() {
    const btoken = sessionStorage.getItem('btoken');
    if (btoken === null) {
      console.log('no btoken');
    } else {
      this.btoken = btoken;
    }
  }

  async downloadFile() {
    this.loadBToken();
    this.spinner.show('loadingSpinner');
    try {
      for (const file of this.workersList) {
        const response = await firstValueFrom(
          this.immigrationService.downloadWorkerDocuments(file.id, this.btoken)
        );
        if (response && typeof response === 'string') {
          const response = await firstValueFrom(
            this.immigrationService.downloadWorkerDocuments(file.id, this.btoken)
          );
          if (response && typeof response === 'string') {
            this.arrangeDocs(response, file);
          } else {
            console.warn('Unexpected response format:', response);
          }
        } else {
          console.warn('Unexpected response format:', response);
        }
      }
      // this.storageService.setSession('files', JSON.stringify(this.files));
    } catch (error: any) {
      if (error.status === 401) {
        console.error('Authentication issue: Unauthorized access');
      } else {
        console.error('Download Error', error.message);
      }
    } finally {
      this.spinner.hide('loadingSpinner'); // Hide the spinner after processing is complete
    }

    // this.storageService.setSession('files', JSON.stringify(this.files));
    sessionStorage.removeItem('isLoaded');
  }
  blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1]; // Remove the data URL prefix
        resolve(base64Data);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(blob);
    });
  }
  async arrangeDocs(response: any, file: any) {
    const prefix = 'data:application/pdf;base64,';
    const base64String = response.startsWith(prefix)
      ? response.substring(prefix.length)
      : response;

    // Convert Base64 string to Blob
    const byteCharacters = atob(base64String);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });

    // Convert Blob back to Base64 string
    const newBase64String = await this.blobToBase64(blob);

    // Assign the processed Base64 string to file.base64String
    file.base64String = newBase64String;
  }
  fromDateChange = ($event: any) => {
    this.fromDate = $event;
    if (this.fromDate) {
      const fromDate = new Date($event);
      let toDate = new Date(fromDate);

      let monthsToAdd = 0;

      if (
        this.quoteData.productJSON.risk.immigration_data.selected_bond_period === 14
      ) {
        monthsToAdd = 14;
      } else if (
        this.quoteData.productJSON.risk.immigration_data.selected_bond_period === 26
      ) {
        monthsToAdd = 26;
      }

      // Add the months to the toDate
      toDate.setMonth(toDate.getMonth() + monthsToAdd);

      // Handle end of month issues
      if (toDate.getDate() !== fromDate.getDate()) {
        toDate.setDate(0); // Set to the last day of the previous month
      }
      toDate.setDate(toDate.getDate() - 1);

      fromDate.setHours(23, 59, 59);
      toDate.setHours(23, 59, 59);

      // Patch the form value
      this.policyForm.patchValue({
        toDate: new Date(toDate),
      });

      // Call countDays function
      this.countDays();
    }
  };

  countDays = () => {
    const fromDate = this.fromDate;
    const toDate = new Date(fromDate);
    toDate.setFullYear(fromDate.getFullYear() + 1);
    fromDate.setHours(23, 59, 59);
    toDate.setHours(23, 59, 59);
    this.dateDifference = Math.floor(
      (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)
    );
  };
  toDateChange = () => {
    this.quoteData.policyTo = this.datePipe.transform(
      this.toDateModel,
      'MMM d, y hh:mm:ss a'
    );
  };

  // viewDocument(document: { fileName: string; base64String: string }): void {
  //   if (document && document.base64String) {
  //     // Remove the prefix if it's there
  //     let base64Data = document.base64String;
  //     const prefix = 'data:application/pdf;base64,';
  //     if (base64Data.startsWith(prefix)) {
  //       base64Data = base64Data.substring(prefix.length);
  //     }

  //     // Convert base64 to a Uint8Array
  //     const binaryString = window.atob(base64Data);
  //     const len = binaryString.length;
  //     const bytes = new Uint8Array(len);
  //     for (let i = 0; i < len; i++) {
  //       bytes[i] = binaryString.charCodeAt(i);
  //     }

  //     // Create a Blob object
  //     const blob = new Blob([bytes], { type: 'application/pdf' });

  //     // Create a URL for the Blob object
  //     const url = URL.createObjectURL(blob);

  //     // Open the PDF in a new tab
  //     window.open(url, '_blank');
  //   } else {
  //     console.error('Document base64 string is not available');
  //   }
  // }

    async viewDocuments(id: string) {
      console.log("Docuemnt ID for view" + id)
    this.spinner.show('loadingSpinner');
    try {
      const response = await firstValueFrom(
        this.immigrationService.downloadWorkerDocuments(id, this.btoken)
      );

      // Step 1: URL decode the string to get the correct padding
      let decodedResponse = decodeURIComponent(response);
      // Step 2: Replace any remaining incorrect padding (if necessary)
      decodedResponse = decodedResponse.replace(/\\u003d/g, '=');
      // Step 3: Decode the base64 string to binary data
      const byteCharacters = atob(decodedResponse);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });

      // Create a URL for the Blob
      const blobUrl = URL.createObjectURL(blob);

      // Open the PDF in a new Chrome tab
      this.spinner.hide('loadingSpinner');
      window.open(blobUrl, '_blank');
    } catch (error) {
      console.error('Error decoding base64:', error);
      this.spinner.hide('loadingSpinner');
    }
  }

deleteDocument(index: number): void {
  const deletedFile = this.autofilledFiles[index];

  // Remove from autofilledFiles and workersList arrays
  this.autofilledFiles.splice(index, 1);
  this.workersList.splice(index, 1);

  const total = this.workerArr.length;

  // Shift all form values up from index to second last
  for (let i = index; i < total - 1; i++) {
    const currentGroup = this.workerArr.at(i) as FormGroup;
    const nextGroup = this.workerArr.at(i + 1) as FormGroup;

    currentGroup.patchValue({
      workerFin: nextGroup.get('workerFin')?.value || '',
      workerName: nextGroup.get('workerName')?.value || '',
      workerNationality: nextGroup.get('workerNationality')?.value || '',
    });
  }

  // Clear the last form group
  const lastGroup = this.workerArr.at(total - 1) as FormGroup;
  lastGroup.patchValue({
    workerFin: '',
    workerName: '',
    workerNationality: '',
  });

  // Save updated arrays to session
  this.storageService.setSession('autofilledFiles', JSON.stringify(this.autofilledFiles));
  this.storageService.setSession('files', this.workersList);
}


  populatefields(workerIndex: any, workersData: any) {
    const workerFormGroup = this.workerArr.at(workerIndex) as FormGroup;

    const currentFin = workerFormGroup.get('workerFin')?.value;
    const currentName = workerFormGroup.get('workerName')?.value;
    const currentNationality = workerFormGroup.get('workerNationality')?.value;

    workerFormGroup.patchValue({
      workerFin: workersData.fin || currentFin,
      workerName: workersData.name || currentName,
      workerNationality: workersData.nationality || currentNationality || '',
    });

    const nationalityControl = workerFormGroup.get('workerNationality');
    const updatedNationality = nationalityControl?.value;

    // Check if updated nationality is valid
    const isWorkerNationalityValid = this.nationalityList.some(
      (nationality) => nationality.content === updatedNationality
    );

    // Mark control as dirty and touched if necessary
    nationalityControl?.markAsDirty();
    nationalityControl?.markAsTouched();
    nationalityControl?.updateValueAndValidity(); // Trigger validation

    this.worker_invalidNationality[workerIndex] = !isWorkerNationalityValid;

    const updatedFin = workerFormGroup.get('workerFin')?.value; // Get the current value of 'workerFin'
    const isWorkerNRICValid = this.immigrationService.validateNRIC(updatedFin);
    this.workerNRICValidationStatus.push(isWorkerNRICValid);

    if (!this.autofilledFiles[workerIndex]) {
      this.autofilledFiles[workerIndex] = { name: '' };
    }
  }
  removeSpaces(event: Event) {
    const input = event.target as HTMLInputElement;

    setTimeout(() => {
      const valueWithoutSpaces = input.value.replace(/\s+/g, '');
      this.policyForm.get('cpf_no')?.setValue(valueWithoutSpaces);
    }, 0);
  }
  handlePaste(event: ClipboardEvent) {
    event.preventDefault();

    const clipboardData = event.clipboardData as DataTransfer;
    let pastedText = clipboardData.getData('text');

    pastedText = pastedText.replace(/\s+/g, '');

    const input = event.target as HTMLInputElement;
    input.value = pastedText;

    this.policyForm.get('cpf_no')?.setValue(pastedText);
  }
  nricFinValidationCheck(event: any, index: number) {
    const inputElement = event.target as HTMLInputElement;
    const upperCaseValue = inputElement.value.toUpperCase();
    this.workerArr
      .at(index)
      .get('workerFin')
      ?.setValue(upperCaseValue, { emitEvent: false });
    const isNRICValid = this.immigrationService.validateNRIC(event.target.value);
    this.workerNRICValidationStatus[index] = isNRICValid;
  }
  searchNationality_travellers(event: Event, index: any) {
    const data = (event.target as HTMLInputElement).value;
    let output: any[] = [];
    if (data && data.trim() !== '') {
      for (const nationality of this.nationalityList) {
        if (nationality.content.toLowerCase().startsWith(data.toLowerCase())) {
          output.push(nationality);
        }
      }
      const workerFormArray = this.policyForm.get('workerArr') as FormArray;
      for (let i = 0; i < workerFormArray.length; i++) {
        if (i == index) {
          this.showWorkerNationalityDropdown[index] = true;

          this.dropDown_worker[index] = index;

          this.nationalityListSearchResults = output;
        }
      }
    } else {
      this.showWorkerNationalityDropdown[index] = false;
      this.nationalityListSearchResults = [];
    }
  }
  HideDropList_Nationality_travellers(event: Event, index: number) {
    setTimeout(() => {
      this.showWorkerNationalityDropdown[index] = false;

      const nationalityValue = (event.target as HTMLInputElement).value || '';

      const isValidNationality = this.nationalityList.some(
        (n: any) => n.content === nationalityValue
      );

      this.worker_invalidNationality[index] = !isValidNationality;
      const nationalityControl = this.workerArr
        .at(index)
        .get('workerNationality');
      nationalityControl?.markAsDirty();
      nationalityControl?.markAsTouched();
      nationalityControl?.updateValueAndValidity();
    }, 1000);
  }
  selectedNationality_travellers(selected: any, index: any) {
    const workerArray = this.policyForm.get('workerArr') as FormArray;
    const workerFormGroup = workerArray.at(index) as FormGroup;
    workerFormGroup.patchValue({
      workerNationality: selected.content,
    });
  }
  onBack() {
    this.router.navigate(['insured-information']);
  }
  hasDuplicate = function (data: any) {
    for (let i = 0; i < data.length; i++) {
      for (let x = i + 1; x < data.length; x++) {
        if (data[i] == data[x]) {
          return true;
        }
      }
    }
    return false;
  };
  checkDuplicatedNRIC = () => {
    let duplicatesFound = false;
    const finArr: string[] = [];

    // Iterate over workerArr and collect all workerFin values

    for (const worker of this.policyForm.value.workerArr) {
      finArr.push(worker.workerFin);
    }

    let duplicates = this.hasDuplicate(finArr);

    if (duplicates) {
      duplicatesFound = true;
    }
    return duplicatesFound;
  };
  nricValidationError = () => {
    const modalRef = this.modal.open(AgreeRequiredComponent, {
      size: 'md',
    });
    modalRef.componentInstance.msg = 'duplicateFIN';
  };
  onNext() {
    this.isSubmitted = true;
    const areAllAdultNRICValid = this.workerNRICValidationStatus.every(
      (isValid: boolean) => isValid
    );
    const areAllNationalitiesValid = this.worker_invalidNationality.every(
      (isValid) => !isValid
    );
    if (this.workersList.length == this.numberOfWorkers) {
      this.fileCountMatch = true;
    }

    this.quoteData.productJSON.risk.immigration_data.files = [];

    const workerFormArray = this.policyForm.get('workerArr') as FormArray;

    const filesToSubmit = this.workersList.map((file, index) => ({
      fileName: file.fileName,
      id: file.id,
      name: workerFormArray.at(index)?.get('workerName')?.value,
    }));
    this.autofilledFiles = this.workersList.map((file, index) => ({
      name: workerFormArray.at(index)?.get('workerName')?.value,
    }));
    this.storageService.setSession(
      'autofilledFiles',
      JSON.stringify(this.autofilledFiles)
    );
    this.quoteData.productJSON.risk.immigration_data.files.push(...filesToSubmit);

    if (
      this.policyForm.valid &&
      areAllAdultNRICValid &&
      areAllNationalitiesValid &&
      this.fileCountMatch
    ) {
      let duplicates = this.checkDuplicatedNRIC();
      if (duplicates) {
        this.nricValidationError();
        return;
      }

      this.quoteData.policyFrom = this.datePipe.transform(
        this.policyForm.value.fromDate,
        'MMM d, y hh:mm:ss a'
      );
      this.quoteData.policyTo = this.datePipe.transform(
        this.policyForm.value.toDate,
        'MMM d, y hh:mm:ss a'
      );

      const cpfNoValue: any = this.policyForm.get('cpf_no')?.value;

      if (typeof cpfNoValue === 'string') {
        // If cpfNoValue is a valid string, convert it to uppercase
        this.quoteData.productJSON.risk.immigration_data.cpf_no =
          cpfNoValue.toUpperCase();
      } else {
        this.quoteData.productJSON.risk.immigration_data.cpf_no = String(cpfNoValue);
      }
      this.workers = [];

      this.workers = filesToSubmit.map((file, index) => ({
        name: file.name,
        fin: workerFormArray.at(index)?.get('workerFin')?.value,
        nationality: workerFormArray.at(index)?.get('workerNationality')?.value,
      }));
      this.quoteData.productJSON.risk.immigration_data.workers = this.workers;

      this.spinner.show('loadingSpinner');
      this.quoteData = this.sanitizeAmpersands(this.quoteData);
      this.immigrationService.requestQuote(this.quoteData).subscribe({
        next: (response: any) => {
          this.quoteData = response;

          this.storageService.setSession('quoteData', this.quoteData);

          this.spinner.hide('loadingSpinner');
          this.router.navigate(['quotation']);
        },
        error: (error: any) => {
          this.spinner.hide('loadingSpinner');
        },
      });
    } else {
      const modalRef = this.modal.open(AgreeRequiredComponent, {
        size: 'lg',
      });
      modalRef.componentInstance.modalSize = 'lg';
      modalRef.componentInstance.msg = 'detailsMissing';
    }
  }

  onExit() {
    this.storageService.clear();
    window.close();
  }
}
