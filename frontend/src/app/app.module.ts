import { NgModule,CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { CommonModule ,DatePipe} from '@angular/common';
import { FormsModule ,ReactiveFormsModule} from '@angular/forms';
import {
  NgbDateAdapter,
  NgbDateNativeAdapter,
  NgbModule,
} from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './app.component';
import { AboutComponent } from './pages/about/about.component';
import { AddEmployerComponent } from './pages/add-employer/add-employer.component';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';
import { FooterComponent } from './components/footer/footer.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { WorkerSpinnerComponent } from './components/worker-spinner/worker-spinner.component';

import { InsuredInformationComponent } from './pages/insured-information/insured-information.component';
import { PolicyComponent } from './pages/policy/policy.component';
import { QuotationComponent } from './pages/quotation/quotation.component';
import { PaymentComponent } from './pages/payment/payment.component';
import { DirectRestrictComponent } from './popups/direct-restrict/direct-restrict.component';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgxSpinnerModule } from 'ngx-spinner';
import { PayLinkComponent } from './popups/pay-link/pay-link.component';
import { SuccessComponent } from './pages/success/success.component';
import { NumericOnlyDirective } from './directives/numeric-only.directive';
import { AlphabetOnlyDirective } from './directives/alphabet-only.directive';
import { CapitalizeInputOnlyDirective } from './directives/capitalize-input-only.directive';
import { SessionPopupComponent } from './popups/session-popup/session-popup.component';
import { AgreeRequiredComponent } from './popups/agree-required/agree-required.component';
import { PaymentErrorComponent } from './pages/payment-error/payment-error.component';
import { PaymentLinkComponent } from './pages/payment-link/payment-link.component';
import { PaymentBackErrorComponent } from './popups/payment-back-error/payment-back-error.component';
import { ThankyouPopupComponent } from './popups/thankyou-popup/thankyou-popup.component';
import { CompleteComponent } from './pages/complete/complete.component';
import { SsicCodeExcludedComponent } from './popups/ssic-code-excluded/ssic-code-excluded.component';
import { QuoteExpiredComponent } from './popups/quote-expired/quote-expired.component';
import { QuotationSubmitComponent } from './popups/quotation-submit/quotation-submit.component';
import { HomeComponent } from './pages/home/home.component';

@NgModule({
  declarations: [
    AppComponent,
    AboutComponent,
    AddEmployerComponent,
    NavBarComponent,
    FooterComponent,
    SpinnerComponent,
    WorkerSpinnerComponent,
    InsuredInformationComponent,
    PolicyComponent,
    QuotationComponent,
    PaymentComponent,
    PayLinkComponent,
    SuccessComponent,
    DirectRestrictComponent,
    NumericOnlyDirective,
    AlphabetOnlyDirective,
    CapitalizeInputOnlyDirective,
    SessionPopupComponent,
    AgreeRequiredComponent,
    PaymentErrorComponent,
    PaymentLinkComponent,
    PaymentBackErrorComponent,
    ThankyouPopupComponent,
    CompleteComponent,
    SsicCodeExcludedComponent,
    QuoteExpiredComponent,
    QuotationSubmitComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    CommonModule,
    FormsModule ,
    ReactiveFormsModule,
    NgbModule,
    NgxSpinnerModule,
    BrowserAnimationsModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [  DatePipe,
    { provide: NgbDateAdapter, useClass: NgbDateNativeAdapter },],


  bootstrap: [AppComponent]
})
export class AppModule { }
