import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { AgreeRequiredComponent } from 'src/app/popups/agree-required/agree-required.component';
import { DirectRestrictComponent } from 'src/app/popups/direct-restrict/direct-restrict.component';
import { SessionStorageService } from 'src/app/services/session-storage.service';
import { StmgService } from 'src/app/services/stmg.service';
import { immigrationService } from '../../services/immigration.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

  quoteData: any;
   doHaveExisting: boolean = false;
   policyFrom: string = '';
   policyTo: string = '';
   id: number = 0;
   token: any;
   btoken:any;
   isLoaded: boolean = false;
 criteriaList:any ;
 showError: boolean = false;
 onDirect: boolean = false;
 selectedOption: string = 'Yes';
 premiumData:any;
   constructor(
     private router: Router,
     private immigrationService: immigrationService,
     private storageService: SessionStorageService,
     private routeActive: ActivatedRoute,
     private stmgService: StmgService,
     private datePipe: DatePipe,
     private openModal: NgbModal,
 
    private spinner: NgxSpinnerService,
 
   ) {}
   ngOnInit() {
 
       if (this.storageService.getSession('quoteData') != undefined) {
         this.quoteData = this.storageService.getSession('quoteData');
         console.log('my quote data', this.quoteData);
         if(this.storageService.getSession('isAgreed')){
           this.selectedOption= this.storageService.getSession('isAgreed');
         }
 
         
         this.loadInitialViewData();
   
       }
       else{
         this.routeActive.queryParams.subscribe((params) => {
           this.id = params['id'];
           this.token = params['token'];
           this.btoken = params['btoken'];
           sessionStorage.setItem("btoken",this.btoken)
         });
 
         if (this.id != undefined && this.token != undefined) {
           this.loadQuoteService();
           this.immigrationService.getBrokerHierarchy( this.btoken, "")
           .subscribe({
             next: (res) => {
               sessionStorage.setItem('brokerHierarchy', JSON.stringify(res));
               this.quoteData.productJSON.risk.intermediaryName=res.abbvName;
                 
             },
             error: (error) => {
             }
           });
         } else{
           this.onDirect = true;
           this.openModal.open(DirectRestrictComponent, {
             size: 'lg',
             backdrop: 'static',
           });
 
         }
 
       }
 
 
 
   }
   loadQuoteService(){
     this.spinner.show("loadingSpinner");
     this.immigrationService.loadQuote(this.id, this.token).subscribe({
       next: (response: any) => {
         this.quoteData = response;
         this.quoteData.policyFrom = this.datePipe.transform(
           this.quoteData.policyFrom,
           'MMM d, y hh:mm:ss a'
         );
         this.quoteData.policyTo = this.datePipe.transform(
           this.quoteData.policyTo,
           'MMM d, y hh:mm:ss a'
         );
         this.storageService.setSession('token', this.token);
         this.storageService.setSession('id', this.id);
         this.storageService.setSession('quoteData', this.quoteData);
 
         this.isLoaded = !this.isLoaded;
         this.stmgService.updateIsloaded(this.isLoaded);
         this.loadInitialViewData();
         this.spinner.hide("loadingSpinner");
       },
       error: (error: any) => {
         this.spinner.hide("loadingSpinner");
         
       },
     });
   }
   loadInitialViewData(){
 
 
 
 this.criteriaList = this.quoteData?.productJSON?.risk.immigration_options?.list.qualificationCriteria[0];
 this.premiumData= this.quoteData?.productJSON?.risk.immigration_options?.premiumData;
 
 
 
   }
 
   getQuote = () => {
 
   };
   onCancel(){
     this.storageService.clear();
     window.close();
   }
   onProceed(){
 
     if (this.selectedOption === 'Yes') {
       this.spinner.show("loadingSpinner");
       this.storageService.setSession('isAgreed', this.selectedOption);
       this.storageService.setSession('quoteData', this.quoteData);
       this.router.navigate(['add-employer']);
       setTimeout(() => {
         this.spinner.hide("loadingSpinner");
       }, 2000); 
      
     } else if(this.selectedOption === '') {
 
       this.showError = true;
     }
     else{
       const modalRef = this.openModal.open(AgreeRequiredComponent, {
         size: 'md',
        
       });
       modalRef.componentInstance.msg = 'disagree'; 
      
     }
   }
   onSelectChange(event: any){
     
     const selectElement = event.target as HTMLSelectElement;
     this.selectedOption = selectElement.value;
     this.showError = false;
   
    
     
   }

}
